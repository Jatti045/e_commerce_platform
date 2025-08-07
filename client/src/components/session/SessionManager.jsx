// components/session/SessionManager.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useAuthPersistence from "../../hooks/useAuthPersistence";
import {
  checkAuthWithFallback,
  restoreAuthFromBackup,
} from "../../store/slices/auth-slice";

/**
 * SessionManager component handles authentication persistence across page refreshes
 * Provides special handling for mobile browsers where cookies might not persist reliably
 */
const SessionManager = ({ children }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, isAuthSliceLoadingState } = authState;
  const { hasValidAuthBackup, getAuthBackup, isMobileDevice } =
    useAuthPersistence();

  // Handle visibility change (when user switches tabs/apps and comes back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isMobileDevice()) {
        // When page becomes visible again on mobile, re-check auth
        dispatch(checkAuthWithFallback());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [dispatch, isMobileDevice]);

  // Handle focus events (when user returns to the tab)
  useEffect(() => {
    const handleFocus = () => {
      if (isMobileDevice() && !isAuthenticated && hasValidAuthBackup()) {
        // Re-check auth when returning to tab
        dispatch(checkAuthWithFallback());
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated, hasValidAuthBackup, isMobileDevice, dispatch]);

  // Handle beforeunload to ensure auth state is saved
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && authState.user) {
        try {
          const authData = {
            isAuthenticated: true,
            user: authState.user,
            timestamp: Date.now(),
          };
          localStorage.setItem("auth_backup", JSON.stringify(authData));
          localStorage.setItem("auth_timestamp", Date.now().toString());
        } catch (error) {
          console.warn("Failed to save auth state before unload:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated, authState.user]);

  return children;
};

export default SessionManager;
