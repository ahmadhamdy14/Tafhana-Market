import { useContext, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const toastShown = useRef(false);

  useEffect(() => {
    if (!user && !toastShown.current) {
      toast.error("من فضلك سجل دخول 🔐");
      toastShown.current = true;
    }

    if (user) {
      toastShown.current = false;
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;