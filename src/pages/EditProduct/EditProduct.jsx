import { useState, useEffect } from "react";
import "./EditProduct.css";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { generateKeywords } from "../../services/productService";
import { OFFICIAL_CATEGORY_NAMES, getCategoryByName } from "../../constants/categories";

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
  });

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

          setForm({
            name: data.name || "",
            price: data.price !== undefined ? data.price : "",
            description: data.description || "",
            image: data.image || "",
            discount: data.discount !== undefined ? data.discount : "",
            category: isOfficial ? existingCategory : "",
          });

          if (!isOfficial && existingCategory) {
            setLegacyCategory(existingCategory);
          }
        } else {
          toast.error("المنتج غير موجود!");
          navigate("/store");
        }
      } catch (error) {
        console.error(error);
        toast.error("حدث خطأ أثناء جلب بيانات المنتج");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.price === "" || !form.image) {
      toast.warning("الرجاء ملء الاسم والسعر والصورة");
      return;
    }

    if (!form.category || !OFFICIAL_CATEGORY_NAMES.includes(form.category)) {
      toast.warning("الرجاء اختيار قسم رسمي صحيح من القائمة الخمسة");
      return;
    }

    try {
      setLoading(true);

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description ? form.description.trim() : "",
        image: form.image.trim(),
        category: form.category.trim(),
        discount: Number(form.discount) || 0,
        searchKeywords: generateKeywords(form.name, form.description),
      });

      toast.success("تم تحديث المنتج بنجاح 🎉");
      const categoryObj = getCategoryByName(form.category);
      if (categoryObj) {
        navigate(`/store/${categoryObj.slug}`);
      } else {
        navigate("/store");
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ في تحديث المنتج");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="edit-product-container">
        <h2 style={{ color: "var(--text)" }}>جاري تحميل بيانات المنتج...</h2>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <div className="edit-product-card">
        <div style={{ marginBottom: "15px", textAlign: "right" }}>
          <Link to="/store" style={{ color: "var(--sub)", fontSize: "14px", textDecoration: "none" }}>
            ← العودة للمتجر
          </Link>
        </div>

        <h2>✏️ تعديل المنتج</h2>

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
            ⚠️ هذا المنتج مصنف قديماً كـ "<strong>{legacyCategory}</strong>". يرجى اختيار أحد الأقسام الرسمية الخمسة لحفظ التعديلات.
          </div>
        )}

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
            placeholder="الوصف ومواصفات المنتج"
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
            {loading ? "جاري التحديث..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
