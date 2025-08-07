import { configureStore } from "@reduxjs/toolkit";
import authSlice, {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  checkAuthWithFallback,
} from "../auth-slice";
import axios from "axios";
import {
  mockAxiosResponse,
  mockUser,
  testCredentials,
  testRegisterData,
} from "../../../utils/testUtils";

// Mock axios
jest.mock("axios");
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("Auth Slice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    test("should have correct initial state", () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        isAuthenticated: false,
        isAuthSliceLoadingState: false,
        user: null,
      });
    });
  });

  describe("registerUser async thunk", () => {
    test("should handle successful registration", async () => {
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Registration successful",
        user: mockUser,
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(registerUser(testRegisterData.valid));

      expect(action.type).toBe("auth/register/fulfilled");
      expect(action.payload).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/register",
        testRegisterData.valid,
        { withCredentials: true }
      );
    });

    test("should handle registration failure", async () => {
      const errorMessage = "Email already exists";
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      const action = await store.dispatch(registerUser(testRegisterData.valid));

      expect(action.type).toBe("auth/register/rejected");
    });

    test("should handle network error during registration", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      const action = await store.dispatch(registerUser(testRegisterData.valid));

      expect(action.type).toBe("auth/register/rejected");
    });
  });

  describe("loginUser async thunk", () => {
    test("should handle successful login", async () => {
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Login successful",
        user: mockUser,
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(loginUser(testCredentials.valid));

      expect(action.type).toBe("auth/login/fulfilled");
      expect(action.payload).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/login",
        testCredentials.valid,
        { withCredentials: true }
      );

      // Check state updates
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthSliceLoadingState).toBe(false);
    });

    test("should handle login failure", async () => {
      const errorMessage = "Invalid credentials";
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      const action = await store.dispatch(loginUser(testCredentials.invalid));

      expect(action.type).toBe("auth/login/rejected");

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.isAuthSliceLoadingState).toBe(false);
    });

    test("should set loading state during login", () => {
      const pendingAction = { type: "auth/login/pending" };
      const state = authSlice(undefined, pendingAction);

      expect(state.isAuthSliceLoadingState).toBe(true);
    });
  });

  describe("logoutUser async thunk", () => {
    test("should handle successful logout", async () => {
      // First login to set authenticated state
      const loginResponse = mockAxiosResponse({
        success: true,
        message: "Login successful",
        user: mockUser,
      });
      mockedAxios.post.mockResolvedValueOnce(loginResponse);
      await store.dispatch(loginUser(testCredentials.valid));

      // Mock logout response
      const logoutResponse = mockAxiosResponse({
        success: true,
        message: "Logout successful",
      });
      mockedAxios.post.mockResolvedValueOnce(logoutResponse);

      const action = await store.dispatch(logoutUser());

      expect(action.type).toBe("auth/logout/fulfilled");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );

      // Check state is reset
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.isAuthSliceLoadingState).toBe(false);

      // Check localStorage is cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_backup");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "auth_timestamp"
      );
    });

    test("should clear localStorage even if server logout fails", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Server Error"));

      const action = await store.dispatch(logoutUser());

      expect(action.type).toBe("auth/logout/rejected");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_backup");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "auth_timestamp"
      );
    });
  });

  describe("checkAuth async thunk", () => {
    test("should handle successful auth check", async () => {
      const mockResponse = mockAxiosResponse({
        success: true,
        user: mockUser,
      });

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(checkAuth());

      expect(action.type).toBe("auth/check-auth/fulfilled");
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/check-auth",
        { withCredentials: true }
      );

      // Check state updates
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    test("should handle failed auth check", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: "Unauthorized" } },
      });

      const action = await store.dispatch(checkAuth());

      expect(action.type).toBe("auth/check-auth/rejected");

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
    });
  });

  describe("checkAuthWithFallback async thunk", () => {
    test("should use localStorage fallback when server fails", async () => {
      const backupData = JSON.stringify({
        isAuthenticated: true,
        user: mockUser,
      });

      localStorageMock.getItem.mockReturnValueOnce(backupData);
      localStorageMock.getItem.mockReturnValueOnce(Date.now().toString());

      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      const action = await store.dispatch(checkAuthWithFallback());

      expect(action.type).toBe("auth/check-auth-fallback/fulfilled");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("auth_backup");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("auth_timestamp");
    });

    test("should ignore expired localStorage data", async () => {
      const backupData = JSON.stringify({
        isAuthenticated: true,
        user: mockUser,
      });

      const expiredTimestamp = (Date.now() - 25 * 60 * 60 * 1000).toString(); // 25 hours ago

      localStorageMock.getItem.mockReturnValueOnce(backupData);
      localStorageMock.getItem.mockReturnValueOnce(expiredTimestamp);

      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      const action = await store.dispatch(checkAuthWithFallback());

      expect(action.type).toBe("auth/check-auth-fallback/rejected");
    });
  });

  describe("Loading States", () => {
    test("should set loading to true on pending actions", () => {
      const pendingActions = [
        { type: "auth/register/pending" },
        { type: "auth/login/pending" },
        { type: "auth/logout/pending" },
        { type: "auth/check-auth/pending" },
        { type: "auth/check-auth-fallback/pending" },
      ];

      pendingActions.forEach((action) => {
        const state = authSlice(undefined, action);
        expect(state.isAuthSliceLoadingState).toBe(true);
      });
    });

    test("should set loading to false on fulfilled/rejected actions", () => {
      const actions = [
        { type: "auth/register/fulfilled", payload: { success: true } },
        { type: "auth/register/rejected" },
        {
          type: "auth/login/fulfilled",
          payload: { success: true, user: mockUser },
        },
        { type: "auth/login/rejected" },
        { type: "auth/logout/fulfilled", payload: { success: true } },
        { type: "auth/logout/rejected" },
        {
          type: "auth/check-auth/fulfilled",
          payload: { success: true, user: mockUser },
        },
        { type: "auth/check-auth/rejected" },
        {
          type: "auth/check-auth-fallback/fulfilled",
          payload: { success: true, user: mockUser },
        },
        { type: "auth/check-auth-fallback/rejected" },
      ];

      actions.forEach((action) => {
        const state = authSlice(undefined, action);
        expect(state.isAuthSliceLoadingState).toBe(false);
      });
    });
  });

  describe("State Updates", () => {
    test("should update state correctly on successful login", () => {
      const action = {
        type: "auth/login/fulfilled",
        payload: {
          success: true,
          user: mockUser,
        },
      };

      const state = authSlice(undefined, action);

      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthSliceLoadingState).toBe(false);
    });

    test("should reset state on logout", () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        isAuthSliceLoadingState: false,
      };

      const action = {
        type: "auth/logout/fulfilled",
        payload: { success: true },
      };

      const state = authSlice(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.isAuthSliceLoadingState).toBe(false);
    });

    test("should handle auth check failure by resetting state", () => {
      const initialState = {
        isAuthenticated: true,
        user: mockUser,
        isAuthSliceLoadingState: false,
      };

      const action = { type: "auth/check-auth/rejected" };

      const state = authSlice(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBe(null);
      expect(state.isAuthSliceLoadingState).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    test("should handle malformed localStorage data", async () => {
      localStorageMock.getItem.mockReturnValueOnce("invalid json");
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      const action = await store.dispatch(checkAuthWithFallback());

      expect(action.type).toBe("auth/check-auth-fallback/rejected");
    });

    test("should handle missing localStorage data", async () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      const action = await store.dispatch(checkAuthWithFallback());

      expect(action.type).toBe("auth/check-auth-fallback/rejected");
    });

    test("should handle localStorage storage errors during logout", async () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("Storage Error");
      });

      const logoutResponse = mockAxiosResponse({
        success: true,
        message: "Logout successful",
      });
      mockedAxios.post.mockResolvedValueOnce(logoutResponse);

      const action = await store.dispatch(logoutUser());

      expect(action.type).toBe("auth/logout/fulfilled");
      // Should not throw error even if localStorage fails
    });
  });
});
