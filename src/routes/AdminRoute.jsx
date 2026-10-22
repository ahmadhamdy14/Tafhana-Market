import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const AdminRoute = ({ children }) => {
  const { user, userData } = useContext(AuthContext);

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