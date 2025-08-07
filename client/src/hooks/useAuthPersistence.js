// hooks/useAuthPersistence.js
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const AUTH_STORAGE_KEY = "auth_backup";
const AUTH_TIMESTAMP_KEY = "auth_timestamp";

/**
 * Custom hook to handle authentication persistence for mobile browsers
 * This provides a fallback mechanism when cookies are not reliably maintained
 */
const useAuthPersistence = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, user, isAuthSliceLoadingState } = authState;

  // Save auth state to localStorage when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !isAuthSliceLoadingState) {
      const authData = {
        isAuthenticated,
        user,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
      } catch (error) {
        console.warn("Failed to save auth state to localStorage:", error);
      }
    }
  }, [isAuthenticated, user, isAuthSliceLoadingState]);

  // Clear localStorage when user logs out
  useEffect(() => {
    if (!isAuthenticated && !isAuthSliceLoadingState) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TIMESTAMP_KEY);
      } catch (error) {
        console.warn("Failed to clear auth state from localStorage:", error);
      }
    }
  }, [isAuthenticated, isAuthSliceLoadingState]);

  // Function to check if we have a valid backup auth state
  const hasValidAuthBackup = () => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);

      if (!authData || !timestamp) {
        return false;
      }

      const parsedData = JSON.parse(authData);
      const authTimestamp = parseInt(timestamp, 10);
      const now = Date.now();

      // Check if backup is less than 7 days old (same as cookie expiry)
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const isValid = now - authTimestamp < sevenDaysInMs;

      return isValid && parsedData.isAuthenticated && parsedData.user;
    } catch (error) {
      console.warn("Failed to validate auth backup:", error);
      return false;
    }
  };

  // Function to get backup auth data
  const getAuthBackup = () => {
    try {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        return JSON.parse(authData);
      }
    } catch (error) {
      console.warn("Failed to retrieve auth backup:", error);
    }
    return null;
  };

  // Function to detect if we're on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  return {
    hasValidAuthBackup,
    getAuthBackup,
    isMobileDevice,
  };
};

export default useAuthPersistence;
