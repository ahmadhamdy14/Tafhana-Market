import { useState } from "react";
import "./AddProduct.css";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { generateKeywords } from "../../services/productService";
import { OFFICIAL_CATEGORY_NAMES, getCategoryByName } from "../../constants/categories";

const AddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromQuery = searchParams.get("category") || "";

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    discount: "",
    category: OFFICIAL_CATEGORY_NAMES.includes(categoryFromQuery)
      ? categoryFromQuery
      : "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

    try {
      setLoading(true);

      await addDoc(collection(db, "products"), {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description ? form.description.trim() : "",
        image: form.image.trim(),
        category: form.category.trim(),
        discount: Number(form.discount) || 0,
        searchKeywords: generateKeywords(form.name, form.description),
        createdAt: new Date(),
      });

      toast.success("تمت إضافة المنتج بنجاح 🎉");
      const categoryObj = getCategoryByName(form.category);
      if (categoryObj) {
        navigate(`/store/${categoryObj.slug}`);
      } else {
        navigate("/store");
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

          <button type="submit" disabled={loading}>
            {loading ? "جاري الإضافة..." : "إضافة المنتج"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;