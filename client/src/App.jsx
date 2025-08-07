import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/admin-view/AdminLayout";
import AdminDashboard from "./pages/admin-view/AdminDashboard";
import AdminProducts from "./pages/admin-view/AdminProducts";
import AdminOrders from "./pages/admin-view/AdminOrders";
import Register from "./pages/auth-view/Register";
import Login from "./pages/auth-view/Login";
import AuthLayout from "./components/auth-view/AuthLayout";
import AuthRoute from "./components/auth-routes/AuthRoute";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthWithFallback } from "./store/slices/auth-slice";
import useAuthPersistence from "./hooks/useAuthPersistence";
import { Loader2 } from "lucide-react";
import NotFound from "./components/not-found/NotFound";
import UserLayout from "./components/user-view/UserLayout";
const UserHomepage = lazy(() => import("./pages/user-view/UserHomepage"));
const UserCart = lazy(() => import("./pages/user-view/UserCart"));
const ProductPage = lazy(() => import("./pages/product-view/ProductPage"));
const SearchPage = lazy(() => import("./pages/product-view/SearchPage"));
import { fetchAllProducts, fetchUserCart } from "./store/slices/product-slice";
import {
  fetchUserAddress,
  fetchUserOrders,
} from "./store/slices/checkout-slice";
import { Navigate } from "react-router-dom";
import useTheme from "./hooks/useTheme";
import SessionManager from "./components/session/SessionManager";

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const { hasValidAuthBackup, getAuthBackup, isMobileDevice } =
    useAuthPersistence();

  // Check if the user is authenticated and fetch initial data
  const authState = useSelector((state) => state.auth);
  const { user } = authState;

  const { isAuthSliceLoadingState } = authState;
  const dispatch = useDispatch();

  useEffect(() => {
    // Debug info for mobile authentication
    if (process.env.NODE_ENV === "development") {
      console.log("App initializing - Mobile device:", isMobileDevice());
      console.log("Has valid auth backup:", hasValidAuthBackup());
    }

    // Always use the enhanced auth check with fallback
    dispatch(checkAuthWithFallback());
    dispatch(fetchAllProducts());
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserCart({ id: user.userId }));
      dispatch(fetchUserOrders({ id: user.userId }));
      dispatch(fetchUserAddress(user.userId));
    }
  }, [user]);

  if (isAuthSliceLoadingState)
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
          <p className="text-lg font-medium dark:text-white">Loading...</p>
        </div>
      </div>
    );

  const loader = (
    <div className="flex justify-center items-center min-h-screen dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
        <p className="text-lg font-medium dark:text-white">Loading...</p>
      </div>
    </div>
  );

  return (
    <SessionManager>
      <Routes>
        <Route
          path="/"
          element={
            <AuthRoute>
              <Navigate to="/user/home" replace />
            </AuthRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <AuthLayout />
            </AuthRoute>
          }
        >
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AuthRoute>
              <AdminLayout />
            </AuthRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route
          path="/user"
          element={
            <AuthRoute>
              <UserLayout />
            </AuthRoute>
          }
        >
          <Route path="home" element={<UserHomepage />} />
          <Route path="cart" element={<UserCart />} />
          <Route
            path="products"
            element={
              <Suspense fallback={loader}>
                <ProductPage />
              </Suspense>
            }
          />
          <Route
            path="search"
            element={
              <Suspense fallback={loader}>
                <SearchPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </SessionManager>
  );
};

export default App;
