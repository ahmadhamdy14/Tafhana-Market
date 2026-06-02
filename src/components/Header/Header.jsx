import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { listenToPendingOrdersCount } from "../../services/orderService";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { FavoritesContext } from "../../context/FavoritesContext";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import InstallButton from "../InstallButton/InstallButton";
import "./Header.css";

const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, userData } = useContext(AuthContext);
  const { cartCount, clearCart } = useContext(CartContext);
  const { favoritesCount } = useContext(FavoritesContext);

  const [open, setOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.role === "admin") {
      const unsubscribe = listenToPendingOrdersCount((count) => {
        setPendingOrdersCount(count);
      });
      return () => unsubscribe();
    }
  }, [userData?.role]);

  const handleLogout = async () => {
    await signOut(auth);
    clearCart();
    navigate("/login");
  };
  return (
    <header className="header">
      <nav className="nav">
        {/* LOGO */}
        <div className="logo-container">
          <Link to="/">
            <img src="/favicon1.png" alt="Logo" className="logo-icon" />
          </Link>
          <Link to="/" className="logo" style={{ fontSize: "20px", fontWeight: "bold" }}>تفهنا ماركت</Link>
        </div>
        {/* HAMBURGER */}
        <div style={{ display: "flex", alignItems: "center", position: "relative", gap: "15px" }}>
          {user && (
            <>
              <Link to="/favorites" className="cart-link" onClick={() => setOpen(false)}>
                ❤️
                {favoritesCount > 0 && (
                  <span className="cart-badge">{favoritesCount}</span>
                )}
              </Link>
              <Link to="/cart" className="cart-link" onClick={() => setOpen(false)}>
                🛒
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
            </>
          )}

          <div className="hamburger" onClick={() => setOpen(!open)}>
            ☰
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div className={`nav-right ${open ? "open" : ""}`}>
          <button onClick={toggleTheme} className="theme-btn">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {/* Install button — full label visible in desktop nav */}
          <InstallButton variant="navbar" />
          <Link to="/products" onClick={() => setOpen(false)}>
            المنتجات
          </Link>
          <Link to="/medical" onClick={() => setOpen(false)}>
            الخدمات الطبية 🩺
          </Link>
          {!user && (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                تسجيل الدخول
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                انشاء حساب
              </Link>
            </>
          )}
          {user && (
            <>
              <Link to="/my-orders" onClick={() => setOpen(false)}>
                📦 طلباتي
              </Link>
              {userData?.role === "admin" && (
                <>
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    🛠️ لوحة التحكم
                  </Link>
                  <Link to="/admin/orders" className="cart-link" onClick={() => setOpen(false)} style={{ display: 'flex', gap: '5px' }}>
                    {pendingOrdersCount > 0 && (
                      <span className="cart-badge" style={{ position: 'static', transform: 'none', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '50%', fontSize: '12px' }}>
                        {pendingOrdersCount}
                      </span>
                    )}
                    طلبات العملاء
                  </Link>
                </>
              )}
              <span className="user-name">
                👋 Hi {userData?.firstName || "User"}
              </span>

              <button onClick={handleLogout} className="theme-btn">
                تسجيل الخروج
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
export default Header;