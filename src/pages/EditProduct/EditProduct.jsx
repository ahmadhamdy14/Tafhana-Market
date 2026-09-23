import { useState, useEffect } from "react";
import "./EditProduct.css";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { generateKeywords } from "../../services/productService";

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

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            name: data.name || "",
            price: data.price || "",
            description: data.description || "",
            image: data.image || "",
            discount: data.discount || "",
            category: data.category || "",
          });
        } else {
          toast.error("Product not found!");
          navigate("/products");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching product");
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

    if (!form.name || !form.price || !form.image) {
      toast.warning("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        image: form.image,
        category: form.category ? form.category.trim() : "متنوعة",
        discount: Number(form.discount) || 0,
        searchKeywords: generateKeywords(form.name, form.description),
      });

      toast.success("تم تحديث المنتج بنجاح 🎉");
      navigate("/products");
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ في تحديث المنتج");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="edit-product-container"><h2>Loading...</h2></div>;

  return (
    <div className="edit-product-container">
      <div className="edit-product-card">
        <h2>✏️ تعديل المنتج</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="اسم المنتج"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="price"
            placeholder="السعر"
            type="number"
            value={form.price}
            onChange={handleChange}
          />

          <input
            name="discount"
            placeholder="نسبه الخصم (اختياري)"
            type="number"
            value={form.discount}
            onChange={handleChange}
          />

          <input
            name="category"
            placeholder="القسم"
            value={form.category}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="الوصف"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="image"
            placeholder="رابط الصوره"
            value={form.image}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "جاري التحديث.." : "تحديث المنتج"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
