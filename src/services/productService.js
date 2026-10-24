import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { OFFICIAL_CATEGORY_NAMES } from "../constants/categories";

const PRODUCTS_COLLECTION = "products";

/**
 * Generate a list of searchable lowercase keyword prefixes for a product name and description.
 * Allows prefix-based matching on any word in the name or description, case-insensitively.
 */
export const generateKeywords = (name = "", description = "", options = [], subcategory = "") => {
  const nameLower = name.toLowerCase().trim();
  const descLower = description.toLowerCase().trim();
  const subLower = String(subcategory || "").toLowerCase().trim();
  const keywords = new Set();

  // 1. Generate prefixes of the entire name
  if (nameLower) {
    for (let i = 1; i <= nameLower.length; i++) {
      keywords.add(nameLower.slice(0, i));
    }
  }

  // 2. Generate prefixes of each word in the name
  const nameWords = nameLower.split(/\s+/).filter(Boolean);
  for (const word of nameWords) {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
    if (!cleanWord) continue;
    for (let i = 1; i <= cleanWord.length; i++) {
      keywords.add(cleanWord.slice(0, i));
    }
  }

  // 3. Generate prefixes of each word in the description
  if (descLower) {
    const descWords = descLower.split(/\s+/).filter(Boolean);
    for (const word of descWords) {
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
      if (!cleanWord) continue;
      for (let i = 1; i <= cleanWord.length; i++) {
        keywords.add(cleanWord.slice(0, i));
      }
    }
  }

  // 4. Generate prefixes of words in subcategory (allows searching products by their subcategory name)
  if (subLower) {
    for (let i = 1; i <= subLower.length; i++) {
      keywords.add(subLower.slice(0, i));
    }
    const subWords = subLower.split(/\s+/).filter(Boolean);
    for (const word of subWords) {
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
      if (!cleanWord) continue;
      for (let i = 1; i <= cleanWord.length; i++) {
        keywords.add(cleanWord.slice(0, i));
      }
    }
  }

  // 5. Generate prefixes of words in option group names and choices
  if (Array.isArray(options)) {
    for (const opt of options) {
      if (opt && opt.name) {
        const optWords = String(opt.name).toLowerCase().trim().split(/\s+/).filter(Boolean);
        for (const word of optWords) {
          const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
          if (!cleanWord) continue;
          for (let i = 1; i <= cleanWord.length; i++) {
            keywords.add(cleanWord.slice(0, i));
          }
        }
      }
      if (opt && Array.isArray(opt.choices)) {
        for (const choice of opt.choices) {
          if (!choice) continue;
          const choiceText = typeof choice === "object" && choice !== null ? choice.name : choice;
          if (!choiceText) continue;
          const choiceWords = String(choiceText).toLowerCase().trim().split(/\s+/).filter(Boolean);
          for (const word of choiceWords) {
            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
            if (!cleanWord) continue;
            for (let i = 1; i <= cleanWord.length; i++) {
              keywords.add(cleanWord.slice(0, i));
            }
          }
        }
      }
    }
  }

  return Array.from(keywords);
};

/**
 * Migrate existing product documents to include searchKeywords if missing.
 */
export const migrateProductsKeywords = async () => {
  try {
    console.log("[Migration] Checking products database for missing searchKeywords...");
    const q = query(collection(db, PRODUCTS_COLLECTION));
    const snapshot = await getDocs(q);

    let migratedCount = 0;
    const promises = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (!data.searchKeywords) {
        const keywords = generateKeywords(
          data.name || "",
          data.description || "",
          data.options || [],
          data.subcategory || ""
        );
        migratedCount++;
        promises.push(
          updateDoc(doc(db, PRODUCTS_COLLECTION, docSnap.id), {
            searchKeywords: keywords,
          })
        );
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      console.log(`[Migration] Successfully migrated ${migratedCount} products with searchKeywords.`);
    } else {
      console.log("[Migration] All products are up-to-date with searchKeywords.");
    }
  } catch (error) {
    console.error("[Migration] Error running products keywords migration:", error);
  }
};

/**
 * Delete a product by its ID.
 */
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

/**
 * Fetch a page of products ordered by document ID (__name__), optionally filtered by category.
 * 
 * @param {Object} options
 * @param {string|null} options.category - Category name to filter by (or null for all)
 * @param {any} options.lastDoc - Last document snapshot for pagination
 * @param {number} options.limitCount - Number of products to fetch
 * @returns {Promise<{ products: Array, lastDoc: any, hasMore: boolean }>}
 */
export const fetchProducts = async ({ category = null, lastDoc = null, limitCount = 10 } = {}) => {
  let constraints = [];

  if (category && category !== "الكل") {
    constraints.push(where("category", "==", category));
  } else {
    constraints.push(orderBy("__name__"));
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const nextLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  const hasMore = snapshot.docs.length === limitCount;

  return {
    products,
    lastDoc: nextLastDoc,
    hasMore,
  };
};

/**
 * Fetch a page of products matching a search query using searchable keywords array-contains,
 * optionally filtered by category.
 * 
 * @param {Object} options
 * @param {string} options.searchQuery - The search query term
 * @param {string|null} options.category - Category name to filter by (or null for all)
 * @param {any} options.lastDoc - Last document snapshot for pagination
 * @param {number} options.limitCount - Number of products to fetch
 * @returns {Promise<{ products: Array, lastDoc: any, hasMore: boolean }>}
 */
export const fetchProductsSearch = async ({ searchQuery, category = null, lastDoc = null, limitCount = 10 }) => {
  const term = searchQuery.toLowerCase().trim();
  if (!term) {
    return {
      products: [],
      lastDoc: null,
      hasMore: false,
    };
  }

  let constraints = [where("searchKeywords", "array-contains", term)];
  if (category && category !== "الكل") {
    constraints.push(where("category", "==", category));
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }
  constraints.push(limit(limitCount));

  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const nextLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    const hasMore = snapshot.docs.length === limitCount;

    return {
      products,
      lastDoc: nextLastDoc,
      hasMore,
    };
  } catch (error) {
    console.warn("Category search composite query fallback:", error);
    // Fallback: search by keywords and filter in memory
    let fallbackConstraints = [where("searchKeywords", "array-contains", term)];
    if (lastDoc) fallbackConstraints.push(startAfter(lastDoc));
    fallbackConstraints.push(limit(limitCount * 2));

    const fallbackQ = query(collection(db, PRODUCTS_COLLECTION), ...fallbackConstraints);
    const snapshot = await getDocs(fallbackQ);
    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (category && category !== "الكل") {
      products = products.filter((p) => p.category === category);
    }

    const nextLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    const hasMore = snapshot.docs.length === limitCount * 2;

    return {
      products,
      lastDoc: nextLastDoc,
      hasMore,
    };
  }
};

/**
 * Fetch products that do not have an official category assigned.
 * Safe for backward compatibility with existing ~500 products.
 */
export const fetchUncategorizedProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const uncategorized = [];

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const cat = data.category ? String(data.category).trim() : "";
    if (!cat || !OFFICIAL_CATEGORY_NAMES.includes(cat)) {
      uncategorized.push({
        id: docSnap.id,
        ...data,
        rawCategory: cat || "غير مصنف",
      });
    }
  });

  return uncategorized;
};

/**
 * Safely update a product's category in Firestore.
 */
export const updateProductCategory = async (productId, newCategory) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await updateDoc(productRef, {
    category: newCategory,
  });
};

