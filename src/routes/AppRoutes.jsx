import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Admin from "../pages/Admin/Admin";
import Products from "../pages/Products/Products";
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

          {/* 🔐 Protected Routes */}
          <Route path="/" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
          <Route path="/medical" element={<ProtectedRoute> <MedicalServices /> </ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute> <Cart /> </ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute> <Favorites /> </ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute> <Products /> </ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute> <OrderSuccess /> </ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute> <MyOrders /> </ProtectedRoute>} />

          {/* 🌐 Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 🚫 Admin Only Routes */}
          <Route path="/admin" element={<AdminRoute> <Admin /> </AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute> <AdminOrders /> </AdminRoute>} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRoutes;