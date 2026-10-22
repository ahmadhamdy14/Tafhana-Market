import { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext, calculateOptionsExtraPrice } from "../../context/CartContext";
import { FavoritesContext } from "../../context/FavoritesContext";
import "./ProductCard.css";

export default function ProductCard({ product, isAdmin = false, onDeleteClick }) {
  const { cart, addToCart, decreaseQty, getCartItemId } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [clicked, setClicked] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const hasOptions = Array.isArray(product.options) && product.options.length > 0;

  // ➕ Calculate extra price from chosen options
  const optionsExtraPrice = hasOptions
    ? calculateOptionsExtraPrice(product.options, selectedOptions)
    : 0;

  // 💰 Calculate unit price (base + options) and discounted price
  const currentBasePrice = (Number(product.price) || 0) + optionsExtraPrice;
  const finalPrice =
    currentBasePrice - (currentBasePrice * (product.discount || 0)) / 100;

  // 🔍 Check if all required groups are satisfied
  const areRequiredSelected = !hasOptions
    ? true
    : product.options
      .filter((g) => g.required)
      .every((g) => selectedOptions[g.name] && String(selectedOptions[g.name]).trim() !== "");

  // 🎯 Find current cart item for this product + selected options combination
  const currentCartItemId = hasOptions
    ? (getCartItemId ? getCartItemId(product.id, selectedOptions) : `${product.id}`)
    : product.id;

  const cartItem = areRequiredSelected
    ? cart.find((item) => (item.cartItemId || item.id) === currentCartItemId)
    : null;

  // 🔘 Option choice toggle
  const handleSelectChoice = (groupName, choice, isRequired) => {
    setSelectedOptions((prev) => {
      const current = prev[groupName];
      if (!isRequired && current === choice) {
        const next = { ...prev };
        delete next[groupName];
        return next;
      }
      return { ...prev, [groupName]: choice };
    });

    if (validationErrors[groupName]) {
      setValidationErrors((prev) => ({ ...prev, [groupName]: false }));
    }
  };

  // 🛒 Add to Cart Handler with validation
  const handleAddToCart = () => {
    if (hasOptions) {
      const missing = product.options.filter(
        (g) => g.required && (!selectedOptions[g.name] || !String(selectedOptions[g.name]).trim())
      );

      if (missing.length > 0) {
        const errors = {};
        missing.forEach((g) => {
          errors[g.name] = true;
        });
        setValidationErrors(errors);
        toast.warning(`يرجى اختيار ${missing[0].name} أولاً لإضافة المنتج إلى السلة ⚠️`);
        return;
      }
    }

    addToCart(product, selectedOptions);
    setClicked(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setClicked(false);
    }, 2000);
  };

  return (
    <div className="card product-card" dir="rtl">
      {/* ❤️ Heart Icon Toggle */}
      <button
        type="button"
        className="heart-btn"
        onClick={() => toggleFavorite(product)}
        aria-label="إضافة للمفضلة"
      >
        {isFavorite(product.id) ? "❤️" : "🤍"}
      </button>

      {/* 🖼 Product Image */}
      <img src={product.image} alt={product.name} loading="lazy" />

      {/* 📄 Card Body */}
      <div className="card-body">

        <div className="card-title-row">
          <h3>{product.name}</h3>
          {product.discount > 0 && (
            <span className="badge">خصم {product.discount}%</span>
          )}
        </div>

        <p className="card-description">{product.description}</p>

        {/* 💰 Price Box */}
        <div className="price-box">
          {product.discount > 0 && (
            <span className="old-price">{currentBasePrice.toFixed(0)} جنيه</span>
          )}
          <div className="new-price-wrapper">
            <span className="new-price">{finalPrice.toFixed(0)} جنيه</span>
            {optionsExtraPrice > 0 && (
              <span className="options-extra-badge" title="سعر إضافي للخيارات المحددة">
                (+{optionsExtraPrice} ج خيارات)
              </span>
            )}
          </div>
        </div>

        {/* ⚙️ Product Options Section (if configured) */}
        {hasOptions && (
          <div className="product-card-options">
            {product.options.map((group) => {
              const selectedVal = selectedOptions[group.name];
              const isMissing = validationErrors[group.name];

              return (
                <div
                  key={group.id || group.name}
                  className={`card-option-group ${isMissing ? "has-validation-error" : ""}`}
                >
                  <div className="card-option-title-row">
                    <span className="card-option-label">
                      {group.name}:
                      {group.required && (
                        <span className="card-option-required" title="مطلوب">
                          * (مطلوب)
                        </span>
                      )}
                    </span>
                    {selectedVal && (
                      <span className="card-option-selected-val">{selectedVal}</span>
                    )}
                  </div>

                  <div className="card-option-pills">
                    {(group.choices || [])
                      .slice(0, expandedGroups[group.name] ? undefined : 2)
                      .map((choice) => {
                        const choiceName =
                          typeof choice === "object" && choice !== null
                            ? choice.name
                            : String(choice);
                        const choicePrice =
                          typeof choice === "object" && choice !== null
                            ? Number(choice.price) || 0
                            : 0;
                        const isSelected = selectedVal === choiceName;

                        return (
                          <button
                            key={choiceName}
                            type="button"
                            className={`card-choice-pill ${isSelected ? "active" : ""}`}
                            onClick={() =>
                              handleSelectChoice(group.name, choiceName, group.required)
                            }
                          >
                            <span className="choice-pill-name">{choiceName}</span>
                            {choicePrice > 0 && (
                              <span className="choice-extra-badge">+{choicePrice} ج</span>
                            )}
                          </button>
                        );
                      })}
                    {(group.choices || []).length > 2 && (
                      <button
                        type="button"
                        className="card-choice-pill show-more-pill"
                        onClick={() =>
                          setExpandedGroups((prev) => ({
                            ...prev,
                            [group.name]: !prev[group.name],
                          }))
                        }
                      >
                        {expandedGroups[group.name]
                          ? "▲ أقل"
                          : `إظهار المزيد (${(group.choices || []).length - 2}+)`}
                      </button>
                    )}
                  </div>

                  {isMissing && (
                    <span className="card-option-error-msg">
                      ⚠️ يرجى اختيار {group.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 🛒 Add to Cart or Qty Box */}
        {cartItem && !clicked ? (
          <div className="qty-box">
            <button
              type="button"
              onClick={() => decreaseQty(cartItem.cartItemId || cartItem.id)}
              aria-label="تقليل الكمية"
            >
              -
            </button>
            <span>{cartItem.qty}</span>
            <button
              type="button"
              onClick={() => addToCart(product, selectedOptions)}
              aria-label="زيادة الكمية"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`add-btn ${clicked ? "added" : ""}`}
            onClick={handleAddToCart}
            disabled={clicked}
          >
            {clicked ? "✔ تمت الإضافة!" : "إضافة للسلة"}
          </button>
        )}

        {/* 🛠️ Admin Actions (Edit / Delete) */}
        {isAdmin && (
          <div className="admin-actions">
            <Link to={`/edit-product/${product.id}`} className="edit-btn">
              ✏️ تعديل
            </Link>
            {onDeleteClick && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => onDeleteClick(product.id)}
              >
                🗑️ حذف
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
