// components/debug/AuthDebug.jsx
import React from "react";
import { useSelector } from "react-redux";
import useAuthPersistence from "../../hooks/useAuthPersistence";

/**
 * Debug component to monitor authentication state
 * Only shows in development mode
 */
const AuthDebug = () => {
  const authState = useSelector((state) => state.auth);
  const { hasValidAuthBackup, getAuthBackup, isMobileDevice } =
    useAuthPersistence();

  // Only show in development
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  const authBackup = getAuthBackup();

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        fontSize: "12px",
        zIndex: 9999,
        borderRadius: "4px",
        maxWidth: "300px",
      }}
    >
      <div>
        <strong>Auth Debug Info:</strong>
      </div>
      <div>Mobile Device: {isMobileDevice() ? "Yes" : "No"}</div>
      <div>Is Authenticated: {authState.isAuthenticated ? "Yes" : "No"}</div>
      <div>Loading: {authState.isAuthSliceLoadingState ? "Yes" : "No"}</div>
      <div>User: {authState.user ? authState.user.username : "None"}</div>
      <div>Has Backup: {hasValidAuthBackup() ? "Yes" : "No"}</div>
      {authBackup && (
        <div>
          Backup User: {authBackup.user ? authBackup.user.username : "None"}
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
