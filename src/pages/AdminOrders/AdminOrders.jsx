import { useEffect, useState } from "react";
import { listenToAllOrders, updateOrderStatus, deleteOrder } from "../../services/orderService";
import { toast } from "react-toastify";
import "./AdminOrders.css";

const STATUSES = [
  { value: "pending", label: "حجز", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  { value: "processing", label: "قيد التجهيز", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  { value: "shipped", label: "جاري التوصيل", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)" },
  { value: "delivered", label: "تم التوصيل", color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" },
  { value: "cancelled", label: "ألغاء", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
];

const getStatusInfo = (statusValue) =>
  STATUSES.find((s) => s.value === statusValue) || STATUSES[0];

const PAYMENT_LABELS = {
  cash: { label: "عند التوصيل", icon: "💵", color: "#22c55e" },
  instapay: { label: "انستا باي", icon: "📲", color: "#3b82f6" },
  vodafone: { label: "فودافون كاش", icon: "🔴", color: "#ef4444" },
};
const getPaymentInfo = (method) => PAYMENT_LABELS[method] || { label: method || "—", icon: "💳", color: "#888" };

const formatDate = (ts) => {
  if (!ts) return "—";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selected, setSelected] = useState(null); // order shown in modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  const handleDeleteClick = (orderId) => {
    setDeletingOrderId(orderId);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = async () => {
    try {
      await deleteOrder(deletingOrderId);
      setOrders((prev) => prev.filter((o) => o.id !== deletingOrderId));
      toast.success("تم حذف الطلب بنجاح");
      setShowDeleteModal(false);
      setDeletingOrderId(null);
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف الطلب");
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeleteModal(false);
    setDeletingOrderId(null);
  };

  useEffect(() => {
    // 📡 Real-time listener — keeps the orders table always up to date
    const unsubscribe = listenToAllOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      // keep modal in sync
      setSelected((prev) => (prev?.id === orderId ? { ...prev, status: newStatus } : prev));
      const info = getStatusInfo(newStatus);
      toast.success(`تم تحديث حالة الطلب: ${info.label}`);
    } catch (err) {
      console.error(err);
      toast.error("فشل تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-orders-container">
      <h1 className="admin-orders-title">📦 إدارة الطلبات</h1>

      {loading ? (
        <div className="orders-loading">جاري تحميل الطلبات...</div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">لا توجد طلبات بعد 🛒</div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>العميل</th>
                <th>رقم الهاتف</th>
                <th>📍 العنوان</th>
                <th>المنتجات</th>
                <th>المجموع</th>
                <th>طريقة الدفع</th>
                <th>التاريخ</th>
                <th>حالة الطلب</th>
                <th>تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const sc = getStatusInfo(order.status);
                return (
                  <tr key={order.id}>
                    <td>{index + 1}</td>
                    <td>
                      {order.customer?.firstName} {order.customer?.lastName}
                      <br />
                      <span className="customer-email">{order.customer?.email}</span>
                    </td>
                    <td>{order.customer?.phone || "—"}</td>
                    <td className="order-address">{order.customer?.address || "—"}</td>
                    <td className="items-count">{order.items?.length} منتج</td>
                    <td className="order-total">{order.totalPrice?.toFixed(0)} EGP</td>
                    <td>
                      {(() => {
                        const pi = getPaymentInfo(order.paymentMethod);
                        return (
                          <span style={{ color: pi.color, fontWeight: 600, whiteSpace: "nowrap" }}>
                            {pi.icon} {pi.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.border}`,
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="details-btn"
                          onClick={() => setSelected(order)}
                        >
                          👁 عرض
                        </button>
                        {/*<button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(order.id)}
                        >
                          حذف 🗑️
                        </button>*/}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ───────── ORDER DETAIL MODAL ───────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box order-detail-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="modal-header">
              <div>
                <h2 className="modal-title">تفاصيل الطلب</h2>
                <span className="modal-order-id">#{selected.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Status badge + date */}
            <div className="modal-meta">
              {(() => {
                const sc = getStatusInfo(selected.status);
                return (
                  <span className="modal-status-badge"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    {sc.label}
                  </span>
                );
              })()}
              <span className="modal-date">📅 {formatDate(selected.createdAt)}</span>
            </div>

            {/* Customer info */}
            <div className="modal-section">
              <h3 className="modal-section-title">👤 بيانات العميل</h3>
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="info-label">الاسم</span>
                  <span className="info-value">{selected.customer?.firstName} {selected.customer?.lastName}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">البريد الإلكتروني</span>
                  <span className="info-value">{selected.customer?.email}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">رقم الهاتف</span>
                  <span className="info-value">{selected.customer?.phone || "—"}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">📍 العنوان</span>
                  <span className="info-value">{selected.customer?.address || "—"}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">💳 طريقة الدفع</span>
                  <span className="info-value" style={{ color: getPaymentInfo(selected.paymentMethod).color, fontWeight: 700 }}>
                    {getPaymentInfo(selected.paymentMethod).icon} {getPaymentInfo(selected.paymentMethod).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="modal-section">
              <h3 className="modal-section-title">🛍 المنتجات</h3>
              <div className="modal-items">
                {selected.items?.map((item) => {
                  const finalPrice = item.price - (item.price * (item.discount || 0)) / 100;
                  return (
                    <div className="modal-item" key={item.id}>
                      <img src={item.image} alt={item.name} className="modal-item-img" />
                      <div className="modal-item-info">
                        <span className="modal-item-name">{item.name}</span>
                        {item.discount > 0 && (
                          <span className="modal-item-discount">خصم {item.discount}%</span>
                        )}
                        <span className="modal-item-qty">الكمية: {item.qty}</span>
                      </div>
                      <span className="modal-item-price">
                        {(finalPrice * item.qty).toFixed(0)} EGP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="modal-total-row">
              <span>الإجمالي</span>
              <span className="modal-total-amount">{selected.totalPrice?.toFixed(0)} EGP</span>
            </div>

            {/* Inline status update */}
            <div className="modal-status-update">
              <label className="info-label">تغيير حالة الطلب</label>
              <select
                className="status-select modal-status-select"
                value={selected.status}
                disabled={updatingId === selected.id}
                onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                style={(() => {
                  const sc = getStatusInfo(selected.status);
                  return { background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` };
                })()}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <button
                className="delete-btn modal-delete-btn"
                onClick={() => handleDeleteClick(selected.id)}
              >
                🗑️ حذف الطلب نهائياً
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ⚠️ Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDeleteOrder}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>هل أنت متأكد من حذف هذا الطلب نهائياً؟</h3>
            <p style={{ color: "var(--sub)", fontSize: "14px", margin: "10px 0 20px" }}>
              لا يمكن التراجع عن هذا الإجراء وسيتم حذفه من قاعدة البيانات.
            </p>

            <div className="modal-actions">
              <button
                className="yes-btn"
                onClick={confirmDeleteOrder}
              >
                نعم، احذف
              </button>

              <button
                className="no-btn"
                onClick={cancelDeleteOrder}
              >
                لا
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
