import { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { FavoritesContext } from "../../context/FavoritesContext";
import { deleteProduct } from "../../services/productService";
import { useProductsPagination } from "../../hooks/useProductsPagination";
import { useProductsSearch } from "../../hooks/useProductsSearch";
import "./Products.css";

const WHATSAPP_NUMBER = "201069199985";

const Products = () => {
  const {
    products: normalProducts,
    loading: normalLoading,
    hasMore: normalHasMore,
    fetchNextPage: fetchNormalNextPage,
    deleteProductFromState: deleteNormalProduct,
  } = useProductsPagination();

  const {
    search,
    setSearch,
    isSearchActive,
    products: searchProducts,
    loading: searchLoading,
    hasMore: searchHasMore,
    fetchNextPage: fetchSearchNextPage,
    deleteProductFromState: deleteSearchProduct,
  } = useProductsSearch();

  const products = isSearchActive ? searchProducts : normalProducts;
  const loading = isSearchActive ? searchLoading : normalLoading;
  const hasMore = isSearchActive ? searchHasMore : normalHasMore;

  const [selectedCategory, setSelectedCategory] = useState("الكل");
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

  return (
    <div className="products">
      <div className="products-header-container">
        <h1>المنتجات </h1>
        <Link to="/medical" className="go-to-medical-btn">
          الذهاب الي الخدمات الطبية🏥
        </Link>
      </div>

      {/* 🔍 Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => {
            console.log(`[Search Debug] Input search term updated to: "${e.target.value}"`);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* 🏷️ Categories */}
      <div className="categories-filter">
        {["الكل", ...new Set(products.map(p => p.category || "متنوع"))].map((cat, index) => (
          <button
            key={index}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 📦 Grid */}
      {(() => {
        const filteredProducts = products.filter((p) => {
          const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
          const matchCategory = selectedCategory === "الكل" || (p.category || "متنوع") === selectedCategory;
          return matchSearch && matchCategory;
        });

        return (
          <>
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((c) => c.id === product.id);

                // 💰 حساب السعر بعد الخصم
                const finalPrice =
                  product.price -
                  (product.price * (product.discount || 0)) / 100;

                return (
                  <div className="card" key={product.id}>
                    {/* Heart Icon Toggle */}
                    <button
                      className="heart-btn"
                      onClick={() => toggleFavorite(product)}
                    >
                      {isFavorite(product.id) ? "❤️" : "🤍"}
                    </button>

                    <img src={product.image} alt={product.name} />
                    <div className="card-body">
                      <span className="category-badge">{product.category || "متنوع"}</span>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3>{product.name}</h3>
                        {product.discount > 0 && (
                          <span className="badge">
                            خصم {product.discount}%
                          </span>
                        )}
                      </div>
                      <p>{product.description}</p>
                      {/* 💰 PRICE BOX */}
                      <div className="price-box">
                        {product.discount > 0 && (
                          < span className="old-price">
                            {product.price} جنيه
                          </span>
                        )}
                        <div>
                          <span className="new-price">
                            {finalPrice.toFixed(0)} جنيه
                          </span>
                        </div>
                      </div>

                      {/* 🛒 ADD / QTY BOX */}
                      {cartItem ? (
                        < div className="qty-box">
                          <button onClick={() => decreaseQty(product.id)}>-</button>
                          <span>{cartItem.qty}</span>
                          <button onClick={() => addToCart(product)}>+</button>
                        </div>
                      ) : (
                        <button
                          className={`add-btn ${clickedId === product.id ? "added" : ""
                            }`}
                          onClick={() => {
                            addToCart(product);
                            setClickedId(product.id);
                            setTimeout(() => setClickedId(null), 1000);
                          }}
                        >
                          {clickedId === product.id
                            ? "✔ تمت الإضافة!"
                            : "إضافة للسلة"}
                        </button>
                      )}

                      {/* ❌ DELETE & EDIT (Admin only) */}
                      {userData?.role === "admin" && (
                        <div className="admin-actions">
                          <Link to={`/edit-product/${product.id}`} className="edit-btn">
                            ✏️ تعديل
                          </Link>
                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteClick(product.id)
                            }
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ➕ Add Product */}
              {userData?.role === "admin" && (
                <Link to="/add-product" className="card add-card">
                  <div className="card-body add-card-body">
                    <span className="plus">+</span>
                    <h3>إضافة منتج</h3>
                  </div>
                </Link>
              )}
            </div>

            {/* 📦 No results empty state */}
            {isSearchActive && search.trim() && filteredProducts.length === 0 && !loading && (
              <div className="search-empty-state">
                <div className="search-empty-icon">🛒</div>
                <h3 className="search-empty-title">لم نجد المنتج الذي تبحث عنه</h3>
                <p className="search-empty-desc">
                  هل تريد طلب <strong>"{search}"</strong> كلمنا عبر واتساب؟
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`مرحبا، لم أجد المنتج "‏${search}‏" على الموقع. هل هو متوفر؟`)}`}
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
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحبا، لم أجد المنتج الذي أبحث عنه. هل يمكنكم مساعدتي؟")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="end-list-wa-link"
            >
              💬 لو ملقتش طلبك هنا؟ اطلبوا من علي الواتساب
            </a>
          </div>
        )}
      </div>

      {/* ⚠️ Modal */}
      {
        showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>هل أنت متأكد من حذف هذا المنتج؟</h3>

              <div className="modal-actions">
                <button
                  className="yes-btn"
                  onClick={confirmDelete}
                >
                  نعم
                </button>

                <button
                  className="no-btn"
                  onClick={cancelDelete}
                >
                  لا
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Products;