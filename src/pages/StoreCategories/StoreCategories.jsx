import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CATEGORIES } from "../../constants/categories";
import PoultryNotice from "../../components/PoultryNotice/PoultryNotice";
import "./StoreCategories.css";

const WHATSAPP_NUMBER = "201104152249";

export default function StoreCategories() {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const isAdmin = userData?.role === "admin";

  const renderCardInner = (category) => (
    <>
      {/* Card Image Wrap */}
      <div className="category-image-wrapper">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          onError={(e) => {
            // Fallback to placeholder gradient if image fails to load
            e.target.style.display = "none";
          }}
        />
        <div className="category-image-overlay"></div>
        <div className="category-icon-floating">
          <span>{category.icon}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="category-card-body">
        <div className="category-title-row">
          <div className="title-group">
            <span className="category-en-badge">{category.nameEn}</span>
            <h2 className="category-name">{category.name}</h2>
          </div>
        </div>

        <p className="category-tagline">{category.tagline}</p>
        <p className="category-desc">{category.description}</p>

        {/* 🐔 Dynamic Admin-Editable Notice for Poultry Category */}
        {category.slug === "poultry" && (
          <PoultryNotice isAdmin={isAdmin} />
        )}

        {/* Card Action Button */}
        <div className="category-card-footer">
          {category.slug === "poultry" ? (
            <Link
              to={`/store/${category.slug}`}
              className="open-category-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span>تصفح {category.name}</span>
              <span className="btn-arrow">←</span>
            </Link>
          ) : (
            <span className="open-category-btn">
              <span>تصفح {category.name}</span>
              <span className="btn-arrow">←</span>
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="store-categories-container">
      {/* 🌟 Hero Header Banner */}
      <section className="categories-hero">
        <div className="hero-badge">🛒 تفهنا ماركت</div>
        <h1>أقسام المتجر</h1>
        <p>
          اختر القسم الذي يناسب احتياجاتك لتصفح أحدث وأجود المنتجات اليومية بكل سهولة وسرعة
        </p>
        <div className="hero-nav-links">
          <Link to="/" className="hero-nav-btn secondary">
            🏠 العودة للرئيسية
          </Link>
          <Link to="/medical" className="hero-nav-btn accent">
            🩺 الخدمات الطبية والصيدلية
          </Link>
        </div>
      </section>

      {/* 🚀 Categories Grid */}
      <section className="categories-grid-section">
        <div className="categories-grid">
          {CATEGORIES.map((category) => {
            const isPoultry = category.slug === "poultry";

            if (isPoultry) {
              return (
                <div
                  key={category.id}
                  className="category-card"
                  style={{
                    "--category-accent": category.accentColor,
                  }}
                  onClick={(e) => {
                    // Prevent navigation if the click originated inside the poultry notice
                    if (e.target.closest(".poultry-notice-wrapper")) {
                      return;
                    }
                    navigate(`/store/${category.slug}`);
                  }}
                >
                  {renderCardInner(category)}
                </div>
              );
            }

            return (
              <Link
                to={`/store/${category.slug}`}
                key={category.id}
                className="category-card"
                style={{
                  "--category-accent": category.accentColor,
                }}
              >
                {renderCardInner(category)}
              </Link>
            );
          })}
        </div>
      </section>

      {/* 💬 Help & Contact Banner */}
      <section className="store-help-banner">
        <div className="help-content">
          <div className="help-icon">💬</div>
          <div className="help-text">
            <h3>لم تجد ما تبحث عنه؟</h3>
            <p>يمكنك التواصل معنا مباشرة عبر واتساب لطلب أي منتج أو الاستفسار عن التوصيل والأسعار</p>
          </div>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، أود الاستفسار عن منتجات تفهنا ماركت")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="help-wa-btn"
        >
          تواصل عبر واتساب 🟢
        </a>
      </section>
    </div>
  );
}
