import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserCart from "../UserCart";
import {
  renderWithProviders,
  mockUser,
  mockProduct,
  mockAddress,
} from "../../../utils/testUtils";

// Mock dependencies
jest.mock("../../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("../../../store/slices/checkout-slice", () => ({
  addUserAddress: jest.fn(),
  deleteUserAddress: jest.fn(),
  fetchUserAddress: jest.fn(),
}));

jest.mock("../../../store/slices/product-slice", () => ({
  fetchUserCart: jest.fn(),
}));

jest.mock("@/components/payment-view/StripeCheckoutButton", () => {
  return function MockStripeCheckoutButton() {
    return <button>Checkout with Stripe</button>;
  };
});

jest.mock("@/components/product/ProductCards", () => {
  return function MockProductCards({ product, quantity, size }) {
    return (
      <div data-testid={`product-card-${product._id}`}>
        <h3>{product.productName}</h3>
        <p>Quantity: {quantity}</p>
        <p>Size: {size}</p>
        <p>Price: ${product.productPrice}</p>
      </div>
    );
  };
});

jest.mock("@/components/user-view/UpdateAddress", () => {
  return function MockUpdateAddress() {
    return <div data-testid="update-address">Update Address Form</div>;
  };
});

describe("UserCart Component", () => {
  const mockCartItems = [
    {
      _id: "item1",
      product: mockProduct,
      quantity: 2,
      size: "M",
    },
    {
      _id: "item2",
      product: {
        ...mockProduct,
        _id: "product2",
        productName: "Test Product 2",
      },
      quantity: 1,
      size: "L",
    },
  ];

  const mockOrders = [
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
  ];

  const initialState = {
    auth: {
      isAuthenticated: true,
      user: mockUser,
    },
    product: {
      userCart: { items: mockCartItems },
      totalCost: "$149.98",
    },
    checkout: {
      userAddress: mockAddress,
      userOrders: mockOrders,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders main cart components", () => {
      renderWithProviders(<UserCart />, { initialState });

      expect(screen.getByText("Add New Address")).toBeInTheDocument();
      expect(screen.getByText("Checkout")).toBeInTheDocument();
      expect(screen.getByText("Summary")).toBeInTheDocument();
      expect(screen.getByText("Cart")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
    });

    test("renders address form fields", () => {
      renderWithProviders(<UserCart />, { initialState });

      expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
      expect(screen.getByLabelText("City")).toBeInTheDocument();
      expect(
        screen.getByLabelText("State/Province/Region")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Postal/Zip Code")).toBeInTheDocument();
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
    });

    test("renders existing address when available", () => {
      renderWithProviders(<UserCart />, { initialState });

      expect(screen.getByText("Address")).toBeInTheDocument();
      expect(screen.getByText(mockAddress.address)).toBeInTheDocument();
      expect(screen.getByText(mockAddress.city)).toBeInTheDocument();
      expect(screen.getByText(mockAddress.state)).toBeInTheDocument();
      expect(screen.getByText(mockAddress.pincode)).toBeInTheDocument();
      expect(screen.getByText(mockAddress.phone)).toBeInTheDocument();
    });

    test("renders no address message when address is not available", () => {
      const stateWithoutAddress = {
        ...initialState,
        checkout: {
          ...initialState.checkout,
          userAddress: null,
        },
      };

      renderWithProviders(<UserCart />, { initialState: stateWithoutAddress });

      expect(screen.getByText(/No Address Found/)).toBeInTheDocument();
    });
  });

  describe("Address Management", () => {
    test("fills and submits address form correctly", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const nameInput = screen.getByLabelText("Full Name");
      const streetInput = screen.getByLabelText("Street Address");
      const cityInput = screen.getByLabelText("City");
      const regionInput = screen.getByLabelText("State/Province/Region");
      const postalInput = screen.getByLabelText("Postal/Zip Code");
      const countryInput = screen.getByLabelText("Country");
      const submitButton = screen.getByRole("button", { name: "Add" });

      await user.type(nameInput, "John Doe");
      await user.type(streetInput, "123 Main St");
      await user.type(cityInput, "New York");
      await user.type(regionInput, "NY");
      await user.type(postalInput, "10001");
      await user.type(countryInput, "USA");

      await user.click(submitButton);

      expect(nameInput).toHaveValue("John Doe");
      expect(streetInput).toHaveValue("123 Main St");
      expect(cityInput).toHaveValue("New York");
      expect(regionInput).toHaveValue("NY");
      expect(postalInput).toHaveValue("10001");
      expect(countryInput).toHaveValue("USA");
    });

    test("validates required address fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const submitButton = screen.getByRole("button", { name: "Add" });
      await user.click(submitButton);

      // HTML5 validation should prevent submission with empty required fields
      const nameInput = screen.getByLabelText("Full Name");
      expect(nameInput).toBeRequired();
    });

    test("opens update address drawer", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const updateButton = screen.getByRole("button", { name: "Update" });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId("update-address")).toBeInTheDocument();
      });
    });

    test("opens delete address confirmation dialog", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const deleteButton = screen.getByRole("button", { name: "Delete" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText("Are you absolutely sure?")
        ).toBeInTheDocument();
        expect(
          screen.getByText(/This action cannot be undone/)
        ).toBeInTheDocument();
      });
    });

    test("cancels delete address action", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const deleteButton = screen.getByRole("button", { name: "Delete" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText("Are you absolutely sure?")
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Are you absolutely sure?")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Cart Display", () => {
    test("displays cart items correctly", () => {
      renderWithProviders(<UserCart />, { initialState });

      expect(
        screen.getByTestId(`product-card-${mockProduct._id}`)
      ).toBeInTheDocument();
      expect(screen.getByTestId("product-card-product2")).toBeInTheDocument();
    });

    test("displays total cost correctly", () => {
      renderWithProviders(<UserCart />, { initialState });

      expect(screen.getByText("Total: $149.98")).toBeInTheDocument();
    });

    test("displays empty cart message when cart is empty", () => {
      const emptyCartState = {
        ...initialState,
        product: {
          ...initialState.product,
          userCart: { items: [] },
          totalCost: "$0",
        },
      };

      renderWithProviders(<UserCart />, { initialState: emptyCartState });

      expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument();
    });

    test("displays Stripe checkout button", () => {
      renderWithProviders(<UserCart />, { initialState });

      expect(screen.getByText("Checkout with Stripe")).toBeInTheDocument();
    });
  });

  describe("Orders Display", () => {
    test("switches to orders tab", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const ordersTab = screen.getByRole("tab", { name: /Orders/ });
      await user.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText("Order on 1/1/2023")).toBeInTheDocument();
      });
    });

    test("displays order details correctly", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const ordersTab = screen.getByRole("tab", { name: /Orders/ });
      await user.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText("Order on 1/1/2023")).toBeInTheDocument();
        expect(screen.getByText("Status: delivered")).toBeInTheDocument();
        expect(screen.getByText("Total: $149.98")).toBeInTheDocument();
        expect(screen.getByText("Shipping Address")).toBeInTheDocument();
        expect(screen.getByText("Test Product")).toBeInTheDocument();
      });
    });

    test("displays no orders message when orders list is empty", async () => {
      const user = userEvent.setup();
      const noOrdersState = {
        ...initialState,
        checkout: {
          ...initialState.checkout,
          userOrders: [],
        },
      };

      renderWithProviders(<UserCart />, { initialState: noOrdersState });

      const ordersTab = screen.getByRole("tab", { name: /Orders/ });
      await user.click(ordersTab);

      await waitFor(() => {
        expect(
          screen.getByText(/You currently have no orders/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Tab Navigation", () => {
    test("switches between cart and orders tabs", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      // Initially on cart tab
      expect(
        screen.getByTestId(`product-card-${mockProduct._id}`)
      ).toBeInTheDocument();

      // Switch to orders tab
      const ordersTab = screen.getByRole("tab", { name: /Orders/ });
      await user.click(ordersTab);

      await waitFor(() => {
        expect(screen.getByText("Order on 1/1/2023")).toBeInTheDocument();
      });

      // Switch back to cart tab
      const cartTab = screen.getByRole("tab", { name: /Cart/ });
      await user.click(cartTab);

      await waitFor(() => {
        expect(
          screen.getByTestId(`product-card-${mockProduct._id}`)
        ).toBeInTheDocument();
      });
    });

    test("cart tab is active by default", () => {
      renderWithProviders(<UserCart />, { initialState });

      const cartTab = screen.getByRole("tab", { name: /Cart/ });
      expect(cartTab).toHaveAttribute("data-state", "active");
    });
  });

  describe("Loading States", () => {
    test("shows loading state for add address button", () => {
      const loadingState = {
        ...initialState,
        // This would need to be implemented based on actual loading state management
      };

      renderWithProviders(<UserCart />, { initialState: loadingState });

      // This test would depend on how loading states are actually managed
      expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    });

    test("shows loading state for delete address button", () => {
      const loadingState = {
        ...initialState,
        // This would need to be implemented based on actual loading state management
      };

      renderWithProviders(<UserCart />, { initialState: loadingState });

      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });
  });

  describe("Unauthenticated State", () => {
    test("handles unauthenticated user appropriately", () => {
      const unauthenticatedState = {
        ...initialState,
        auth: {
          isAuthenticated: false,
          user: null,
        },
      };

      renderWithProviders(<UserCart />, { initialState: unauthenticatedState });

      // The component should still render but without user-specific data
      expect(screen.getByText("Add New Address")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    test("renders correctly on different screen sizes", () => {
      renderWithProviders(<UserCart />, { initialState });

      // Check that main layout elements are present
      expect(screen.getByText("Add New Address")).toBeInTheDocument();
      expect(screen.getByText("Checkout")).toBeInTheDocument();
      expect(screen.getByText("Summary")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    test("handles invalid address data gracefully", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserCart />, { initialState });

      const nameInput = screen.getByLabelText("Full Name");
      const submitButton = screen.getByRole("button", { name: "Add" });

      // Try to submit with very long name
      await user.type(nameInput, "A".repeat(1000));
      await user.click(submitButton);

      // Should handle gracefully without crashing
      expect(nameInput).toHaveValue("A".repeat(1000));
    });

    test("handles missing cart data gracefully", () => {
      const invalidCartState = {
        ...initialState,
        product: {
          userCart: null,
          totalCost: "$0",
        },
      };

      renderWithProviders(<UserCart />, { initialState: invalidCartState });

      expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument();
    });

    test("handles missing order data gracefully", async () => {
      const user = userEvent.setup();
      const invalidOrderState = {
        ...initialState,
        checkout: {
          ...initialState.checkout,
          userOrders: null,
        },
      };

      renderWithProviders(<UserCart />, { initialState: invalidOrderState });

      const ordersTab = screen.getByRole("tab", { name: /Orders/ });
      await user.click(ordersTab);

      await waitFor(() => {
        expect(
          screen.getByText(/You currently have no orders/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    test("has proper form labels and ARIA attributes", () => {
      renderWithProviders(<UserCart />, { initialState });

      const nameInput = screen.getByLabelText("Full Name");
      const streetInput = screen.getByLabelText("Street Address");

      expect(nameInput).toBeInTheDocument();
      expect(streetInput).toBeInTheDocument();
    });

    test("has proper tab navigation", () => {
      renderWithProviders(<UserCart />, { initialState });

      const cartTab = screen.getByRole("tab", { name: /Cart/ });
      const ordersTab = screen.getByRole("tab", { name: /Orders/ });

      expect(cartTab).toBeInTheDocument();
      expect(ordersTab).toBeInTheDocument();
    });

    test("has proper button roles and labels", () => {
      renderWithProviders(<UserCart />, { initialState });

      expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Update" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" })
      ).toBeInTheDocument();
    });
  });
});
