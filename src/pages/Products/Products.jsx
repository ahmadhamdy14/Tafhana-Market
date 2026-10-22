import { useEffect, useState, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { FavoritesContext } from "../../context/FavoritesContext";
import { deleteProduct } from "../../services/productService";
import { useProductsPagination } from "../../hooks/useProductsPagination";
import { useProductsSearch } from "../../hooks/useProductsSearch";
import { CATEGORIES, GROCERY_SUBCATEGORIES, getCategoryBySlug, getSubcategoryBySlug } from "../../constants/categories";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./Products.css";

const WHATSAPP_NUMBER = "201104152249";

const Products = () => {
  const { categorySlug, subcategorySlug } = useParams();

  // Determine if we're viewing a grocery subcategory
  const isAllBakala = categorySlug === "bakala" && subcategorySlug === "all";
  const currentSubcategory = (subcategorySlug && !isAllBakala) ? getSubcategoryBySlug(subcategorySlug) : null;

  // When viewing a subcategory or "all bakala", the parent category is "بقالة"
  const currentCategory = (currentSubcategory || isAllBakala)
    ? getCategoryBySlug("bakala")
    : categorySlug
      ? getCategoryBySlug(categorySlug)
      : null;

  const categoryFilter = currentCategory ? currentCategory.name : null;
  const subcategoryFilter = currentSubcategory ? currentSubcategory.name : null;
  const showSubcategoryPills = currentSubcategory || isAllBakala;

  const {
    products: normalProducts,
    loading: normalLoading,
    hasMore: normalHasMore,
    fetchNextPage: fetchNormalNextPage,
    deleteProductFromState: deleteNormalProduct,
  } = useProductsPagination(categoryFilter);

  const {
    search,
    setSearch,
    isSearchActive,
    products: searchProducts,
    loading: searchLoading,
    hasMore: searchHasMore,
    fetchNextPage: fetchSearchNextPage,
    deleteProductFromState: deleteSearchProduct,
  } = useProductsSearch(categoryFilter);

  const products = isSearchActive ? searchProducts : normalProducts;
  const loading = isSearchActive ? searchLoading : normalLoading;
  const hasMore = isSearchActive ? searchHasMore : normalHasMore;

  const [clickedId, setClickedId] = useState(null);
  const { userData } = useContext(AuthContext);
  const { cart, addToCart, decreaseQty } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchNextPageRef = useRef(null);
  fetchNextPageRef.current = isSearchActive ? fetchSearchNextPage : fetchNormalNextPage;

  const hasMoreRef = useRef(null);
  hasMoreRef.current = hasMore;

  const loadingRef = useRef(null);
  loadingRef.current = loading;

  // 🔄 Intersection Observer for Infinite Scroll
  useEffect(() => {
    const sentinel = document.getElementById("sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          if (fetchNextPageRef.current) {
            fetchNextPageRef.current();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, []);

  // ❌ Delete Logic
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(selectedId);

      deleteNormalProduct(selectedId);
      deleteSearchProduct(selectedId);

      setShowModal(false);
      setSelectedId(null);
    } catch (error) {
      console.log(error);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  // Build the back navigation path
  const backLink = (currentSubcategory || isAllBakala) ? "/store/bakala" : "/store";
  const backLabel = (currentSubcategory || isAllBakala) ? "الرجوع إلى أقسام البقالة" : "الرجوع إلى أقسام المتجر";

  return (
    <div className="products">
      {/* 🧭 Navigation Header */}
      <div className="products-top-navigation">
        <Link to={backLink} className="back-to-store-btn">
          <span>←</span> {backLabel}
        </Link>
        <Link to="/medical" className="go-to-medical-btn">
          الخدمات الطبية 🩺
        </Link>
      </div>

      {/* 🧭 Breadcrumb for subcategory / all bakala */}
      {(currentSubcategory || isAllBakala) && (
        <nav className="products-breadcrumb">
          <Link to="/">الرئيسية</Link>
          <span className="products-bc-sep">/</span>
          <Link to="/store">المتجر</Link>
          <span className="products-bc-sep">/</span>
          <Link to="/store/bakala">بقالة</Link>
          {currentSubcategory && (
            <>
              <span className="products-bc-sep">/</span>
              <span className="products-bc-current">{currentSubcategory.name}</span>
            </>
          )}
          {isAllBakala && (
            <>
              <span className="products-bc-sep">/</span>
              <span className="products-bc-current">الكل</span>
            </>
          )}
        </nav>
      )}

      <div className="products-header-container">
        {currentSubcategory ? (
          <div className="category-hero-header" style={{ "--cat-accent": currentSubcategory.accentColor }}>
            <div className="category-title-badge">
              <span className="cat-icon-lg">{currentSubcategory.icon}</span>
              <h1>{currentSubcategory.name}</h1>
              <span className="cat-en-sub">{currentSubcategory.nameEn}</span>
            </div>
            <p className="category-header-desc">{currentSubcategory.description}</p>
          </div>
        ) : currentCategory ? (
          <div className="category-hero-header" style={{ "--cat-accent": currentCategory.accentColor }}>
            <div className="category-title-badge">
              <span className="cat-icon-lg">{currentCategory.icon}</span>
              <h1>قسم {currentCategory.name}</h1>
              <span className="cat-en-sub">{currentCategory.nameEn}</span>
            </div>
            <p className="category-header-desc">{currentCategory.description}</p>
          </div>
        ) : (
          <div className="all-products-header">
            <h1>جميع المنتجات</h1>
            <p>تصفح كافة منتجات تفهنا ماركت في مكان واحد أو اختر قسماً محدداً</p>
          </div>
        )}
      </div>

      {/* 🏷️ Quick Category Pills Switcher */}
      {!currentSubcategory && (
        <div className="categories-filter">
          <Link
            to="/products"
            className={`category-btn ${!categoryFilter ? "active" : ""}`}
          >
            🌟 الكل
          </Link>
          {CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat.name;
            return (
              <Link
                key={cat.id}
                to={`/store/${cat.slug}`}
                className={`category-btn ${isActive ? "active" : ""}`}
                style={isActive ? { backgroundColor: cat.accentColor, borderColor: cat.accentColor } : {}}
              >
                <span>{cat.icon}</span> {cat.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* 🏷️ Subcategory Pills — shown when viewing bakala subcategory or all bakala */}
      {showSubcategoryPills && (
        <div className="categories-filter">
          <Link
            to="/store/bakala/all"
            className={`category-btn ${isAllBakala ? "active" : ""}`}
          >
            🌟 الكل
          </Link>
          {GROCERY_SUBCATEGORIES.map((sub) => {
            const isActive = subcategoryFilter === sub.name;
            return (
              <Link
                key={sub.id}
                to={`/store/bakala/${sub.slug}`}
                className={`category-btn ${isActive ? "active" : ""}`}
                style={isActive ? { backgroundColor: sub.accentColor, borderColor: sub.accentColor } : {}}
              >
                <span>{sub.icon}</span> {sub.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* 🔍 Search Input */}
      <div className="search-box">
        <input
          type="text"
          placeholder={
            currentSubcategory
              ? `ابحث داخل ${currentSubcategory.name}...`
              : currentCategory
                ? `ابحث داخل قسم ${currentCategory.name}...`
                : "ابحث عن أي منتج..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📦 Product Grid */}
      {(() => {
        const filteredProducts = products.filter((p) => {
          const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase()) ||
            (Array.isArray(p.options) &&
              p.options.some(
                (opt) =>
                  opt?.name?.toLowerCase().includes(search.toLowerCase()) ||
                  (Array.isArray(opt?.choices) &&
                    opt.choices.some((c) => {
                      const text = typeof c === "object" && c !== null ? c.name : String(c);
                      return String(text).toLowerCase().includes(search.toLowerCase());
                    }))
              ));
          const matchCategory = !categoryFilter || p.category === categoryFilter;

          // Subcategory filtering: if viewing a subcategory, only show products matching it
          const matchSubcategory = !subcategoryFilter || p.subcategory === subcategoryFilter;

          return matchSearch && matchCategory && matchSubcategory;
        });

        return (
          <>
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={userData?.role === "admin"}
                  onDeleteClick={handleDeleteClick}
                />
              ))}

              {/* ➕ Add Product (Admin Only) */}
              {userData?.role === "admin" && (
                <Link
                  to={`/add-product${categoryFilter
                      ? `?category=${encodeURIComponent(categoryFilter)}${subcategoryFilter
                        ? `&subcategory=${encodeURIComponent(subcategoryFilter)}`
                        : ""
                      }`
                      : ""
                    }`}
                  className="card add-card"
                >
                  <div className="card-body add-card-body">
                    <span className="plus">+</span>
                    <h3>
                      إضافة منتج
                      {subcategoryFilter
                        ? ` في ${subcategoryFilter}`
                        : categoryFilter
                          ? ` في قسم ${categoryFilter}`
                          : ""}
                    </h3>
                  </div>
                </Link>
              )}
            </div>

            {/* 📦 Empty state when no products match */}
            {filteredProducts.length === 0 && !loading && (
              <div className="search-empty-state">
                <div className="search-empty-icon">
                  {currentSubcategory ? currentSubcategory.icon : currentCategory ? currentCategory.icon : "🛒"}
                </div>
                <h3 className="search-empty-title">
                  {isSearchActive && search.trim()
                    ? `لم نجد منتجات تطابق "${search}"`
                    : `لا توجد منتجات في هذا القسم حالياً`}
                </h3>
                <p className="search-empty-desc">
                  هل تريد طلب هذا المنتج أو الاستفسار عنه؟ كلمنا عبر واتساب وسنوفر لك فوراً!
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    search.trim()
                      ? `مرحبا، أبحث عن المنتج "${search}" في تفهنا ماركت هل هو متوفر؟`
                      : `مرحبا، أود الاستفسار عن منتجات قسم ${subcategoryFilter || categoryFilter || "المتجر"}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="search-wa-btn"
                >
                  💬 اطلب المنتج عبر واتساب
                </a>
              </div>
            )}
          </>
        );
      })()}

      {/* 🌀 Infinite Scroll Sentinel & Loader */}
      <div id="sentinel" className="products-loader">
        {loading && (
          <div className="spinner-container">
            <div className="loading-spinner"></div>
            <span>جاري تحميل المنتجات...</span>
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <div className="no-more-products">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "مرحبا، لم أجد المنتج الذي أبحث عنه. هل يمكنكم مساعدتي؟"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="end-list-wa-link"
            >
              💬 لو ملقتش طلبك هنا؟ اطلبوا من علي الواتساب
            </a>
          </div>
        )}
      </div>

      {/* ⚠️ Delete Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>هل أنت متأكد من حذف هذا المنتج؟</h3>
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

export default Products;