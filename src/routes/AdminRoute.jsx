import { useContext, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { listenToAllOrders } from "../services/orderService";

const AdminRoute = ({ children }) => {
  const { user, userData } = useContext(AuthContext);
  const prevCountRef = useRef(null);

  useEffect(() => {
    // Only start listener when the logged-in user is an admin
    if (!user || userData?.role !== "admin") return;

    const unsubscribe = listenToAllOrders((orders) => {
      if (prevCountRef.current !== null && orders.length > prevCountRef.current) {
        // 🔔 New order arrived — play sound + show toast from anywhere in admin
        try {
          const audio = new Audio("/notification.wav");
          audio.volume = 0.8;
          audio.play().catch(() => {});
        } catch (_) {}

        toast.info("🔔 طلب جديد وصل!", {
          position: "top-left",
          autoClose: 5000,
          style: { fontWeight: "bold", fontSize: "16px" },
        });
      }
      prevCountRef.current = orders.length;
    });

    return () => unsubscribe();
  }, [user, userData]);

  if (!user) {
    toast.error("من فضلك سجل دخول🔐 ");
    return <Navigate to="/login" />;
  }

  if (userData?.role !== "admin") {
    toast.error("هذه الصفحة للمدير فقط🚫 ");
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;