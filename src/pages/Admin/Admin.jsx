import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { fetchUncategorizedProducts, updateProductCategory } from "../../services/productService";
import { OFFICIAL_CATEGORY_NAMES } from "../../constants/categories";
import { toast } from "react-toastify";
import "./Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");
  
  // Users state
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Uncategorized products state
  const [uncategorizedProducts, setUncategorizedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [savingProductId, setSavingProductId] = useState(null);
  const [productSearch, setProductSearch] = useState("");

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Fetch uncategorized products
  const loadUncategorizedProducts = async () => {
    try {
      setLoadingProducts(true);
      const list = await fetchUncategorizedProducts();
      setUncategorizedProducts(list);
    } catch (err) {
      console.error("Error fetching uncategorized products:", err);
      toast.error("حدث خطأ أثناء تحميل المنتجات غير المصنفة");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadUncategorizedProducts();
  }, []);

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success("تم تحديث صلاحية المستخدم");
    } catch (error) {
      console.error(error);
      toast.error("فشل تحديث الصلاحية");
    }
  };

  // Handle user delete
  const handleDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const userRef = doc(db, "users", selectedUserId);
      await deleteDoc(userRef);
      setUsers(users.filter((u) => u.id !== selectedUserId));
      setShowModal(false);
      setSelectedUserId(null);
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل حذف المستخدم");
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  // Handle quick category assignment for uncategorized product
  const handleCategorySelection = (productId, category) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [productId]: category,
    }));
  };

  const handleSaveProductCategory = async (product) => {
    const chosenCategory = selectedCategories[product.id];
    if (!chosenCategory || !OFFICIAL_CATEGORY_NAMES.includes(chosenCategory)) {
      toast.warning("من فضلك اختر قسماً رسمياً أولاً");
      return;
    }

    try {
      setSavingProductId(product.id);
      await updateProductCategory(product.id, chosenCategory);
      toast.success(`تم نقل "${product.name}" بنجاح إلى قسم ${chosenCategory} 🎉`);

      // Remove from uncategorized list in UI
      setUncategorizedProducts((prev) => prev.filter((p) => p.id !== product.id));
      setSelectedCategories((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء حفظ القسم");
    } finally {
      setSavingProductId(null);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const roleWeight = { admin: 3, editor: 2, user: 1 };
    const weightA = roleWeight[a.role] || 1;
    const weightB = roleWeight[b.role] || 1;
    if (weightA !== weightB) return weightB - weightA;

    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
    return dateA - dateB;
  });

  const filteredUncategorized = uncategorizedProducts.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.rawCategory?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-container">
      <div className="admin-header-row">
        <h1 className="admin-title">👑 لوحة التحكم الإدارية</h1>
        <div className="admin-quick-links">
          <Link to="/store" className="admin-nav-link">
            🛒 تصفح المتجر
          </Link>
          <Link to="/add-product" className="admin-nav-link add-btn-nav">
            ➕ إضافة منتج جديد
          </Link>
        </div>
      </div>

      {/* 📑 Admin Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 إدارة المستخدمين ({users.length})
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "uncategorized" ? "active" : ""}`}
          onClick={() => setActiveTab("uncategorized")}
        >
          📦 منتجات تحتاج تصنيف
          {uncategorizedProducts.length > 0 ? (
            <span className="admin-badge-count warning">
              {uncategorizedProducts.length}
            </span>
          ) : (
            <span className="admin-badge-count success">0</span>
          )}
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="tab-content-panel">
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>البريد الالكتروني</th>
                  <th>رقم الهاتف</th>
                  <th>الجنس</th>
                  <th>الصلاحية</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {sortedUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      {user.firstName} {user.lastName}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.gender}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`role-select ${user.role}`}
                      >
                        <option value="user">مستخدم</option>
                        <option value="editor">محرر (Editor)</option>
                        <option value="admin">مشرف</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="admin-delete-btn"
                      >
                        🗑️ حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UNCATEGORIZED PRODUCTS MANAGEMENT */}
      {activeTab === "uncategorized" && (
        <div className="tab-content-panel">
          <div className="uncategorized-header-info">
            <div className="info-text">
              <h3>📦 إدارة تصنيف المنتجات الحالية</h3>
              <p>
                المنتجات أدناه لا تملك قسماً رسمياً أو تحتوي على تصنيفات قديمة.
                اختر القسم المناسب من القائمة واضغط "حفظ القسم" لينتقل المنتج فوراً إلى قسمه الصحيح في المتجر.
              </p>
            </div>
            <button
              onClick={loadUncategorizedProducts}
              className="refresh-btn"
              disabled={loadingProducts}
            >
              🔄 {loadingProducts ? "جاري التحديث..." : "إعادة فحص المنتجات"}
            </button>
          </div>

          {/* Search bar inside uncategorized products */}
          {uncategorizedProducts.length > 0 && (
            <div className="uncategorized-search-box">
              <input
                type="text"
                placeholder="ابحث في المنتجات غير المصنفة بالاسم..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          )}

          {loadingProducts ? (
            <div className="admin-loading-state">
              <div className="admin-spinner"></div>
              <span>جاري فحص قاعدة البيانات وجلب المنتجات...</span>
            </div>
          ) : uncategorizedProducts.length === 0 ? (
            <div className="uncategorized-empty-state">
              <span className="empty-icon">🎉</span>
              <h3>رائع جداً! جميع المنتجات مصنفة بالكامل</h3>
              <p>
                كافة المنتجات في متجرك مرتبطة الآن بإحدى الأقسام الرسمية الخمسة وتظهر بشكل سليم لعملائك.
              </p>
              <Link to="/store" className="go-to-store-link">
                تصفح أقسام المتجر الآن 🛒
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table uncategorized-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الصورة</th>
                    <th>اسم المنتج</th>
                    <th>السعر</th>
                    <th>التصنيف الحالي/القديم</th>
                    <th>تعيين القسم الجديد (مطلوب)</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUncategorized.map((product, index) => {
                    const currentSelection =
                      selectedCategories[product.id] || "";
                    const isSaving = savingProductId === product.id;

                    return (
                      <tr key={product.id}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-admin-thumb"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                          {product.description && (
                            <div className="product-desc-preview">
                              {product.description.slice(0, 45)}...
                            </div>
                          )}
                        </td>
                        <td>{product.price} ج.م</td>
                        <td>
                          <span className="raw-cat-tag">
                            {product.rawCategory}
                          </span>
                        </td>
                        <td>
                          <select
                            value={currentSelection}
                            onChange={(e) =>
                              handleCategorySelection(product.id, e.target.value)
                            }
                            className="cat-assign-select"
                          >
                            <option value="">-- اختر القسم --</option>
                            {OFFICIAL_CATEGORY_NAMES.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="product-action-btns">
                            <button
                              onClick={() => handleSaveProductCategory(product)}
                              className="save-cat-btn"
                              disabled={isSaving || !currentSelection}
                            >
                              {isSaving ? "جاري الحفظ..." : "💾 حفظ القسم"}
                            </button>
                            <Link
                              to={`/edit-product/${product.id}`}
                              className="full-edit-link"
                            >
                              ✏️ تعديل كامل
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ⚠️ User Delete Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>هل أنت متأكد من حذف هذا المستخدم؟</h3>
            <div className="modal-actions">
              <button className="yes-btn" onClick={confirmDelete}>
                نعم
              </button>
              <button className="no-btn" onClick={cancelDelete}>
                لا
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
