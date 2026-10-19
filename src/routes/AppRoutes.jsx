import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Admin from "../pages/Admin/Admin";
import Products from "../pages/Products/Products";
import StoreCategories from "../pages/StoreCategories/StoreCategories";
import GrocerySubcategories from "../pages/GrocerySubcategories/GrocerySubcategories";
import AddProduct from "../pages/AddProduct/AddProduct";
import EditProduct from "../pages/EditProduct/EditProduct";
import Cart from "../pages/Cart/Cart";
import Favorites from "../pages/Favorites/Favorites";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import AdminOrders from "../pages/AdminOrders/AdminOrders";
import MyOrders from "../pages/MyOrders/MyOrders";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Home from "../pages/Home/Home";
import MedicalServices from "../pages/MedicalServices/MedicalServices";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>

          {/* 🌐 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<StoreCategories />} />
          <Route path="/store/bakala" element={<GrocerySubcategories />} />
          <Route path="/store/bakala/:subcategorySlug" element={<Products />} />
          <Route path="/store/:categorySlug" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/medical" element={<MedicalServices />} />

          {/* 🔐 Protected Routes */}
          <Route path="/cart" element={<ProtectedRoute> <Cart /> </ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute> <Favorites /> </ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute> <OrderSuccess /> </ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute> <MyOrders /> </ProtectedRoute>} />

          {/* 🌐 Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 🚫 Admin Only Routes */}
          <Route path="/admin" element={<AdminRoute> <Admin /> </AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute> <AdminOrders /> </AdminRoute>} />
          <Route path="/add-product" element={<AdminRoute> <AddProduct /> </AdminRoute>} />
          <Route path="/edit-product/:id" element={<AdminRoute> <EditProduct /> </AdminRoute>} />

          {/* 🔄 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;