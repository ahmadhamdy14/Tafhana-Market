
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
          const existingCategory = data.category
            ? String(data.category).trim()
            : "";
          const isOfficial =
            OFFICIAL_CATEGORY_NAMES.includes(existingCategory);
          const existingSubcategory = data.subcategory
            ? String(data.subcategory).trim()
            : "";

          setForm({
            name: data.name || "",
            price: data.price !== undefined ? data.price : "",
            description: data.description || "",
            image: data.image || "",
            discount: data.discount !== undefined ? data.discount : "",
            category: isOfficial ? existingCategory : "",
            subcategory: existingSubcategory || "",
          });

          // Load options if existing
          const existingOptions = Array.isArray(data.options)
            ? data.options.map((grp) => ({
              ...grp,
              choices: (grp.choices || []).map((c) =>
                typeof c === "object" && c !== null
                  ? {
                    name: c.name || "",
                    price: Number(c.price) || 0,
                  }
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
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.price === "" || !form.image) {
      toast.warning("الرجاء ملء الاسم والسعر والصورة");
      return;
    }

    if (
      !form.category ||
      !OFFICIAL_CATEGORY_NAMES.includes(form.category)
    ) {
      toast.warning(
        "الرجاء اختيار قسم رسمي صحيح من القائمة"
      );
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
          toast.warning(
            "الرجاء إدخال اسم لكل مجموعة خيارات تم تفعيلها"
          );
          return;
        }

        if (validChoices.length === 0) {
          toast.warning(
            `الرجاء إضافة اختيار واحد على الأقل لمجموعة "${trimmedName}"`
          );
          return;
        }

        sanitizedOptions.push({
          id:
            grp.id ||
            `opt_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 5)}`,
          name: trimmedName,
          required: Boolean(grp.required),
          choices: validChoices,
        });
      }
    }

    try {
      setLoading(true);

      const trimmedSubcategory = form.subcategory ? form.subcategory.trim() : "";

      const updateData = {
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
      };

      const docRef = doc(db, "products", id);
      await updateDoc(docRef, updateData);

      toast.success("تم تحديث المنتج بنجاح 🎉");

      // Navigate to appropriate page after edit
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
      toast.error("حدث خطأ في تحديث المنتج");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="edit-product-container">
        <h2 style={{ color: "var(--text)" }}>
          جاري تحميل بيانات المنتج...
        </h2>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <div className="edit-product-card">
        <div
          style={{
            marginBottom: "15px",
            textAlign: "right",
          }}
        >
          <Link
            to="/store"
            style={{
              color: "var(--sub)",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
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
            ⚠️ هذا المنتج مصنف قديمًا كـ "
            <strong>{legacyCategory}</strong>". يرجى اختيار أحد الأقسام
            الرسمية الخمسة لحفظ التعديلات.
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label htmlFor="name">اسم المنتج (مطلوب)</label>
          <input
            name="name"
            placeholder="اسم المنتج (مطلوب)"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="price">السعر بالجنيه (مطلوب)</label>
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

          <label htmlFor="discount">نسبة الخصم % (اختياري)</label>
          <input
            name="discount"
            placeholder="نسبة الخصم % (اختياري)"
            type="number"
            min="0"
            max="100"
            value={form.discount}
            onChange={handleChange}
          />

          {/* Required Category Dropdown */}

          <label htmlFor="category">اختر قسم المنتج (مطلوب)</label>
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

            <label htmlFor="subcategory">القسم الفرعي (اختياري)</label>
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

          <label htmlFor="description"> ومواصفات المنتج</label>
          <textarea
            name="description"
            placeholder="الوصف ومواصفات المنتج"
            value={form.description}
            onChange={handleChange}
          />

          <label htmlFor="image">رابط الصورة (مطلوب)</label>
          <input
            name="image"
            placeholder="رابط الصورة (مطلوب)"
            value={form.image}
            onChange={handleChange}
            required
          />

          {/* خيارات المنتج (الأطعمة، الأحجام، النكهات...) */}
          <ProductOptionsEditor
            enabled={hasOptions}
            onToggleEnabled={setHasOptions}
            options={options}
            onChange={setOptions}
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
