import { useState, useEffect } from "react";
import "./EditProduct.css";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { generateKeywords } from "../../services/productService";
import {
  OFFICIAL_CATEGORY_NAMES,
  getCategoryByName,
  GROCERY_SUBCATEGORY_NAMES,
  getSubcategoryByName,
} from "../../constants/categories";
import ProductOptionsEditor from "../../components/ProductOptionsEditor/ProductOptionsEditor";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    discount: "",
    category: "",
    subcategory: "",
  });

  const [hasOptions, setHasOptions] = useState(false);
  const [options, setOptions] = useState([]);
  const [legacyCategory, setLegacyCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const existingCategory = data.category ? String(data.category).trim() : "";
          const isOfficial = OFFICIAL_CATEGORY_NAMES.includes(existingCategory);
          const existingSubcategory = data.subcategory ? String(data.subcategory).trim() : "";

          setForm({
            name: data.name || "",
            price: data.price !== undefined ? data.price : "",
            description: data.description || "",
            image: data.image || "",
            discount: data.discount !== undefined ? data.discount : "",
            category: isOfficial ? existingCategory : "",
            subcategory:
              existingCategory === "ط¨ظ‚ط§ظ„ط©" && GROCERY_SUBCATEGORY_NAMES.includes(existingSubcategory)
                ? existingSubcategory
                : "",
          });

          // Load options if existing
          const existingOptions = Array.isArray(data.options)
            ? data.options.map((grp) => ({
                ...grp,
                choices: (grp.choices || []).map((c) =>
                  typeof c === "object" && c !== null
                    ? { name: c.name || "", price: Number(c.price) || 0 }
                    : { name: String(c || ""), price: 0 }
                ),
              }))
            : [];
          if (existingOptions.length > 0) {
            setHasOptions(true);
            setOptions(existingOptions);
          } else {
            setHasOptions(false);
            setOptions([]);
          }

          if (!isOfficial && existingCategory) {
            setLegacyCategory(existingCategory);
          }
        } else {
          toast.error("ط§ظ„ظ…ظ†طھط¬ ط؛ظٹط± ظ…ظˆط¬ظˆط¯!");
          navigate("/store");
        }
      } catch (error) {
        console.error(error);
        toast.error("ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط¬ظ„ط¨ ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ظ†طھط¬");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category" && value !== "ط¨ظ‚ط§ظ„ط©") {
      // Clear subcategory if category is not ط¨ظ‚ط§ظ„ط©
      setForm({
        ...form,
        category: value,
        subcategory: "",
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.price === "" || !form.image) {
      toast.warning("ط§ظ„ط±ط¬ط§ط، ظ…ظ„ط، ط§ظ„ط§ط³ظ… ظˆط§ظ„ط³ط¹ط± ظˆط§ظ„طµظˆط±ط©");
      return;
    }

    if (!form.category || !OFFICIAL_CATEGORY_NAMES.includes(form.category)) {
      toast.warning("ط§ظ„ط±ط¬ط§ط، ط§ط®طھظٹط§ط± ظ‚ط³ظ… ط±ط³ظ…ظٹ طµط­ظٹط­ ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ط§ظ„ط®ظ…ط³ط©");
      return;
    }

    // Validate subcategory if category is ط¨ظ‚ط§ظ„ط©
    if (form.category === "ط¨ظ‚ط§ظ„ط©" && form.subcategory && !GROCERY_SUBCATEGORY_NAMES.includes(form.subcategory)) {
      toast.warning("ط§ظ„ط±ط¬ط§ط، ط§ط®طھظٹط§ط± ظ‚ط³ظ… ظپط±ط¹ظٹ طµط­ظٹط­ ظ…ظ† ط£ظ‚ط³ط§ظ… ط§ظ„ط¨ظ‚ط§ظ„ط©");
      return;
    }

    // Sanitize and validate options if enabled
    let sanitizedOptions = [];
    if (hasOptions) {
      for (const grp of options) {
        const trimmedName = (grp.name || "").trim();
        const validChoices = (grp.choices || [])
          .map((c) => {
            if (typeof c === "object" && c !== null) {
              const name = String(c.name || "").trim();
              const price = Math.max(0, Number(c.price) || 0);
              return name ? { name, price } : null;
            }
            const name = String(c || "").trim();
            return name ? { name, price: 0 } : null;
          })
          .filter(Boolean);

        if (!trimmedName) {
          toast.warning("ط§ظ„ط±ط¬ط§ط، ط¥ط¯ط®ط§ظ„ ط§ط³ظ… ظ„ظƒظ„ ظ…ط¬ظ…ظˆط¹ط© ط®ظٹط§ط±ط§طھ طھظ… طھظپط¹ظٹظ„ظ‡ط§");
          return;
        }
        if (validChoices.length === 0) {
          toast.warning(`ط§ظ„ط±ط¬ط§ط، ط¥ط¶ط§ظپط© ط§ط®طھظٹط§ط± ظˆط§ط­ط¯ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„ ظ„ظ…ط¬ظ…ظˆط¹ط© "${trimmedName}"`);
          return;
        }

        sanitizedOptions.push({
          id: grp.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: trimmedName,
          required: Boolean(grp.required),
          choices: validChoices,
        });
      }
    }

    try {
      setLoading(true);

      const updateData = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description ? form.description.trim() : "",
        image: form.image.trim(),
        category: form.category.trim(),
        discount: Number(form.discount) || 0,
        options: sanitizedOptions,
        searchKeywords: generateKeywords(form.name, form.description, sanitizedOptions),
      };

      // Add or clear subcategory field for ط¨ظ‚ط§ظ„ط© products
      if (form.category === "ط¨ظ‚ط§ظ„ط©" && form.subcategory) {
        updateData.subcategory = form.subcategory.trim();
      } else {
        updateData.subcategory = "";
      }

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, updateData);

      toast.success("طھظ… طھط­ط¯ظٹط« ط§ظ„ظ…ظ†طھط¬ ط¨ظ†ط¬ط§ط­ ًںژ‰");

      // Navigate to appropriate page after edit
      if (form.category === "ط¨ظ‚ط§ظ„ط©" && form.subcategory) {
        const subcat = getSubcategoryByName(form.subcategory);
        if (subcat) {
          navigate(`/store/bakala/${subcat.slug}`);
        } else {
          navigate("/store/bakala");
        }
      } else {
        const categoryObj = getCategoryByName(form.category);
        if (categoryObj) {
          navigate(`/store/${categoryObj.slug}`);
        } else {
          navigate("/store");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("ط­ط¯ط« ط®ط·ط£ ظپظٹ طھط­ط¯ظٹط« ط§ظ„ظ…ظ†طھط¬");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="edit-product-container">
        <h2 style={{ color: "var(--text)" }}>ط¬ط§ط±ظٹ طھط­ظ…ظٹظ„ ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ظ†طھط¬...</h2>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <div className="edit-product-card">
        <div style={{ marginBottom: "15px", textAlign: "right" }}>
          <Link to="/store" style={{ color: "var(--sub)", fontSize: "14px", textDecoration: "none" }}>
            â†گ ط§ظ„ط¹ظˆط¯ط© ظ„ظ„ظ…طھط¬ط±
          </Link>
        </div>

        <h2>âœڈï¸ڈ طھط¹ط¯ظٹظ„ ط§ظ„ظ…ظ†طھط¬</h2>

        {legacyCategory && !form.category && (
          <div
            style={{
              padding: "12px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid #f59e0b",
              borderRadius: "12px",
              color: "#fbbf24",
              fontSize: "13px",
              marginBottom: "15px",
              lineHeight: "1.5",
              textAlign: "right",
            }}
          >
            âڑ ï¸ڈ ظ‡ط°ط§ ط§ظ„ظ…ظ†طھط¬ ظ…طµظ†ظپ ظ‚ط¯ظٹظ…ط§ظ‹ ظƒظ€ "<strong>{legacyCategory}</strong>". ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ط£ط­ط¯ ط§ظ„ط£ظ‚ط³ط§ظ… ط§ظ„ط±ط³ظ…ظٹط© ط§ظ„ط®ظ…ط³ط© ظ„ط­ظپط¸ ط§ظ„طھط¹ط¯ظٹظ„ط§طھ.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="ط§ط³ظ… ط§ظ„ظ…ظ†طھط¬ (ظ…ط·ظ„ظˆط¨)"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            placeholder="ط§ظ„ط³ط¹ط± ط¨ط§ظ„ط¬ظ†ظٹظ‡ (ظ…ط·ظ„ظˆط¨)"
            type="number"
            min="0"
            step="any"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            name="discount"
            placeholder="ظ†ط³ط¨ط© ط§ظ„ط®طµظ… % (ط§ط®طھظٹط§ط±ظٹ)"
            type="number"
            min="0"
            max="100"
            value={form.discount}
            onChange={handleChange}
          />

          {/* ًںڈ·ï¸ڈ Required Category Dropdown */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="category-select"
          >
            <option value="" disabled>
              -- ط§ط®طھط± ظ‚ط³ظ… ط§ظ„ظ…ظ†طھط¬ (ظ…ط·ظ„ظˆط¨) --
            </option>
            {OFFICIAL_CATEGORY_NAMES.map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>

          {/* ًں§؛ Subcategory Dropdown (only for ط¨ظ‚ط§ظ„ط©) */}
          {form.category === "ط¨ظ‚ط§ظ„ط©" && (
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              className="category-select"
            >
              <option value="">
                -- ط§ط®طھط± ط§ظ„ظ‚ط³ظ… ط§ظ„ظپط±ط¹ظٹ (ط§ط®طھظٹط§ط±ظٹ) --
              </option>
              {GROCERY_SUBCATEGORY_NAMES.map((subName) => (
                <option key={subName} value={subName}>
                  {subName}
                </option>
              ))}
            </select>
          )}

          <textarea
            name="description"
            placeholder="ط§ظ„ظˆطµظپ ظˆظ…ظˆط§طµظپط§طھ ط§ظ„ظ…ظ†طھط¬"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="image"
            placeholder="ط±ط§ط¨ط· ط§ظ„طµظˆط±ط© (ظ…ط·ظ„ظˆط¨)"
            value={form.image}
            onChange={handleChange}
            required
          />

          {/* âڑ™ï¸ڈ ط®ظٹط§ط±ط§طھ ط§ظ„ظ…ظ†طھط¬ (ط§ظ„ط£ط·ط¹ظ…ط©طŒ ط§ظ„ط£ط­ط¬ط§ظ…طŒ ط§ظ„ظ†ظƒظ‡ط§طھ...) */}
          <ProductOptionsEditor
            enabled={hasOptions}
            onToggleEnabled={setHasOptions}
            options={options}
            onChange={setOptions}
          />

          <button type="submit" disabled={loading}>
            {loading ? "ط¬ط§ط±ظٹ ط§ظ„طھط­ط¯ظٹط«..." : "ط­ظپط¸ ط§ظ„طھط¹ط¯ظٹظ„ط§طھ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

