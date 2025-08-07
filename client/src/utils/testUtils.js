import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../store/slices/auth-slice";
import localCartSlice from "../store/slices/local-cart-slice";
import productSlice from "../store/slices/product-slice";
import checkoutSlice from "../store/slices/checkout-slice";

// Create a mock store with initial state
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      localCart: localCartSlice,
      product: productSlice,
      checkout: checkoutSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        isAuthSliceLoadingState: false,
        user: null,
        ...initialState.auth,
      },
      localCart: {
        ...initialState.localCart,
      },
      product: {
        userCart: [],
        totalCost: 0,
        ...initialState.product,
      },
      checkout: {
        userAddress: [],
        userOrders: [],
        ...initialState.checkout,
      },
    },
  });
};

// Render component with providers
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = createMockStore(initialState),
    ...renderOptions
  } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock user data
export const mockUser = {
  _id: "60d0fe4f5311236168a109ca",
  username: "testuser",
  email: "test@example.com",
  role: "user",
};

// Mock product data
export const mockProduct = {
  _id: "60d0fe4f5311236168a109cb",
  title: "Test Product",
  description: "This is a test product",
  category: "men",
  brand: "TestBrand",
  price: 99.99,
  salePrice: 79.99,
  totalStock: 10,
  images: ["https://example.com/image1.jpg"],
  sizes: ["S", "M", "L"],
};

// Mock cart item
export const mockCartItem = {
  product: mockProduct,
  size: "M",
  quantity: 2,
};

// Mock address data
export const mockAddress = {
  _id: "60d0fe4f5311236168a109cc",
  address: "123 Test Street",
  city: "Test City",
  state: "Test State",
  pincode: "12345",
  phone: "123-456-7890",
  notes: "Test notes",
};

// Mock axios responses
export const mockAxiosResponse = (data, status = 200) => ({
  data,
  status,
  statusText: "OK",
  headers: {},
  config: {},
});

// Mock toast function
export const mockToast = jest.fn();

// Common test data
export const testCredentials = {
  valid: {
    email: "test@example.com",
    password: "password123",
  },
  invalid: {
    email: "invalid@email",
    password: "123",
  },
};

export const testRegisterData = {
  valid: {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  },
  invalid: {
    username: "",
    email: "invalid-email",
    password: "123",
  },
};
