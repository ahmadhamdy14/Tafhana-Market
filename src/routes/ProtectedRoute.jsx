import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      toast.error("من فضلك سجل دخول🔐");
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};
export default ProtectedRoute;