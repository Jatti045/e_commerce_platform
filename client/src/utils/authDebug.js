// utils/authDebug.js
/**
 * Utility functions for debugging authentication issues on mobile devices
 */

export const debugAuthState = () => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  console.log("=== Auth Debug Info ===");
  console.log("Device type:", isMobile ? "Mobile" : "Desktop");
  console.log("User Agent:", navigator.userAgent);

  // Check localStorage
  try {
    const authBackup = localStorage.getItem("auth_backup");
    const timestamp = localStorage.getItem("auth_timestamp");

    if (authBackup && timestamp) {
      const parsedData = JSON.parse(authBackup);
      const authTimestamp = parseInt(timestamp, 10);
      const now = Date.now();
      const ageInHours = (now - authTimestamp) / (1000 * 60 * 60);

      console.log("LocalStorage backup found:");
      console.log("- Age:", ageInHours.toFixed(2), "hours");
      console.log("- User:", parsedData.user?.username || "Unknown");
      console.log("- Valid:", ageInHours < 168); // 7 days = 168 hours
    } else {
      console.log("No localStorage backup found");
    }
  } catch (error) {
    console.log("Error reading localStorage:", error);
  }

  // Check cookies
  console.log("Document cookies:", document.cookie);
  console.log("======================");
};

export const clearAuthDebug = () => {
  try {
    localStorage.removeItem("auth_backup");
    localStorage.removeItem("auth_timestamp");
    console.log("Auth backup cleared from localStorage");
  } catch (error) {
    console.error("Failed to clear auth backup:", error);
  }
};
