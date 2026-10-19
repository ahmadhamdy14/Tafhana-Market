import { Link } from "react-router-dom";
import { GROCERY_SUBCATEGORIES } from "../../constants/categories";
import "./GrocerySubcategories.css";

const WHATSAPP_NUMBER = "201104152249";

export default function GrocerySubcategories() {
  return (
    <div className="grocery-subcategories-container">
      {/* 🌟 Hero Header Banner */}
      <section className="grocery-hero">
        <div className="grocery-hero-badge">🧺 بقالة تفهنا ماركت</div>
        <h1>أقسام البقالة</h1>
        <p>
          اختر القسم الفرعي الذي تبحث عنه لتصفح المنتجات بسهولة وسرعة
        </p>
        <div className="grocery-hero-nav">
          <Link to="/store" className="grocery-nav-btn secondary">
            ← الرجوع إلى أقسام المتجر
          </Link>
        </div>
      </section>

      {/* 🧭 Breadcrumb */}
      <nav className="grocery-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to="/store">أقسام المتجر</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">بقالة</span>
      </nav>

      {/* 🚀 Subcategories Grid */}
      <section className="grocery-grid-section">
        <div className="grocery-grid">
          {GROCERY_SUBCATEGORIES.map((sub) => (
            <Link
              to={`/store/bakala/${sub.slug}`}
              key={sub.id}
              className="grocery-subcat-card"
              style={{
                "--subcat-accent": sub.accentColor,
              }}
            >
              {/* Card Visual */}
              <div className="subcat-visual">
                <div className="subcat-icon-circle">
                  <span>{sub.icon}</span>
                </div>
                <div className="subcat-accent-glow"></div>
              </div>

              {/* Card Body */}
              <div className="subcat-card-body">
                <div className="subcat-title-row">
                  <span className="subcat-en-badge">{sub.nameEn}</span>
                  <h2 className="subcat-name">{sub.name}</h2>
                </div>

                <p className="subcat-tagline">{sub.tagline}</p>
                <p className="subcat-desc">{sub.description}</p>

                {/* Card Action */}
                <div className="subcat-card-footer">
                  <span className="open-subcat-btn">
                    <span>تصفح المنتجات</span>
                    <span className="subcat-btn-arrow">←</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 💬 Help & Contact Banner */}
      <section className="grocery-help-banner">
        <div className="grocery-help-content">
          <div className="grocery-help-icon">💬</div>
          <div className="grocery-help-text">
            <h3>لم تجد ما تبحث عنه في البقالة؟</h3>
            <p>يمكنك التواصل معنا مباشرة عبر واتساب لطلب أي منتج أو الاستفسار عن التوصيل والأسعار</p>
          </div>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، أود الاستفسار عن منتجات البقالة في تفهنا ماركت")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grocery-wa-btn"
        >
          تواصل عبر واتساب 🟢
        </a>
      </section>
    </div>
  );
}
