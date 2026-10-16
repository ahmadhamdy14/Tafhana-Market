import { Link } from "react-router-dom";
import { CATEGORIES } from "../../constants/categories";
import "./StoreCategories.css";

const WHATSAPP_NUMBER = "201104152249";

export default function StoreCategories() {
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
          {CATEGORIES.map((category) => (
            <Link
              to={`/store/${category.slug}`}
              key={category.id}
              className="category-card"
              style={{
                "--category-accent": category.accentColor,
              }}
            >
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

                {/* Card Action Button */}
                <div className="category-card-footer">
                  <span className="open-category-btn">
                    <span>تصفح {category.name}</span>
                    <span className="btn-arrow">←</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
