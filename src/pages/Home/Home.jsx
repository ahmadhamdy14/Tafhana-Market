import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* 🌟 Welcome Hero Banner */}
      <section className="home-hero">
        <div className="hero-content">
          <h1>مرحباً بكم في تفهنا ماركت</h1>
          <p>بوابتكم الإلكترونية المتكاملة للتسوق وطلب الأدوية وحجز الأطباء بكل سهولة وسرعة</p>
        </div>
      </section>

      {/* 🚀 Main Navigation Cards Section */}
      <section className="services-section">
        <h2 className="section-title">اختر الخدمة المطلوبة للبدء</h2>
        
        <div className="services-grid">
          {/* Card 1: Browse Products */}
          <Link to="/products" className="service-card">
            <div className="card-image-wrap">
              <img src="/products-card.png" alt="المنتجات الغذائية والاستهلاكية" />
            </div>
            <div className="service-card-body">
              <h3>تصفح المنتجات</h3>
              <p>استكشف جميع الأغذية، المنظفات، والسلع الاستهلاكية المتاحة واطلبها مباشرة لتصلك حتى باب البيت.</p>
              <span className="cta-btn">تصفح الآن 🛒</span>
            </div>
          </Link>

          {/* Card 2: Medicine Orders & Doctor Appointments */}
          <Link to="/medical" className="service-card">
            <div className="card-image-wrap">
              <img src="/medical-card.png" alt="الطلب الطبي وحجز العيادة" />
            </div>
            <div className="service-card-body">
              <h3>طلب دواء أو حجز طبيب</h3>
              <p>أرسل روشتة الدواء للصيدلية أو احجز موعداً في العيادة الخارجية مع نخبة من كبار الأطباء.</p>
              <span className="cta-btn medical-cta">الخدمات الطبية 🩺</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
