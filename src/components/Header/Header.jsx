import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
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
  const headerRef = useRef(null);

  useEffect(() => {
    if (userData?.role === "admin") {
      const unsubscribe = listenToPendingOrdersCount((count) => {
        setPendingOrdersCount(count);
      });
      return () => unsubscribe();
    }
  }, [userData?.role]);

  // 📱 Close mobile menu when clicking/tapping outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await signOut(auth);
    clearCart();
    navigate("/login");
  };

  return (
    <header className="header" ref={headerRef}>
      <nav className="nav">
        {/* LOGO */}
        <div className="logo-container">
          <Link to="/" onClick={() => setOpen(false)}>
            <img src="/favicon1.png" alt="Logo" className="logo-icon" />
          </Link>
          <Link to="/" className="logo" style={{ fontSize: "20px", fontWeight: "bold" }} onClick={() => setOpen(false)}>
            تفهنا ماركت
          </Link>
        </div>

        {/* HAMBURGER & QUICK ICONS */}
        <div style={{ display: "flex", alignItems: "center", position: "relative", gap: "15px" }}>
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
          <Link to="/" onClick={() => setOpen(false)}>
            الرئيسية
          </Link>
          <Link to="/products" onClick={() => setOpen(false)}>
            المنتجات
          </Link>
          <Link to="/medical" onClick={() => setOpen(false)}>
            الخدمات الطبية 🩺
          </Link>
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

          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>
                تسجيل الدخول
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                انشاء حساب
              </Link>
            </>
          ) : (
            <>
              <span className="user-name">
                👋 اهلا  {userData?.firstName || "User"}
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