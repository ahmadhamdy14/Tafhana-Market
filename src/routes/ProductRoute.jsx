import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProductRoute = ({ children }) => {
  const { user, canManageProducts } = useContext(AuthContext);

  if (!user) {
    toast.error("من فضلك سجل دخول🔐 ");
    return <Navigate to="/login" />;
  }

  if (!canManageProducts) {
    toast.error("هذه الصفحة للمشرفين والمحررين فقط🚫 ");
    return <Navigate to="/" />;
  }

  return children;
};

export default ProductRoute;

