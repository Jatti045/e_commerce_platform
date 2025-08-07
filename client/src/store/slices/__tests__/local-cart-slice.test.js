import { configureStore } from "@reduxjs/toolkit";
import localCartSlice, {
  addItem,
  removeItem,
  increaseQty,
  decreaseQty,
  clearCart,
} from "../local-cart-slice";
import { mockProduct, mockCartItem } from "../../../utils/testUtils";

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

describe("Local Cart Slice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        localCart: localCartSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    test("should load empty cart when sessionStorage is empty", () => {
      sessionStorageMock.getItem.mockReturnValueOnce(null);

      const newStore = configureStore({
        reducer: {
          localCart: localCartSlice,
        },
      });

      const state = newStore.getState().localCart;
      expect(state).toEqual({});
    });

    test("should load cart from sessionStorage", () => {
      const savedCart = {
        product1__M: { product: mockProduct, size: "M", quantity: 2 },
      };
      sessionStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedCart));

      const newStore = configureStore({
        reducer: {
          localCart: localCartSlice,
        },
      });

      const state = newStore.getState().localCart;
      expect(state).toEqual(savedCart);
    });

    test("should handle malformed sessionStorage data", () => {
      sessionStorageMock.getItem.mockReturnValueOnce("invalid json");

      const newStore = configureStore({
        reducer: {
          localCart: localCartSlice,
        },
      });

      const state = newStore.getState().localCart;
      expect(state).toEqual({});
    });
  });

  describe("addItem action", () => {
    test("should add new item to empty cart", () => {
      const product = mockProduct;
      const size = "M";

      store.dispatch(addItem({ product, size }));

      const state = store.getState().localCart;
      const key = `${product._id}__${size}`;

      expect(state[key]).toEqual({
        product,
        size,
        quantity: 1,
      });
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "localCart",
        JSON.stringify(state)
      );
    });

    test("should increment quantity if item already exists", () => {
      const product = mockProduct;
      const size = "M";
      const key = `${product._id}__${size}`;

      // Add item first time
      store.dispatch(addItem({ product, size }));
      // Add same item again
      store.dispatch(addItem({ product, size }));

      const state = store.getState().localCart;

      expect(state[key].quantity).toBe(2);
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(2);
    });

    test("should handle different sizes of same product separately", () => {
      const product = mockProduct;

      store.dispatch(addItem({ product, size: "M" }));
      store.dispatch(addItem({ product, size: "L" }));

      const state = store.getState().localCart;

      expect(state[`${product._id}__M`]).toBeDefined();
      expect(state[`${product._id}__L`]).toBeDefined();
      expect(state[`${product._id}__M`].quantity).toBe(1);
      expect(state[`${product._id}__L`].quantity).toBe(1);
    });

    test("should handle multiple different products", () => {
      const product1 = mockProduct;
      const product2 = { ...mockProduct, _id: "product2" };

      store.dispatch(addItem({ product: product1, size: "M" }));
      store.dispatch(addItem({ product: product2, size: "L" }));

      const state = store.getState().localCart;

      expect(Object.keys(state)).toHaveLength(2);
      expect(state[`${product1._id}__M`]).toBeDefined();
      expect(state[`${product2._id}__L`]).toBeDefined();
    });
  });

  describe("removeItem action", () => {
    test("should remove item from cart", () => {
      const product = mockProduct;
      const size = "M";

      // Add item first
      store.dispatch(addItem({ product, size }));

      // Remove item
      store.dispatch(removeItem({ productId: product._id, size }));

      const state = store.getState().localCart;
      const key = `${product._id}__${size}`;

      expect(state[key]).toBeUndefined();
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "localCart",
        JSON.stringify(state)
      );
    });

    test("should not affect other items when removing one", () => {
      const product = mockProduct;

      // Add multiple items
      store.dispatch(addItem({ product, size: "M" }));
      store.dispatch(addItem({ product, size: "L" }));

      // Remove only one
      store.dispatch(removeItem({ productId: product._id, size: "M" }));

      const state = store.getState().localCart;

      expect(state[`${product._id}__M`]).toBeUndefined();
      expect(state[`${product._id}__L`]).toBeDefined();
    });

    test("should handle removing non-existent item gracefully", () => {
      store.dispatch(removeItem({ productId: "nonexistent", size: "M" }));

      const state = store.getState().localCart;
      expect(state).toEqual({});
    });
  });

  describe("increaseQty action", () => {
    test("should increase quantity of existing item", () => {
      const product = mockProduct;
      const size = "M";

      // Add item first
      store.dispatch(addItem({ product, size }));

      // Increase quantity
      store.dispatch(increaseQty({ productId: product._id, size }));

      const state = store.getState().localCart;
      const key = `${product._id}__${size}`;

      expect(state[key].quantity).toBe(2);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "localCart",
        JSON.stringify(state)
      );
    });

    test("should handle multiple quantity increases", () => {
      const product = mockProduct;
      const size = "M";

      // Add item and increase multiple times
      store.dispatch(addItem({ product, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));

      const state = store.getState().localCart;
      const key = `${product._id}__${size}`;

      expect(state[key].quantity).toBe(4);
    });

    test("should handle increasing non-existent item gracefully", () => {
      const originalState = store.getState().localCart;

      store.dispatch(increaseQty({ productId: "nonexistent", size: "M" }));

      const state = store.getState().localCart;
      expect(state).toEqual(originalState);
    });
  });

  describe("decreaseQty action", () => {
    test("should decrease quantity of existing item", () => {
      const product = mockProduct;
      const size = "M";

      // Add item and increase quantity
      store.dispatch(addItem({ product, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));

      // Decrease quantity
      store.dispatch(decreaseQty({ productId: product._id, size }));

      const state = store.getState().localCart;
      const key = `${product._id}__${size}`;

      expect(state[key].quantity).toBe(1);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "localCart",
        JSON.stringify(state)
      );
    });

    test("should remove item when quantity reaches 0", () => {
      const product = mockProduct;
      const size = "M";

      // Add item (quantity = 1)
      store.dispatch(addItem({ product, size }));

      // Decrease quantity (should remove item)
      store.dispatch(decreaseQty({ productId: product._id, size }));

      const state = store.getState().localCart;
      const key = `${product._id}__${size}`;

      expect(state[key]).toBeUndefined();
    });

    test("should handle decreasing non-existent item gracefully", () => {
      const originalState = store.getState().localCart;

      store.dispatch(decreaseQty({ productId: "nonexistent", size: "M" }));

      const state = store.getState().localCart;
      expect(state).toEqual(originalState);
    });

    test("should handle multiple decreases correctly", () => {
      const product = mockProduct;
      const size = "M";

      // Add item and increase to quantity 5
      store.dispatch(addItem({ product, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));

      // Decrease twice
      store.dispatch(decreaseQty({ productId: product._id, size }));
      store.dispatch(decreaseQty({ productId: product._id, size }));

      const state = store.getState().localCart;
      const key = `${product._id}__${size}`;

      expect(state[key].quantity).toBe(3);
    });
  });

  describe("clearCart action", () => {
    test("should clear all items from cart", () => {
      const product1 = mockProduct;
      const product2 = { ...mockProduct, _id: "product2" };

      // Add multiple items
      store.dispatch(addItem({ product: product1, size: "M" }));
      store.dispatch(addItem({ product: product1, size: "L" }));
      store.dispatch(addItem({ product: product2, size: "S" }));

      // Clear cart
      store.dispatch(clearCart());

      const state = store.getState().localCart;

      expect(state).toEqual({});
      expect(Object.keys(state)).toHaveLength(0);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "localCart",
        JSON.stringify({})
      );
    });

    test("should handle clearing already empty cart", () => {
      store.dispatch(clearCart());

      const state = store.getState().localCart;
      expect(state).toEqual({});
    });
  });

  describe("SessionStorage Integration", () => {
    test("should save to sessionStorage after every action", () => {
      const product = mockProduct;
      const size = "M";

      store.dispatch(addItem({ product, size }));
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(1);

      store.dispatch(increaseQty({ productId: product._id, size }));
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(2);

      store.dispatch(decreaseQty({ productId: product._id, size }));
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(3);

      store.dispatch(removeItem({ productId: product._id, size }));
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(4);
    });

    test("should save correct data format to sessionStorage", () => {
      const product = mockProduct;
      const size = "M";

      store.dispatch(addItem({ product, size }));

      const expectedState = {
        [`${product._id}__${size}`]: {
          product,
          size,
          quantity: 1,
        },
      };

      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "localCart",
        JSON.stringify(expectedState)
      );
    });
  });

  describe("Complex Scenarios", () => {
    test("should handle adding same product with different sizes", () => {
      const product = mockProduct;

      store.dispatch(addItem({ product, size: "S" }));
      store.dispatch(addItem({ product, size: "M" }));
      store.dispatch(addItem({ product, size: "L" }));
      store.dispatch(addItem({ product, size: "XL" }));

      const state = store.getState().localCart;

      expect(Object.keys(state)).toHaveLength(4);
      expect(state[`${product._id}__S`].quantity).toBe(1);
      expect(state[`${product._id}__M`].quantity).toBe(1);
      expect(state[`${product._id}__L`].quantity).toBe(1);
      expect(state[`${product._id}__XL`].quantity).toBe(1);
    });

    test("should handle mixed operations on multiple items", () => {
      const product1 = mockProduct;
      const product2 = { ...mockProduct, _id: "product2" };

      // Add items
      store.dispatch(addItem({ product: product1, size: "M" }));
      store.dispatch(addItem({ product: product2, size: "L" }));

      // Increase quantities
      store.dispatch(increaseQty({ productId: product1._id, size: "M" }));
      store.dispatch(increaseQty({ productId: product1._id, size: "M" }));
      store.dispatch(increaseQty({ productId: product2._id, size: "L" }));

      // Decrease one
      store.dispatch(decreaseQty({ productId: product1._id, size: "M" }));

      const state = store.getState().localCart;

      expect(state[`${product1._id}__M`].quantity).toBe(2);
      expect(state[`${product2._id}__L`].quantity).toBe(2);
    });

    test("should handle full product lifecycle", () => {
      const product = mockProduct;
      const size = "M";

      // Add item
      store.dispatch(addItem({ product, size }));
      expect(
        store.getState().localCart[`${product._id}__${size}`].quantity
      ).toBe(1);

      // Increase quantity multiple times
      store.dispatch(increaseQty({ productId: product._id, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));
      store.dispatch(increaseQty({ productId: product._id, size }));
      expect(
        store.getState().localCart[`${product._id}__${size}`].quantity
      ).toBe(4);

      // Decrease quantity
      store.dispatch(decreaseQty({ productId: product._id, size }));
      expect(
        store.getState().localCart[`${product._id}__${size}`].quantity
      ).toBe(3);

      // Remove completely
      store.dispatch(removeItem({ productId: product._id, size }));
      expect(
        store.getState().localCart[`${product._id}__${size}`]
      ).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle products with special characters in ID", () => {
      const specialProduct = {
        ...mockProduct,
        _id: "product-123_test@special",
      };
      const size = "M";

      store.dispatch(addItem({ product: specialProduct, size }));

      const state = store.getState().localCart;
      const key = `${specialProduct._id}__${size}`;

      expect(state[key]).toBeDefined();
      expect(state[key].quantity).toBe(1);
    });

    test("should handle very long product IDs", () => {
      const longIdProduct = { ...mockProduct, _id: "a".repeat(1000) };
      const size = "M";

      store.dispatch(addItem({ product: longIdProduct, size }));

      const state = store.getState().localCart;
      const key = `${longIdProduct._id}__${size}`;

      expect(state[key]).toBeDefined();
      expect(state[key].quantity).toBe(1);
    });

    test("should handle unusual size values", () => {
      const product = mockProduct;
      const unusualSizes = ["XXS", "XXXL", "One Size", "32x34", "Custom"];

      unusualSizes.forEach((size) => {
        store.dispatch(addItem({ product, size }));
      });

      const state = store.getState().localCart;

      unusualSizes.forEach((size) => {
        const key = `${product._id}__${size}`;
        expect(state[key]).toBeDefined();
        expect(state[key].quantity).toBe(1);
      });
    });
  });
});
