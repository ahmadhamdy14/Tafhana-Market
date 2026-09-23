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

const PRODUCTS_COLLECTION = "products";

/**
 * Generate a list of searchable lowercase keyword prefixes for a product name and description.
 * Allows prefix-based matching on any word in the name or description, case-insensitively.
 */
export const generateKeywords = (name = "", description = "") => {
  const nameLower = name.toLowerCase().trim();
  const descLower = description.toLowerCase().trim();
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
        const keywords = generateKeywords(data.name || "", data.description || "");
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
 * Fetch a page of normal products ordered by document ID (__name__).
 * 
 * @param {Object} options
 * @param {any} options.lastDoc - Last document snapshot for pagination
 * @param {number} options.limitCount - Number of products to fetch
 * @returns {Promise<{ products: Array, lastDoc: any, hasMore: boolean }>}
 */
export const fetchProducts = async ({ lastDoc = null, limitCount = 10 } = {}) => {
  let q;
  if (lastDoc) {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("__name__"),
      startAfter(lastDoc),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("__name__"),
      limit(limitCount)
    );
  }

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
 * Fetch a page of products matching a search query using searchable keywords array-contains.
 * 
 * @param {Object} options
 * @param {string} options.searchQuery - The search query term
 * @param {any} options.lastDoc - Last document snapshot for pagination
 * @param {number} options.limitCount - Number of products to fetch
 * @returns {Promise<{ products: Array, lastDoc: any, hasMore: boolean }>}
 */
export const fetchProductsSearch = async ({ searchQuery, lastDoc = null, limitCount = 10 }) => {
  const term = searchQuery.toLowerCase().trim();
  if (!term) {
    return {
      products: [],
      lastDoc: null,
      hasMore: false,
    };
  }

  let q;
  if (lastDoc) {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("searchKeywords", "array-contains", term),
      startAfter(lastDoc),
      limit(limitCount)
    );
  } else {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("searchKeywords", "array-contains", term),
      limit(limitCount)
    );
  }

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
