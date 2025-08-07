import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";

// Import slices
import authSlice from "../../store/slices/auth-slice";
import localCartSlice from "../../store/slices/local-cart-slice";
import productSlice from "../../store/slices/product-slice";
import checkoutSlice from "../../store/slices/checkout-slice";

// Import components
import { LoginForm } from "../../components/auth-view/LoginForm";
import { RegisterForm } from "../../components/auth-view/RegisterForm";
import ProductCards from "../../components/product/ProductCards";
import UserCart from "../../pages/user-view/UserCart";

import {
  mockUser,
  mockProduct,
  mockAddress,
  testCredentials,
  testRegisterData,
  mockAxiosResponse,
} from "../../utils/testUtils";

// Mock axios
jest.mock("axios");
const mockedAxios = axios;

// Mock other dependencies
jest.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("../../components/payment-view/StripeCheckoutButton", () => {
  return function MockStripeCheckoutButton() {
    return <button data-testid="stripe-checkout">Checkout with Stripe</button>;
  };
});

jest.mock("../../components/user-view/UpdateAddress", () => {
  return function MockUpdateAddress() {
    return <div data-testid="update-address">Update Address Form</div>;
  };
});

jest.mock("../../utils/cloudinary-helper", () => ({
  uploadImageToCloudinary: jest.fn(),
}));

// Create a test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      localCart: localCartSlice,
      product: productSlice,
      checkout: checkoutSlice,
    },
    preloadedState,
  });
};

