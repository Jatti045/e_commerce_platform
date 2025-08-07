import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthRoute = ({ children }) => {
  const location = useLocation();

  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, user, isAuthSliceLoadingState } = authState;

  // Show loading spinner while checking authentication
  if (isAuthSliceLoadingState) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gradient-to-b dark:from-black dark:to-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white" />
          <p className="text-lg font-medium dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && location.pathname.startsWith("/auth")) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
    else return <Navigate to="/user/home" />;
  }

  if (
    isAuthenticated &&
    user.role === "admin" &&
    location.pathname.startsWith("/user")
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  if (
    isAuthenticated &&
    user.role === "user" &&
    location.pathname.startsWith("/admin")
  ) {
    return <Navigate to="/user/home" />;
  }

  if (!isAuthenticated && location.pathname.startsWith("/admin")) {
    return <Navigate to="/auth/login" />;
  }

  return children;
};

export default AuthRoute;
