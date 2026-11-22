import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import "./FloatingCallButton.css";

const WHATSAPP_NUMBER = "201104152249";
const WHATSAPP_MSG = encodeURIComponent("مرحباً، عايز أعمل أوردر 🛒");
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

/**
 * FloatingCallButton
 *
 * Floating WhatsApp action button fixed across public & client pages of Tafahna Market.
 * Allows users to place orders directly via WhatsApp.
 * Automatically hidden on auth/admin pages to preserve clean layout.
 */
export default function FloatingCallButton() {
  const { pathname } = useLocation();

  // Hidden on login, registration, password reset, and admin dashboard routes
  const isExcludedRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/add-product") ||
    pathname.startsWith("/edit-product");

  if (isExcludedRoute) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-call-btn"
      dir="rtl"
      aria-label="ابعتلنا على الواتس لطلب الأوردر"
      title="اطلب عبر واتساب"
      id="floating-call-button"
    >
      <div className="floating-call-btn__icon-wrapper">
        <FaWhatsapp className="floating-call-btn__icon" aria-hidden="true" />
        <span className="floating-call-btn__pulse" aria-hidden="true" />
      </div>

      <div className="floating-call-btn__content">
        <span className="floating-call-btn__title">ابعتلنا ع الواتس 💬</span>
        <span className="floating-call-btn__subtitle">
          <span className="floating-call-btn__action">اطلب أوردرك دلوقتي</span>
        </span>
      </div>
    </a>
  );
}
