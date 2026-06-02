import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { createOrder } from "../../services/orderService";
import "./Cart.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// 📱 WhatsApp business number (without + or spaces)
const WHATSAPP_NUMBER = "201069199985";

const Cart = () => {
  const { cart, removeFromCart, clearCart, addToCart, decreaseQty } =
    useContext(CartContext);
  const { user, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: user?.email || "",
    phone: userData?.phone || "",
    address: "",
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

  const buildWhatsAppMessage = (orderId, items) => {
    let msg = `🛒 *طلب جديد* 🎉\n`;
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `👤 الاسم: ${form.firstName} ${form.lastName}\n`;
    msg += `📞 الهاتف: ${form.phone}\n`;
    msg += `📍 العنوان: ${form.address}\n`;
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `📦 *المنتجات:*\n`;

    items.forEach((item, i) => {
      msg += `\n${i + 1}. ${item.name}\n`;
      msg += `   الكمية: ${item.qty}\n`;
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
        name: item.name,
        qty: item.qty,
        price: item.price,
        discount: item.discount || 0,
        image: item.image,
      }));

      const orderId = await createOrder({
        userId: user.uid,
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
        },
        items,
        totalPrice: parseFloat(total.toFixed(2)),
      });

      // ✅ Open WhatsApp with full order details
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(orderId, items)}`;
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
          <Link to="/products" className="browse-btn">
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
              return (
                <div className="cart-card" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <p>{finalPrice.toFixed(0)} EGP</p>

                    <div className="qty-box">
                      <button onClick={() => decreaseQty(item.id)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✖
                  </button>
                </div>
              );
            })}
            <Link to="/products" className="browse-btn">
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
                  name="address"
                  placeholder="العنوان بالتفصيل 📍"
                  value={form.address}
                  onChange={handleChange}
                  required
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