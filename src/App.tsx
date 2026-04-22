import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import navigationEmitter from "./lib/navigationEmitter";
import { skeletonStyles } from "./components/Skeleton";

import UserLayout from "./layout/user/UserLayout";
import AdminLayout from "./layout/admin/AdminLayout";

import { CartProvider } from "./context/CartContext";

import Exception from "./pages/Exception";
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from "./pages/user/ForgotPassword";
import ProductDetailed from "./pages/user/ProductDetailed";
import Containers from "./pages/user/Containers";
import Cart from "./pages/user/Cart";
import ResetPassword from "./pages/user/ResetPassword";

import MyHome from "./pages/user/MyHome";
import Orders from "./pages/user/Orders";
import Benefits from "./pages/user/Benefits";
import Promotions from "./pages/user/Promotions";
import DiscountCode from "./pages/user/DiscountCode";
import BillOrder from "./pages/user/BillOrder";
import MyAccount from "./pages/user/MyAccount";
import EditPersonalInfo from "./pages/user/EditPersonalInfo";
import OrderInfo from "./pages/user/OrderInfo";
import OrderSuccess from "./pages/user/OrderSuccess";

import Dashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAI from "./pages/admin/AdminAI";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated =
    !!localStorage.getItem("access_token") ||
    !!localStorage.getItem("userInfo");

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const NavigationHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = navigationEmitter.on((path) => {
      navigate(path, { replace: true });
    });
    return unsubscribe;
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <style>{skeletonStyles}</style>
      <NavigationHandler />
      <CartProvider>
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product-detailed/:id" element={<ProductDetailed />} />
            <Route path="/containers" element={<Containers />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/exception" element={<Exception />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/my-home"
            element={
              <PrivateRoute>
                <MyHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route
            path="/benefits"
            element={
              <PrivateRoute>
                <Benefits />
              </PrivateRoute>
            }
          />
          <Route
            path="/promotions"
            element={
              <PrivateRoute>
                <Promotions />
              </PrivateRoute>
            }
          />
          <Route
            path="/discount-code"
            element={
              <PrivateRoute>
                <DiscountCode />
              </PrivateRoute>
            }
          />
          <Route
            path="/bill-order/:id"
            element={
              <PrivateRoute>
                <BillOrder />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-account"
            element={
              <PrivateRoute>
                <MyAccount />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-personal-info"
            element={
              <PrivateRoute>
                <EditPersonalInfo />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-info"
            element={
              <PrivateRoute>
                <OrderInfo />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <PrivateRoute>
                <OrderSuccess />
              </PrivateRoute>
            }
          />

          <Route
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/accounts" element={<AdminAccounts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/ai" element={<AdminAI />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
