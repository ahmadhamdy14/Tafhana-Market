import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { createOrder } from "../../services/orderService";
import "./Cart.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// 📱 WhatsApp business number (without + or spaces)
const WHATSAPP_NUMBER = "201104152249";

const Cart = () => {
  const { cart, removeFromCart, clearCart, addToCart, decreaseQty } =
    useContext(CartContext);
  const { user, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: user?.email || "",
    phone: userData?.phone || "",
    shopName: "",
    address: "",
    notes: "",
    paymentMethod: "cash", // default
  });

  // Subtotal after discount
  const subtotal = cart.reduce((acc, item) => {
    const finalPrice = item.price - (item.price * (item.discount || 0)) / 100;
    return acc + finalPrice * item.qty;
  }, 0);

  const DELIVERY_FEE = 10;
  const total = subtotal + DELIVERY_FEE;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const PAYMENT_OPTIONS = [
    { value: "cash", label: "عند التوصيل", icon: "💵" },
    { value: "instapay", label: "انستا باي", icon: "📲" },
    { value: "vodafone", label: "فودافون كاش", icon: "🔴" },
  ];

  const buildWhatsAppMessage = (items) => {
    const payLabel = PAYMENT_OPTIONS.find(p => p.value === form.paymentMethod)?.label || form.paymentMethod;
    let msg = `🛒 *طلب جديد* 🎉\n`;
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `👤 الاسم: ${form.firstName} ${form.lastName}\n`;
    msg += `📞 الهاتف: ${form.phone}\n`;
    if (form.shopName && form.shopName.trim()) {
      msg += `🏪 : ${form.shopName.trim()}\n`;
    }
    msg += `📍 العنوان: ${form.address}\n`;
    if (form.notes && form.notes.trim()) {
      msg += `📝 ملاحظات: ${form.notes.trim()}\n`;
    }
    msg += `💳 طريقة الدفع: ${payLabel}\n`;
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `📦 *المنتجات:*\n`;

    items.forEach((item, i) => {
      msg += `\n${i + 1}. ${item.name}\n`;
      if (item.selectedOptions && Object.keys(item.selectedOptions).length > 0) {
        const optsText = Object.entries(item.selectedOptions)
          .map(([g, v]) => {
            const grp = Array.isArray(item.options) ? item.options.find((o) => o.name === g) : null;
            const choiceObj = grp?.choices?.find(
              (c) => (typeof c === "object" && c !== null ? c.name : c) === v
            );
            const extra = Number(choiceObj?.price) || 0;
            return extra > 0 ? `${g}: ${v} (+${extra} ج)` : `${g}: ${v}`;
          })
          .join(" | ");
        msg += `   الخيارات: (${optsText})\n`;
      }
      msg += `   الكمية: ${item.qty}\n`;
      const itemFinalPrice = item.price - (item.price * (item.discount || 0)) / 100;
      msg += `   السعر: ${(itemFinalPrice * item.qty).toFixed(0)} جنيه\n`;
    });

    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `شكراً لك! ❤️`;

    return encodeURIComponent(msg);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const items = cart.map((item) => ({
        id: item.id,
        cartItemId: item.cartItemId || item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        discount: item.discount || 0,
        image: item.image,
        selectedOptions: item.selectedOptions || {},
        options: item.options || [],
      }));

      const orderId = await createOrder({
        userId: user.uid,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          shopName: form.shopName ? form.shopName.trim() : "",
          address: form.address,
          notes: form.notes ? form.notes.trim() : "",
        },
        items,
        totalPrice: parseFloat(total.toFixed(2)),
        paymentMethod: form.paymentMethod,
        notes: form.notes ? form.notes.trim() : "",
      });

      // ✅ Open WhatsApp with full order details
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(items)}`;
      window.open(waUrl, "_blank");

      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error("فشل تقديم الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <h1>سله المشتريات</h1>

      {cart.length === 0 ? (
        <div className="empty-box">
          <h2> 😢سله المشتريات فارغه </h2>
          <br />
          <Link to="/store" className="browse-btn">
            اذهب لشراء
          </Link>
        </div>
      ) : (
        <div className="cart-wrapper">

          {/* 🧾 ITEMS */}
          <div className="cart-items">
            {cart.map((item) => {
              const finalPrice =
                item.price - (item.price * (item.discount || 0)) / 100;
              const itemIdentifier = item.cartItemId || item.id;
              const hasSelectedOptions =
                item.selectedOptions &&
                typeof item.selectedOptions === "object" &&
                Object.keys(item.selectedOptions).length > 0;

              return (
                <div className="cart-card" key={itemIdentifier}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-info">
                    <h3>{item.name}</h3>

                    {/* 🏷️ Selected Options Badges */}
                    {hasSelectedOptions && (
                      <div className="cart-item-options">
                        {Object.entries(item.selectedOptions).map(([group, val]) => {
                          const grp = Array.isArray(item.options) ? item.options.find((o) => o.name === group) : null;
                          const choiceObj = grp?.choices?.find(
                            (c) => (typeof c === "object" && c !== null ? c.name : c) === val
                          );
                          const extra = Number(choiceObj?.price) || 0;

                          return (
                            <span key={group} className="cart-option-badge">
                              <span className="cart-option-group-label">{group}:</span>
                              <strong className="cart-option-val">{val}</strong>
                              {extra > 0 && (
                                <span className="cart-option-extra-pill">(+{extra} ج)</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <p>{finalPrice.toFixed(0)} EGP</p>

                    <div className="qty-box">
                      <button onClick={() => decreaseQty(itemIdentifier)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(itemIdentifier)}
                  >
                    ✖
                  </button>
                </div>
              );
            })}
            <Link to="/store" className="browse-btn">
              اذهب لشراء المزيد
            </Link>
          </div>

          {/* 💰 SUMMARY */}
          <div className="cart-summary">
            <h2>ملخص الطلب</h2>

            <div className="summary-row">
              <span>سعر الطلب</span>
              <span>{subtotal.toFixed(0)} EGP</span>
            </div>

            <div className="summary-row">
              <span> سعر التوصيل 🚚</span>
              <span>10 EGP</span>
            </div>

            <div className="summary-row total-row">
              <span>الاجمالي</span>
              <span>{total.toFixed(0)} EGP</span>
            </div>

            {!showForm ? (
              <button
                className="checkout-btn"
                onClick={() => setShowForm(true)}
              >
                تأكيد الطلب 🚀
              </button>
            ) : (
              <form className="checkout-form" onSubmit={handlePlaceOrder}>
                <h3>طريقة الدفع 💳</h3>
                <div className="payment-options">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`payment-option ${form.paymentMethod === opt.value ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.value}
                        checked={form.paymentMethod === opt.value}
                        onChange={handleChange}
                      />
                      <span className="pay-icon">{opt.icon}</span>
                      <span className="pay-label">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* 💳 Transfer number for InstaPay / Vodafone Cash */}
                {(form.paymentMethod === "instapay" || form.paymentMethod === "vodafone") && (
                  <div className="transfer-info">
                    <span className="transfer-label">
                      {form.paymentMethod === "instapay" ? "📲 رقم انستا باي" : "🔴 رقم فودافون كاش"}
                    </span>
                    <div className="transfer-number-row">
                      <span className="transfer-number">01157718746</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText("01157718746");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? "✔ تم النسخ" : "📋 نسخ"}
                      </button>
                    </div>
                    <p className="transfer-note">
                      برجاء تحويل المبلغ على هذا الرقم وإرسال صورة التحويل مع الطلب عبر واتساب
                    </p>
                  </div>
                )}

                <h3>معلومات التوصيل</h3>

                <div className="form-row">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="الاسم الاول"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="الاسم الاخير"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <input
                  type="email"
                  name="email"
                  placeholder="البريد الالكتروني"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="رقم الهاتف"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="shopName"
                  placeholder=" لو عايز تشتري من محل معين اكتبه هنا 🏪"
                  value={form.shopName}
                  onChange={handleChange}
                />
                <p style={{ color: "red", fontSize: "16px" }}>
                  ملحوظة : في حاله اختيار محل معين قد يؤثر على سعر المنتج
                </p>
                <input
                  type="text"
                  name="address"
                  placeholder="العنوان بالتفصيل 📍"
                  value={form.address}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="notes"
                  placeholder="ملاحظات على الطلب (اختياري) 📝"
                  value={form.notes}
                  onChange={handleChange}
                  rows="2"
                />

                <button
                  type="submit"
                  className="checkout-btn"
                  disabled={loading}
                >
                  {loading ? "جاري تأكيد الطلب..." : "تأكيد الطلب ✅"}
                </button>

                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setShowForm(false)}
                >
                  الغاء
                </button>
              </form>
            )}

            {!showForm && (
              <button className="clear-btn" onClick={clearCart}>
                مسح السله 🧹
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;