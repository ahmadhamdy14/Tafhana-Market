import { useState } from "react";
import "./AddProduct.css";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { generateKeywords } from "../../services/productService";

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    discount: "",
    category: "",
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
      toast.warning("الرجاء ملء البيانات المطلوبة");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "products"), {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        image: form.image,
        category: form.category ? form.category.trim() : "متنوع",
        discount: Number(form.discount) || 0,
        searchKeywords: generateKeywords(form.name, form.description),
        createdAt: new Date(),
      });

      toast.success("تمت إضافة المنتج بنجاح");
      navigate("/");
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
        <h2>➕ إضافة منتج جديد</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="اسم المنتج"
            onChange={handleChange}
          />

          <input
            name="price"
            placeholder="السعر"
            type="number"
            onChange={handleChange}
          />

          {/* 👇 الجديد */}
          <input
            name="discount"
            placeholder="نسبه الخصم %"
            type="number"
            onChange={handleChange}
          />

          <input
            name="category"
            placeholder="القسم"
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="الوصف"
            onChange={handleChange}
          />

          <input
            name="image"
            placeholder="رابط الصورة"
            onChange={handleChange}
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