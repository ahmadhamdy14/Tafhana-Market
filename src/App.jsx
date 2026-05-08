import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import FavoritesProvider from "./context/FavoritesContext";
import { PWAProvider } from "./context/PWAContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstallPrompt from "./components/InstallPrompt";
import InstallButton from "./components/InstallButton/InstallButton";

function App() {
  return (
    <PWAProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AppRoutes />
            <ToastContainer position="top-right" autoClose={3000} />
            <InstallPrompt />
            <InstallButton variant="floating" />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </PWAProvider>
  );
}

export default App;