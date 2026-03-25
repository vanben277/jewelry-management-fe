import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Import Layout & Components
import Header from "./layout/user/Header";
import BannerPopup from "./layout/user/BannerPopup";
import Footer from "./layout/user/Footer";

import HeadAdmin from "./layout/admin/Head";
import FooterAdmin from "./layout/admin/Footer";
import Sidebar from "./layout/admin/Sidebar";

import { CartProvider } from "./context/CartContext";

// Import Pages
import Exception from "./pages/Exception";
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from "./pages/user/ForgotPassword";
import MyHome from "./pages/user/MyHome";
import Orders from "./pages/user/Orders";
import Benefits from "./pages/user/Benefits";
import Promotions from "./pages/user/Promotions";
import DiscountCode from "./pages/user/DiscountCode";
import BillOrder from "./pages/user/BillOrder";
import MyAccount from "./pages/user/MyAccount";
import EditPersonalInfo from "./pages/user/EditPersonalInfo";
import ProductDetailed from "./pages/user/ProductDetailed";
import Containers from "./pages/user/Containers";
import Cart from "./pages/user/Cart";
import OrderInfo from "./pages/user/OrderInfo";
import OrderSuccess from "./pages/user/OrderSuccess";
import ResetPassword from "./pages/user/ResetPassword";

import Dashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAI from "./pages/admin/AdminAI";

// --- 1. COMPONENT LAYOUT CHUNG ---
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // Các trang không hiển thị Header/Footer của bản PC (giống logic cũ của bạn)
  const isMobileLayoutPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/my-home" ||
    location.pathname === "/orders" ||
    location.pathname === "/benefits" ||
    location.pathname === "/promotions" ||
    location.pathname === "/discount-code" ||
    location.pathname === "/my-account" ||
    location.pathname === "/edit-personal-info" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/bill-order");

  const isAdminPage = location.pathname.startsWith("/admin");

  // Trang User bình thường (Hiện Header/Footer/Banner)
  const isNormalUserPage = !isAdminPage && !isMobileLayoutPage;

  if (isMobileLayoutPage) return <>{children}</>;

  const [isPinned, setIsPinned] = useState(false);

  const toggleSidenav = () => {
    setIsPinned(!isPinned);
  };

  useEffect(() => {
    if (isPinned) {
      document.body.classList.add("g-sidenav-pinned");
    } else {
      document.body.classList.remove("g-sidenav-pinned");
    }
  }, [isPinned]);

  return (
    <>
      {isNormalUserPage && <BannerPopup />}

      {isAdminPage ? (
        <div
          className={`g-sidenav-show bg-gray-100 ${isPinned ? "g-sidenav-pinned" : ""}`}
        >
          <Sidebar />

          <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg mr-[1%]">
            <HeadAdmin onToggleSidenav={toggleSidenav} />

            <div className="container-fluid py-4">
              {children}
              <FooterAdmin />
            </div>
          </main>

          {isPinned && (
            <div
              className="fixed inset-0 z-[990] bg-black/30 d-xl-none"
              onClick={toggleSidenav}
            ></div>
          )}
        </div>
      ) : (
        <div className="app">
          <Header />
          <>{children}</>
          <Footer />
        </div>
      )}
    </>
  );
};

// --- 2. COMPONENT BẢO VỆ TRANG (PRIVATE ROUTE) ---
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Kiểm tra login qua access_token hoặc userInfo
  const isAuthenticated =
    !!localStorage.getItem("access_token") ||
    !!localStorage.getItem("userInfo");

  // Nếu chưa đăng nhập -> Đá về trang Login
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// --- 3. CẤU TRÚC APP CHÍNH ---
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Toaster position="top-right" reverseOrder={false} />

        <AppLayout>
          <Routes>
            {/* --- PUBLIC ROUTES (Ai cũng vào được) --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product-detailed/:id" element={<ProductDetailed />} />
            <Route path="/containers" element={<Containers />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/exception" element={<Exception />} />

            {/* --- PRIVATE ROUTES (Bắt buộc phải đăng nhập) --- */}
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
              path="/my-home"
              element={
                <PrivateRoute>
                  <MyHome />
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

            {/* --- ADMIN ROUTES --- */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/accounts"
              element={
                <PrivateRoute>
                  <AdminAccounts />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <PrivateRoute>
                  <AdminOrders />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <PrivateRoute>
                  <AdminCategories />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <PrivateRoute>
                  <AdminProducts />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/ai"
              element={
                <PrivateRoute>
                  <AdminAI />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/profile"
              element={
                <PrivateRoute>
                  <AdminProfile />
                </PrivateRoute>
              }
            />

            {/* Điều hướng mặc định */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppLayout>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
