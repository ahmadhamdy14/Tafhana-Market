import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import FavoritesProvider from "./context/FavoritesContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstallPrompt from "./components/InstallPrompt";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
          <InstallPrompt />
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;