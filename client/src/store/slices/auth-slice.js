// store/slices/auth-slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

console.log("");

const API_BASE_URL = import.meta.env.VITE_API_URL;

const initialState = {
  isAuthenticated: false,
  isAuthSliceLoadingState: false,
  user: null,
};

// Register with email/password
export const registerUser = createAsyncThunk(
  "auth/register",
  async (registerFormData) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      registerFormData,
      { withCredentials: true }
    );
    return response.data;
  }
);

// Login with email/password
export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginFormData) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      loginFormData,
      { withCredentials: true }
    );
    return response.data;
  }
);

// Logout with localStorage cleanup
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );

    // Clear localStorage backup on successful logout
    try {
      localStorage.removeItem("auth_backup");
      localStorage.removeItem("auth_timestamp");
    } catch (storageError) {
      console.warn("Failed to clear auth backup during logout:", storageError);
    }

    return response.data;
  } catch (error) {
    // Even if server logout fails, clear local storage
    try {
      localStorage.removeItem("auth_backup");
      localStorage.removeItem("auth_timestamp");
    } catch (storageError) {
      console.warn("Failed to clear auth backup during logout:", storageError);
    }
    throw error;
  }
});

// Check if session cookie is valid
export const checkAuth = createAsyncThunk("auth/check-auth", async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/check-auth`, {
    withCredentials: true,
  });
  return response.data;
});

// Enhanced check auth with localStorage fallback for mobile browsers
export const checkAuthWithFallback = createAsyncThunk(
  "auth/check-auth-with-fallback",
  async (_, { rejectWithValue }) => {
    // Helper function to check mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    // Helper function to get valid localStorage backup
    const getValidBackup = () => {
      try {
        const authBackup = localStorage.getItem("auth_backup");
        const timestamp = localStorage.getItem("auth_timestamp");

        if (authBackup && timestamp) {
          const parsedData = JSON.parse(authBackup);
          const authTimestamp = parseInt(timestamp, 10);
          const now = Date.now();

          // Check if backup is less than 7 days old
          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
          const isValid = now - authTimestamp < sevenDaysInMs;

          if (isValid && parsedData.isAuthenticated && parsedData.user) {
            return parsedData;
          }
        }
      } catch (error) {
        console.warn("Failed to check auth backup:", error);
      }
      return null;
    };

    // For mobile devices, prioritize localStorage backup if available
    if (isMobileDevice()) {
      const backup = getValidBackup();
      if (backup) {
        try {
          // Still try to verify with server, but don't fail if it doesn't work
          const response = await axios.get(`${API_BASE_URL}/auth/check-auth`, {
            withCredentials: true,
          });
          return response.data;
        } catch (error) {
          // If server check fails but we have valid backup, use backup
          console.log("Using localStorage backup for mobile authentication");
          return {
            success: true,
            message: "User is authenticated (from backup).",
            user: backup.user,
          };
        }
      }
    }

    try {
      // For desktop or when no backup available, try normal cookie-based auth
      const response = await axios.get(`${API_BASE_URL}/auth/check-auth`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      // Final fallback: check localStorage backup even for desktop
      const backup = getValidBackup();
      if (backup) {
        console.log("Using localStorage backup as final fallback");
        return {
          success: true,
          message: "User is authenticated (from backup).",
          user: backup.user,
        };
      }

      // If everything fails, return the original error
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Authentication failed",
        }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth-slice",
  initialState,
  reducers: {
    // Action to restore auth state from localStorage
    restoreAuthFromBackup: (state, action) => {
      const { user, isAuthenticated } = action.payload;
      state.isAuthenticated = isAuthenticated;
      state.user = user;
      state.isAuthSliceLoadingState = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── REGISTER ─────────────────────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.isAuthSliceLoadingState = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isAuthSliceLoadingState = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isAuthSliceLoadingState = false;
      })

      // ─── LOGIN ────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.isAuthSliceLoadingState = true;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.isAuthSliceLoadingState = false;
        state.isAuthenticated = payload.success;
        if (payload.success) {
          state.user = payload.user;

          // Immediately save to localStorage for mobile persistence
          try {
            const authData = {
              isAuthenticated: true,
              user: payload.user,
              timestamp: Date.now(),
            };
            localStorage.setItem("auth_backup", JSON.stringify(authData));
            localStorage.setItem("auth_timestamp", Date.now().toString());
          } catch (error) {
            console.warn("Failed to save auth state to localStorage:", error);
          }
        }
      })
      .addCase(loginUser.rejected, (state) => {
        state.isAuthSliceLoadingState = false;
      })

      // ─── CHECK AUTH ───────────────────────────────────────────────────────
      .addCase(checkAuth.pending, (state) => {
        state.isAuthSliceLoadingState = true;
      })
      .addCase(checkAuth.fulfilled, (state, { payload }) => {
        state.isAuthSliceLoadingState = false;
        state.isAuthenticated = payload.success;
        state.user = payload.success ? payload.user : null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthSliceLoadingState = false;
      })

      // ─── CHECK AUTH WITH FALLBACK ────────────────────────────────────────
      .addCase(checkAuthWithFallback.pending, (state) => {
        state.isAuthSliceLoadingState = true;
      })
      .addCase(checkAuthWithFallback.fulfilled, (state, { payload }) => {
        state.isAuthSliceLoadingState = false;
        state.isAuthenticated = payload.success;
        state.user = payload.success ? payload.user : null;
      })
      .addCase(checkAuthWithFallback.rejected, (state) => {
        state.isAuthSliceLoadingState = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // ─── LOGOUT ───────────────────────────────────────────────────────────
      .addCase(logoutUser.pending, (state) => {
        state.isAuthSliceLoadingState = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthSliceLoadingState = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthSliceLoadingState = false;
      });
  },
});

export const { restoreAuthFromBackup } = authSlice.actions;
export default authSlice.reducer;
