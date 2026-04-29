import React, { useEffect, lazy, Suspense } from "react";
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
import { Loading } from "./components/Loading";

import UserLayout from "./layout/user/UserLayout";
import AdminLayout from "./layout/admin/AdminLayout";

import { CartProvider } from "./context/CartContext";
import { STORAGE_KEYS } from './constants';

// Public pages
const Exception = lazy(() => import("./pages/Exception"));
const Home = lazy(() => import("./pages/user/Home"));
const Login = lazy(() => import("./pages/user/Login"));
const Register = lazy(() => import("./pages/user/Register"));
const ForgotPassword = lazy(() => import("./pages/user/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/user/ResetPassword"));
const ProductDetailed = lazy(() => import("./pages/user/ProductDetailed"));
const Containers = lazy(() => import("./pages/user/Containers"));
const Cart = lazy(() => import("./pages/user/Cart"));

// Private user pages
const MyHome = lazy(() => import("./pages/user/MyHome"));
const Orders = lazy(() => import("./pages/user/Orders"));
const Benefits = lazy(() => import("./pages/user/Benefits"));
const Promotions = lazy(() => import("./pages/user/Promotions"));
const DiscountCode = lazy(() => import("./pages/user/DiscountCode"));
const BillOrder = lazy(() => import("./pages/user/BillOrder"));
const MyAccount = lazy(() => import("./pages/user/MyAccount"));
const EditPersonalInfo = lazy(() => import("./pages/user/EditPersonalInfo"));
const OrderInfo = lazy(() => import("./pages/user/OrderInfo"));
const OrderSuccess = lazy(() => import("./pages/user/OrderSuccess"));

// Admin pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminAccounts = lazy(() => import("./pages/admin/AdminAccounts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminAI = lazy(() => import("./pages/admin/AdminAI"));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated =
    !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    !!localStorage.getItem(STORAGE_KEYS.USER_INFO);

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

        <Suspense fallback={<Loading />}>
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
        </Suspense>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