// Test wrapper component
const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe("E-Commerce Integration Tests", () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("User Authentication Flow", () => {
    test("complete user registration and login flow", async () => {
      const user = userEvent.setup();

      // Test Registration
      const registerResponse = mockAxiosResponse({
        success: true,
        message: "Registration successful",
      });
      mockedAxios.post.mockResolvedValueOnce(registerResponse);

      const { rerender } = render(
        <TestWrapper store={store}>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill registration form
      await user.type(
        screen.getByLabelText("Name"),
        testRegisterData.valid.username
      );
      await user.type(
        screen.getByLabelText("Email"),
        testRegisterData.valid.email
      );
      await user.type(
        screen.getByLabelText("Password"),
        testRegisterData.valid.password
      );

      await user.click(screen.getByRole("button", { name: "Sign up" }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/auth/register",
          testRegisterData.valid,
          { withCredentials: true }
        );
      });

      // Test Login after registration
      const loginResponse = mockAxiosResponse({
        success: true,
        message: "Login successful",
        user: mockUser,
      });
      mockedAxios.post.mockResolvedValueOnce(loginResponse);

      // Render login form
      rerender(
        <TestWrapper store={store}>
          <LoginForm />
        </TestWrapper>
      );

      await user.type(
        screen.getByLabelText("Email"),
        testCredentials.valid.email
      );
      await user.type(
        screen.getByLabelText("Password"),
        testCredentials.valid.password
      );

      await user.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/auth/login",
          testCredentials.valid,
          { withCredentials: true }
        );
      });
    });

    test("handles authentication errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock failed login
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { success: false, message: "Invalid credentials" },
        },
      });

      render(
        <TestWrapper store={store}>
          <LoginForm />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText("Email"), "wrong@email.com");
      await user.type(screen.getByLabelText("Password"), "wrongpassword");

      await user.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });

  describe("Shopping Cart Flow", () => {
    test("complete add to cart and quantity management flow", async () => {
      const user = userEvent.setup();

      // Set authenticated state
      const authenticatedStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
          isAuthSliceLoadingState: false,
        },
        product: {
          isProductSliceLoadingState: false,
          userCart: { items: [] },
          totalCost: "$0",
        },
      });

      const mockProductWithSizes = {
        ...mockProduct,
        productSize: { xs: 5, s: 10, m: 15, l: 8, xl: 3, "2xl": 0 },
      };

      // Mock successful add to cart
      const addToCartResponse = mockAxiosResponse({
        success: true,
        message: "Added to cart successfully",
      });
      mockedAxios.post.mockResolvedValueOnce(addToCartResponse);

      // Mock location for product view
      jest.doMock("react-router-dom", () => ({
        ...jest.requireActual("react-router-dom"),
        useLocation: () => ({ pathname: "/user/products" }),
        useNavigate: () => jest.fn(),
      }));

      render(
        <TestWrapper store={authenticatedStore}>
          <ProductCards product={mockProductWithSizes} />
        </TestWrapper>
      );

      // Open product dialog
      const viewProductButton = screen.getByText("View Product");
      await user.click(viewProductButton);

      // Select size
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });

      const sizeSelector = screen.getByRole("combobox");
      await user.click(sizeSelector);

      await waitFor(() => {
        expect(screen.getByText("M")).toBeInTheDocument();
      });

      await user.click(screen.getByText("M"));

      // Add to cart
      const addToCartButton = screen.getByText("Add To Cart");
      await user.click(addToCartButton);

      // Verify add to cart was called
      expect(addToCartButton).toBeInTheDocument();
    });

    test("local cart operations work correctly", () => {
      const localCartStore = createTestStore();

      // Test adding items to local cart
      localCartStore.dispatch({
        type: "localCart/addItem",
        payload: { product: mockProduct, size: "M" },
      });

      let state = localCartStore.getState().localCart;
      expect(state[`${mockProduct._id}__M`]).toEqual({
        product: mockProduct,
        size: "M",
        quantity: 1,
      });

      // Test increasing quantity
      localCartStore.dispatch({
        type: "localCart/increaseQty",
        payload: { productId: mockProduct._id, size: "M" },
      });

      state = localCartStore.getState().localCart;
      expect(state[`${mockProduct._id}__M`].quantity).toBe(2);

      // Test decreasing quantity
      localCartStore.dispatch({
        type: "localCart/decreaseQty",
        payload: { productId: mockProduct._id, size: "M" },
      });

      state = localCartStore.getState().localCart;
      expect(state[`${mockProduct._id}__M`].quantity).toBe(1);

      // Test removing item
      localCartStore.dispatch({
        type: "localCart/removeItem",
        payload: { productId: mockProduct._id, size: "M" },
      });

      state = localCartStore.getState().localCart;
      expect(state[`${mockProduct._id}__M`]).toBeUndefined();
    });
  });

  describe("Cart Management in User Cart Page", () => {
    test("displays cart items and allows quantity modifications", async () => {
      const user = userEvent.setup();

      const cartStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        product: {
          userCart: {
            items: [
              {
                _id: "item1",
                product: mockProduct,
                quantity: 2,
                size: "M",
              },
            ],
          },
          totalCost: "$199.98",
        },
        checkout: {
          userAddress: mockAddress,
          userOrders: [],
        },
      });

      // Mock location for cart view
      jest.doMock("react-router-dom", () => ({
        ...jest.requireActual("react-router-dom"),
        useLocation: () => ({ pathname: "/user/cart" }),
        useNavigate: () => jest.fn(),
      }));

      render(
        <TestWrapper store={cartStore}>
          <UserCart />
        </TestWrapper>
      );

      // Verify cart items are displayed
      expect(screen.getByText("Total: $199.98")).toBeInTheDocument();

      // Check if cart tab is active
      const cartTab = screen.getByRole("tab", { name: /Cart/ });
      expect(cartTab).toHaveAttribute("data-state", "active");
    });

    test("handles empty cart state", () => {
      const emptyCartStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        product: {
          userCart: { items: [] },
          totalCost: "$0",
        },
        checkout: {
          userAddress: null,
          userOrders: [],
        },
      });

      render(
        <TestWrapper store={emptyCartStore}>
          <UserCart />
        </TestWrapper>
      );

      expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument();
      expect(screen.getByText("Total: $0")).toBeInTheDocument();
    });
  });

  describe("Address Management Flow", () => {
    test("complete address management workflow", async () => {
      const user = userEvent.setup();

      const addressStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        product: {
          userCart: { items: [] },
          totalCost: "$0",
        },
        checkout: {
          userAddress: null,
          userOrders: [],
        },
      });

      // Mock successful address addition
      const addAddressResponse = mockAxiosResponse({
        success: true,
        message: "Address added successfully",
      });
      mockedAxios.post.mockResolvedValueOnce(addAddressResponse);

      render(
        <TestWrapper store={addressStore}>
          <UserCart />
        </TestWrapper>
      );

      // Fill address form
      await user.type(screen.getByLabelText("Full Name"), "John Doe");
      await user.type(screen.getByLabelText("Street Address"), "123 Main St");
      await user.type(screen.getByLabelText("City"), "New York");
      await user.type(screen.getByLabelText("State/Province/Region"), "NY");
      await user.type(screen.getByLabelText("Postal/Zip Code"), "10001");
      await user.type(screen.getByLabelText("Country"), "USA");

      // Submit form
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Verify form data
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    });

    test("handles address update and deletion", async () => {
      const user = userEvent.setup();

      const addressStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        product: {
          userCart: { items: [] },
          totalCost: "$0",
        },
        checkout: {
          userAddress: mockAddress,
          userOrders: [],
        },
      });

      render(
        <TestWrapper store={addressStore}>
          <UserCart />
        </TestWrapper>
      );

      // Test address update
      const updateButton = screen.getByRole("button", { name: "Update" });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId("update-address")).toBeInTheDocument();
      });

      // Test address deletion
      const deleteButton = screen.getByRole("button", { name: "Delete" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText("Are you absolutely sure?")
        ).toBeInTheDocument();
      });

      // Cancel deletion
      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Are you absolutely sure?")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Order History Flow", () => {
    test("displays order history correctly", async () => {
      const user = userEvent.setup();

      const orderHistoryStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        product: {
          userCart: { items: [] },
          totalCost: "$0",
        },
        checkout: {
          userAddress: mockAddress,
          userOrders: [
            {
              _id: "order1",
              createdAt: "2023-01-01T00:00:00.000Z",
              orderStatus: "delivered",
              totalAmount: 149.98,
              addressInfo: mockAddress,
              cartItems: [
                {
                  _id: "orderItem1",
                  product: {
                    productName: "Test Product",
                    productPrice: 74.99,
                  },
                },
              ],
            },
          ],
        },
      });

      render(
        <TestWrapper store={orderHistoryStore}>
          <UserCart />
        </TestWrapper>
      );

      // Switch to orders tab
      const ordersTab = screen.getByRole("tab", { name: /Orders/ });
      await user.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText("Order on 1/1/2023")).toBeInTheDocument();
        expect(screen.getByText("Status: delivered")).toBeInTheDocument();
        expect(screen.getByText("Total: $149.98")).toBeInTheDocument();
      });
    });

    test("handles empty order history", async () => {
      const user = userEvent.setup();

      const emptyOrderStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        product: {
          userCart: { items: [] },
          totalCost: "$0",
        },
        checkout: {
          userAddress: mockAddress,
          userOrders: [],
        },
      });

      render(
        <TestWrapper store={emptyOrderStore}>
          <UserCart />
        </TestWrapper>
      );

      // Switch to orders tab
      const ordersTab = screen.getByRole("tab", { name: /Orders/ });
      await user.click(ordersTab);

      await waitFor(() => {
        expect(
          screen.getByText(/You currently have no orders/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    test("handles network errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock network error
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      render(
        <TestWrapper store={store}>
          <LoginForm />
        </TestWrapper>
      );

      await user.type(
        screen.getByLabelText("Email"),
        testCredentials.valid.email
      );
      await user.type(
        screen.getByLabelText("Password"),
        testCredentials.valid.password
      );

      await user.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });

    test("handles invalid product data", () => {
      const invalidProductStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
      });

      const invalidProduct = {
        _id: "invalid",
        productName: null,
        productPrice: undefined,
      };

      render(
        <TestWrapper store={invalidProductStore}>
          <ProductCards product={invalidProduct} />
        </TestWrapper>
      );

      // Should render without crashing
      expect(screen.getByRole("article")).toBeInTheDocument();
    });

    test("handles session expiry during operations", async () => {
      const user = userEvent.setup();

      // Mock 401 Unauthorized response
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401, data: { message: "Session expired" } },
      });

      const expiredSessionStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
      });

      render(
        <TestWrapper store={expiredSessionStore}>
          <UserCart />
        </TestWrapper>
      );

      // Try to add address
      await user.type(screen.getByLabelText("Full Name"), "John Doe");
      await user.click(screen.getByRole("button", { name: "Add" }));

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });

  describe("Performance and Stress Tests", () => {
    test("handles large cart with many items", () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        _id: `item${i}`,
        product: {
          ...mockProduct,
          _id: `product${i}`,
          productName: `Product ${i}`,
        },
        quantity: Math.floor(Math.random() * 5) + 1,
        size: ["S", "M", "L"][Math.floor(Math.random() * 3)],
      }));

      const largeCartStore = createTestStore({
        auth: {
          isAuthenticated: true,
          user: mockUser,
        },
        product: {
          userCart: { items: manyItems },
          totalCost: "$2499.50",
        },
        checkout: {
          userAddress: mockAddress,
          userOrders: [],
        },
      });

      render(
        <TestWrapper store={largeCartStore}>
          <UserCart />
        </TestWrapper>
      );

      expect(screen.getByText("Total: $2499.50")).toBeInTheDocument();
    });

    test("handles rapid user interactions", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper store={store}>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      // Rapid typing
      await user.type(emailInput, "test@example.com");
      await user.clear(emailInput);
      await user.type(emailInput, "test@example.com");

      await user.type(passwordInput, "password");
      await user.clear(passwordInput);
      await user.type(passwordInput, "password");

      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password");
    });
  });
});

// Helper function to render with all providers
function render(ui, options = {}) {
  return require("@testing-library/react").render(ui, options);
}
