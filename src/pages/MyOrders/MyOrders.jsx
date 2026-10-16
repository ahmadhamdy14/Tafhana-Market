import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getUserOrders, deleteOldOrders } from "../../services/orderService";
import "./MyOrders.css";

const STATUS_STYLES = {
  pending:    { label: "حجز",            color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  processing: { label: "قيد التجهيز",   color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)"  },
  shipped:    { label: "جاري التوصيل",  color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.3)"  },
  delivered:  { label: "تم التوصيل",    color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)"   },
  cancelled:  { label: "ألغاء",          color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
};

const formatDate = (ts) => {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        let data = await getUserOrders(user.uid);
        // Auto-delete delivered/cancelled orders older than 15 days
        data = await deleteOldOrders(data);
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("حدث خطأ في تحميل الطلبات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="my-orders-container">
        <div className="my-orders-state">جاري تحميل الطلبات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-container">
        <div className="my-orders-state" style={{ color: "#ef4444" }}>
          ❌ {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders-container">
        <h1 className="my-orders-title">📦طلباتي</h1>
        <div className="my-orders-state">
          <p>لسه معندكش اي طلبات </p>
          <Link to="/cart" className="my-orders-browse-btn">
            اذهب لتاكيد الطلب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <h1 className="my-orders-title"> 📦طلباتي</h1>
      <p className="my-orders-count">{orders.length} طلب {orders.length !== 1 ? "" : ""}</p>

      <div className="my-orders-list">
        {orders.map((order) => {
          const sc = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
          return (
            <div className="my-order-card" key={order.id}>

              {/* 🏷 Header row */}
              <div className="my-order-header">
                <div className="my-order-meta">
                  <span className="my-order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="my-order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span
                  className="my-order-status"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                >
                  {sc.label ?? order.status}
                </span>
              </div>

              {/* 📦 Items */}
              <div className="my-order-items">
                {order.items?.map((item) => (
                  <div className="my-order-item" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div className="my-order-item-info">
                      <span className="my-order-item-name">{item.name}</span>
                      <span className="my-order-item-qty">x{item.qty}</span>
                    </div>
                    <span className="my-order-item-price">
                      {((item.price - (item.price * (item.discount || 0)) / 100) * item.qty).toFixed(0)} EGP
                    </span>
                  </div>
                ))}
              </div>

              {/* 💰 Total */}
              <div className="my-order-footer">
                <span className="my-order-total-label">الاجمالي</span>
                <span className="my-order-total">{order.totalPrice?.toFixed(0)} EGP</span>
              </div>

            </div>
          );
        })}
      </div>

      <div className="my-orders-cta">
        <Link to="/store" className="my-orders-browse-btn">
          🛍️ اذهب للمتجر لشراء المزيد
        </Link>
      </div>
    </div>
  );
};

export default MyOrders;
