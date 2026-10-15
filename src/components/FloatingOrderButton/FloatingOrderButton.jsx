import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { CartContext } from "../../context/CartContext";
import "./FloatingOrderButton.css";

/**
 * FloatingOrderButton
 * 
 * Floating action button fixed at the bottom-right corner of Tafahna Market.
 * Appears dynamically only when the customer's cart has at least 1 item.
 * Clicking navigates to the checkout page (/cart) or scrolls to the summary if already on /cart.
 */
export default function FloatingOrderButton() {
  const { cartCount } = useContext(CartContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Hidden on auth and admin routes to preserve layout
  const isExcludedRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/add-product") ||
    pathname.startsWith("/edit-product");

  // Only display when user has products in their shopping cart
  if (isExcludedRoute || !cartCount || cartCount <= 0) {
    return null;
  }

  const handleClick = (e) => {
    // If already on the cart page, scroll smoothly to checkout section
    if (pathname === "/cart") {
      e.preventDefault();
      const summaryEl =
        document.querySelector(".cart-summary") ||
        document.querySelector(".checkout-btn");
      if (summaryEl) {
        summaryEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    navigate("/cart");
  };

  // Proper Arabic pluralization for item count
  const itemCountText =
    cartCount === 1
      ? "منتج واحد"
      : cartCount === 2
      ? "منتجان"
      : cartCount <= 10
      ? `${cartCount} منتجات`
      : `${cartCount} منتج`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="floating-order-btn"
      dir="rtl"
      aria-label={`تأكيد الأوردر (${itemCountText} في السلة)`}
      title="تأكيد الأوردر والذهاب للسلة"
      id="floating-order-button"
    >
      <div className="floating-order-btn__icon-wrapper">
        <FaShoppingCart className="floating-order-btn__icon" aria-hidden="true" />
        <span className="floating-order-btn__badge">{cartCount}</span>
        <span className="floating-order-btn__pulse" aria-hidden="true" />
      </div>

      <div className="floating-order-btn__content">
        <span className="floating-order-btn__title">تأكيد الأوردر</span>
        <span className="floating-order-btn__subtitle">
          <span className="floating-order-btn__count">{itemCountText}</span>
          <FaArrowLeft className="floating-order-btn__arrow" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
