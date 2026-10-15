import { useLocation } from "react-router-dom";
import { FaPhoneAlt } from "react-icons/fa";
import "./FloatingCallButton.css";

const PHONE_NUMBER = "01104152249";
const TEL_LINK = `tel:${PHONE_NUMBER}`;

/**
 * FloatingCallButton
 * 
 * Floating call action button fixed across public & client pages of Tafahna Market.
 * Allows users to place orders directly via phone call (01104152249).
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
      href={TEL_LINK}
      className="floating-call-btn"
      dir="rtl"
      aria-label={`عايز تعمل الأوردر مكالمة؟ اتصل بنا الآن على رقم ${PHONE_NUMBER}`}
      title="اتصل بنا لطلب الأوردر هاتفياً"
      id="floating-call-button"
    >
      <div className="floating-call-btn__icon-wrapper">
        <FaPhoneAlt className="floating-call-btn__icon" aria-hidden="true" />
        <span className="floating-call-btn__pulse" aria-hidden="true" />
      </div>

      <div className="floating-call-btn__content">
        <span className="floating-call-btn__title">عايز تعمل الأوردر مكالمة؟</span>
        <span className="floating-call-btn__subtitle">
          <span className="floating-call-btn__action">اتصل الآن:</span>{" "}
          <bdi className="floating-call-btn__number">{PHONE_NUMBER}</bdi>
        </span>
      </div>
    </a>
  );
}
