import { useState } from "react";
import "./AddProduct.css";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { generateKeywords } from "../../services/productService";
import {
  OFFICIAL_CATEGORY_NAMES,
  getCategoryByName,
  GROCERY_SUBCATEGORY_NAMES,
  getSubcategoryByName,
} from "../../constants/categories";
import ProductOptionsEditor from "../../components/ProductOptionsEditor/ProductOptionsEditor";

const AddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromQuery = searchParams.get("category") || "";
  const subcategoryFromQuery = searchParams.get("subcategory") || "";

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    discount: "",
    category: OFFICIAL_CATEGORY_NAMES.includes(categoryFromQuery)
      ? categoryFromQuery
      : "",
    subcategory: subcategoryFromQuery || "",
  });

  const [hasOptions, setHasOptions] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.image) {
      toast.warning("الرجاء إدخال اسم وسعر وصورة المنتج");
      return;
    }

    if (!form.category || !OFFICIAL_CATEGORY_NAMES.includes(form.category)) {
      toast.warning("الرجاء اختيار قسم صحيح للمنتج من القائمة");
      return;
    }

    // Validate subcategory if category is بقالة
    if (form.category === "بقالة" && form.subcategory && !GROCERY_SUBCATEGORY_NAMES.includes(form.subcategory)) {
      toast.warning("الرجاء اختيار قسم فرعي صحيح من أقسام البقالة");
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
          toast.warning("الرجاء إدخال اسم لكل مجموعة خيارات تم تفعيلها");
          return;
        }
        if (validChoices.length === 0) {
          toast.warning(`الرجاء إضافة اختيار واحد على الأقل لمجموعة "${trimmedName}"`);
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

      const trimmedSubcategory = form.subcategory ? form.subcategory.trim() : "";

      const productData = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description ? form.description.trim() : "",
        image: form.image.trim(),
        category: form.category.trim(),
        subcategory: trimmedSubcategory,
        discount: Number(form.discount) || 0,
        options: sanitizedOptions,
        searchKeywords: generateKeywords(
          form.name,
          form.description,
          sanitizedOptions,
          trimmedSubcategory
        ),
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products"), productData);

      toast.success("تمت إضافة المنتج بنجاح 🎉");

      // Navigate to appropriate page after add
      if (form.category === "بقالة" && trimmedSubcategory) {
        const subcat = getSubcategoryByName(trimmedSubcategory);
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
      toast.error("حدث خطأ أثناء إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <div style={{ marginBottom: "15px", textAlign: "right" }}>
          <Link to="/store" style={{ color: "var(--sub)", fontSize: "14px", textDecoration: "none" }}>
            ← العودة للمتجر
          </Link>
        </div>

        <h2>➕ إضافة منتج جديد</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="اسم المنتج (مطلوب)"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            placeholder="السعر بالجنيه (مطلوب)"
            type="number"
            min="0"
            step="any"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            name="discount"
            placeholder="نسبة الخصم % (اختياري)"
            type="number"
            min="0"
            max="100"
            value={form.discount}
            onChange={handleChange}
          />

          {/* 🏷️ Required Category Dropdown */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="category-select"
          >
            <option value="" disabled>
              -- اختر قسم المنتج (مطلوب) --
            </option>
            {OFFICIAL_CATEGORY_NAMES.map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>

          {/* 🧺 Subcategory Input with free typing and datalist suggestions */}
          <div className="subcategory-field-group">
            <input
              type="text"
              name="subcategory"
              list="subcategories-suggestions"
              placeholder="القسم الفرعي (اختياري - اكتب أي قسم فرعي تريده)"
              value={form.subcategory}
              onChange={handleChange}
              autoComplete="off"
            />
            <datalist id="subcategories-suggestions">
              {GROCERY_SUBCATEGORY_NAMES.map((subName) => (
                <option key={subName} value={subName} />
              ))}
            </datalist>
            <small style={{ color: "var(--sub)", fontSize: "12px", display: "block", marginTop: "4px", textAlign: "right" }}>
              💡 يمكنك كتابة أي اسم قسم فرعي، وسيتم استخدامه في البحث داخل القسم بالاسم المكتوب.
            </small>
          </div>

          <textarea
            name="description"
            placeholder="وصف المنتج ومواصفاته"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="image"
            placeholder="رابط الصورة (مطلوب)"
            value={form.image}
            onChange={handleChange}
            required
          />

          {/* ⚙️ خيارات المنتج (الأطعمة، الأحجام، النكهات...) */}
          <ProductOptionsEditor
            enabled={hasOptions}
            onToggleEnabled={setHasOptions}
            options={options}
            onChange={setOptions}
          />

          <button type="submit" disabled={loading}>
            {loading ? "جاري الإضافة..." : "إضافة المنتج"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;