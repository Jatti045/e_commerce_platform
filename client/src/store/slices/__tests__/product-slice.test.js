import { configureStore } from "@reduxjs/toolkit";
import productSlice, {
  addNewProduct,
  fetchAllProducts,
  deleteExistingProduct,
  editExistingProduct,
  addProductToUserCart,
  removeProductFromUserCart,
  fetchUserCart,
  increaseProductQuantity,
  decreaseProductQuantity,
  fetchProductsFromQuery,
} from "../product-slice";
import axios from "axios";
import {
  mockUser,
  mockProduct,
  mockAxiosResponse,
} from "../../../utils/testUtils";

// Mock axios
jest.mock("axios");
const mockedAxios = axios;

describe("Product Slice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        product: productSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    test("should have correct initial state", () => {
      const state = store.getState().product;
      expect(state).toEqual({
        products: [],
        orders: [],
        filteredProductsByQuery: [],
        userCart: [],
        userCartCount: 0,
        totalCost: 0,
        isProductSliceLoadingState: false,
        isProductsPageLoading: true,
      });
    });
  });

  describe("fetchAllProducts async thunk", () => {
    test("should handle successful products fetch", async () => {
      const mockProducts = [mockProduct, { ...mockProduct, _id: "product2" }];
      const mockResponse = mockAxiosResponse({
        success: true,
        data: mockProducts,
      });

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(fetchAllProducts());

      expect(action.type).toBe("/products/fetchAll/fulfilled");
      expect(action.payload).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:5000/api/product/all"
      );

      const state = store.getState().product;
      expect(state.products).toEqual(mockProducts);
      expect(state.isProductSliceLoadingState).toBe(false);
    });

    test("should handle failed products fetch", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      const action = await store.dispatch(fetchAllProducts());

      expect(action.type).toBe("/products/fetchAll/rejected");

      const state = store.getState().product;
      expect(state.products).toEqual([]);
      expect(state.isProductSliceLoadingState).toBe(false);
    });

    test("should set loading state during fetch", () => {
      const pendingAction = { type: "/products/fetchAll/pending" };
      const state = productSlice(undefined, pendingAction);

      expect(state.isProductSliceLoadingState).toBe(true);
    });
  });

  describe("addNewProduct async thunk", () => {
    test("should handle successful product creation", async () => {
      const newProductData = {
        productName: "New Product",
        productPrice: 199.99,
        productDescription: "A new test product",
      };

      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Product added successfully",
        data: { ...newProductData, _id: "newproduct123" },
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(addNewProduct(newProductData));

      expect(action.type).toBe("/product/addNewProduct/fulfilled");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5000/api/product/add",
        newProductData
      );

      const state = store.getState().product;
      expect(state.isProductSliceLoadingState).toBe(false);
    });

    test("should handle failed product creation", async () => {
      const newProductData = { productName: "Invalid Product" };
      mockedAxios.post.mockRejectedValueOnce(new Error("Validation Error"));

      const action = await store.dispatch(addNewProduct(newProductData));

      expect(action.type).toBe("/product/addNewProduct/rejected");

      const state = store.getState().product;
      expect(state.isProductSliceLoadingState).toBe(false);
    });
  });

  describe("deleteExistingProduct async thunk", () => {
    test("should handle successful product deletion", async () => {
      const productId = "product123";
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Product deleted successfully",
      });

      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(deleteExistingProduct(productId));

      expect(action.type).toBe("product/delete/fulfilled");
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `http://localhost:5000/api/product/delete/${productId}`
      );
    });

    test("should handle failed product deletion", async () => {
      const productId = "nonexistent";
      mockedAxios.delete.mockRejectedValueOnce(new Error("Product not found"));

      const action = await store.dispatch(deleteExistingProduct(productId));

      expect(action.type).toBe("product/delete/rejected");
    });
  });

  describe("editExistingProduct async thunk", () => {
    test("should handle successful product update", async () => {
      const productId = "product123";
      const updatedData = {
        productName: "Updated Product",
        productPrice: 299.99,
      };

      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Product updated successfully",
        data: { _id: productId, ...updatedData },
      });

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(
        editExistingProduct({ productId, updatedProductData: updatedData })
      );

      expect(action.type).toBe("/product/edit/fulfilled");
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `http://localhost:5000/api/product/update/${productId}`,
        updatedData
      );
    });

    test("should handle failed product update", async () => {
      const productId = "product123";
      const updatedData = { productName: "" }; // Invalid data

      mockedAxios.put.mockRejectedValueOnce(new Error("Validation Error"));

      const action = await store.dispatch(
        editExistingProduct({ productId, updatedProductData: updatedData })
      );

      expect(action.type).toBe("/product/edit/rejected");
    });
  });

  describe("Cart Management", () => {
    describe("addProductToUserCart async thunk", () => {
      test("should handle successful add to cart", async () => {
        const cartData = {
          productId: mockProduct._id,
          userId: mockUser.userId,
          size: "M",
        };

        const mockResponse = mockAxiosResponse({
          success: true,
          message: "Product added to cart",
        });

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const action = await store.dispatch(addProductToUserCart(cartData));

        expect(action.type).toBe("product/addToUserCart/fulfilled");
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/product/add-to-user-cart",
          cartData
        );
      });

      test("should handle failed add to cart", async () => {
        const cartData = {
          productId: "invalid",
          userId: mockUser.userId,
          size: "M",
        };

        mockedAxios.post.mockRejectedValueOnce(new Error("Product not found"));

        const action = await store.dispatch(addProductToUserCart(cartData));

        expect(action.type).toBe("product/addToUserCart/rejected");
      });
    });

    describe("removeProductFromUserCart async thunk", () => {
      test("should handle successful remove from cart", async () => {
        const removeData = {
          productId: mockProduct._id,
          userId: mockUser.userId,
          size: "M",
        };

        const mockResponse = mockAxiosResponse({
          success: true,
          message: "Product removed from cart",
        });

        mockedAxios.delete.mockResolvedValueOnce(mockResponse);

        const action = await store.dispatch(
          removeProductFromUserCart(removeData)
        );

        expect(action.type).toBe(
          "/product/removeProductFromUserCart/fulfilled"
        );
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          `http://localhost:5000/api/product/delete-from-user-cart/${mockProduct._id}`,
          {
            data: { userId: mockUser.userId, size: "M" },
          }
        );
      });

      test("should handle failed remove from cart", async () => {
        const removeData = {
          productId: "invalid",
          userId: mockUser.userId,
          size: "M",
        };

        mockedAxios.delete.mockRejectedValueOnce(
          new Error("Item not found in cart")
        );

        const action = await store.dispatch(
          removeProductFromUserCart(removeData)
        );

        expect(action.type).toBe("/product/removeProductFromUserCart/rejected");
      });
    });

    describe("fetchUserCart async thunk", () => {
      test("should handle successful cart fetch", async () => {
        const mockCartData = {
          items: [
            {
              _id: "cartitem1",
              product: mockProduct,
              quantity: 2,
              size: "M",
            },
          ],
          totalCost: 199.98,
        };

        const mockResponse = mockAxiosResponse({
          success: true,
          data: mockCartData,
        });

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const action = await store.dispatch(
          fetchUserCart({ id: mockUser.userId })
        );

        expect(action.type).toBe("product/fetchUserCart/fulfilled");
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/product/get-user-cart",
          { id: mockUser.userId }
        );
      });

      test("should handle failed cart fetch", async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error("User not found"));

        const action = await store.dispatch(fetchUserCart({ id: "invalid" }));

        expect(action.type).toBe("product/fetchUserCart/rejected");
      });
    });

    describe("quantity management", () => {
      test("should handle successful quantity increase", async () => {
        const quantityData = {
          userId: mockUser.userId,
          productId: mockProduct._id,
        };

        const mockResponse = mockAxiosResponse({
          success: true,
          message: "Quantity increased",
        });

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const action = await store.dispatch(
          increaseProductQuantity(quantityData)
        );

        expect(action.type).toBe(
          "/product/increase-product-quantity/fulfilled"
        );
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/product/increase-product-quantity",
          quantityData
        );
      });

      test("should handle successful quantity decrease", async () => {
        const quantityData = {
          userId: mockUser.userId,
          productId: mockProduct._id,
        };

        const mockResponse = mockAxiosResponse({
          success: true,
          message: "Quantity decreased",
        });

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const action = await store.dispatch(
          decreaseProductQuantity(quantityData)
        );

        expect(action.type).toBe(
          "/checkout/decrease-product-quantity/fulfilled"
        );
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/product/decrease-product-quantity",
          quantityData
        );
      });

      test("should handle failed quantity operations", async () => {
        const quantityData = {
          userId: "invalid",
          productId: mockProduct._id,
        };

        mockedAxios.post.mockRejectedValueOnce(new Error("User not found"));

        const increaseAction = await store.dispatch(
          increaseProductQuantity(quantityData)
        );
        expect(increaseAction.type).toBe(
          "/product/increase-product-quantity/rejected"
        );

        const decreaseAction = await store.dispatch(
          decreaseProductQuantity(quantityData)
        );
        expect(decreaseAction.type).toBe(
          "/checkout/decrease-product-quantity/rejected"
        );
      });
    });
  });

  describe("Product Filtering", () => {
    describe("fetchProductsFromQuery async thunk", () => {
      test("should handle successful filtered products fetch", async () => {
        const queryParams = {
          category: "men",
          type: "shirt",
          sort: "price-low-to-high",
        };

        const mockFilteredProducts = [
          { ...mockProduct, category: "men", clothingType: "shirt" },
        ];

        const mockResponse = mockAxiosResponse({
          success: true,
          data: mockFilteredProducts,
        });

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const action = await store.dispatch(
          fetchProductsFromQuery(queryParams)
        );

        expect(action.type).toBe("/products/getProductsFromQuery/fulfilled");
        expect(mockedAxios.get).toHaveBeenCalledWith(
          "http://localhost:5000/api/product/get-products-by-category",
          { params: queryParams }
        );
      });

      test("should handle failed filtered products fetch", async () => {
        const queryParams = { category: "invalid" };

        mockedAxios.get.mockRejectedValueOnce(new Error("Invalid category"));

        const action = await store.dispatch(
          fetchProductsFromQuery(queryParams)
        );

        expect(action.type).toBe("/products/getProductsFromQuery/rejected");
      });
    });
  });

  describe("Reducers", () => {
    test("should handle setIsProductSliceLoadingState action", () => {
      const action = {
        type: "product-slice/setIsProductSliceLoadingState",
        payload: true,
      };

      const state = productSlice(undefined, action);

      expect(state.isProductSliceLoadingState).toBe(true);
    });

    test("should handle addProduct action", () => {
      const newProduct = { ...mockProduct, _id: "newproduct" };
      const action = {
        type: "product-slice/addProduct",
        payload: newProduct,
      };

      const state = productSlice(undefined, action);

      expect(state.products).toHaveLength(1);
      expect(state.products[0]).toEqual(newProduct);
    });

    test("should reset cart on logout", () => {
      const initialStateWithCart = {
        ...productSlice.getInitialState(),
        userCart: [{ _id: "item1", product: mockProduct }],
        userCartCount: 1,
        totalCost: 99.99,
      };

      const logoutAction = { type: "auth/logout/fulfilled" };
      const state = productSlice(initialStateWithCart, logoutAction);

      expect(state.userCart).toEqual([]);
      expect(state.userCartCount).toBe(0);
      expect(state.totalCost).toBe(0);
    });
  });

  describe("Loading States", () => {
    test("should set loading to true on pending actions", () => {
      const pendingActions = [
        { type: "/products/fetchAll/pending" },
        { type: "/product/addNewProduct/pending" },
        { type: "product/delete/pending" },
      ];

      pendingActions.forEach((action) => {
        const state = productSlice(undefined, action);
        expect(state.isProductSliceLoadingState).toBe(true);
      });
    });

    test("should set loading to false on fulfilled/rejected actions", () => {
      const actions = [
        { type: "/products/fetchAll/fulfilled", payload: { data: [] } },
        { type: "/products/fetchAll/rejected" },
        { type: "/product/addNewProduct/fulfilled" },
        { type: "/product/addNewProduct/rejected" },
        { type: "product/delete/fulfilled" },
        { type: "product/delete/rejected" },
      ];

      actions.forEach((action) => {
        const state = productSlice(undefined, action);
        expect(state.isProductSliceLoadingState).toBe(false);
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle malformed response data", async () => {
      const mockResponse = mockAxiosResponse({
        success: true,
        data: null, // Malformed data
      });

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(fetchAllProducts());

      expect(action.type).toBe("/products/fetchAll/fulfilled");

      const state = store.getState().product;
      expect(state.products).toBe(null);
    });

    test("should handle empty cart operations", async () => {
      const removeData = {
        productId: "nonexistent",
        userId: mockUser.userId,
        size: "M",
      };

      const mockResponse = mockAxiosResponse({
        success: false,
        message: "Item not found in cart",
      });

      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const action = await store.dispatch(
        removeProductFromUserCart(removeData)
      );

      expect(action.type).toBe("/product/removeProductFromUserCart/fulfilled");
    });

    test("should handle concurrent cart operations", async () => {
      const cartData = {
        productId: mockProduct._id,
        userId: mockUser.userId,
        size: "M",
      };

      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Operation successful",
      });

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Simulate concurrent operations
      const addPromise = store.dispatch(addProductToUserCart(cartData));
      const increasePromise = store.dispatch(
        increaseProductQuantity({
          userId: mockUser.userId,
          productId: mockProduct._id,
        })
      );

      const results = await Promise.all([addPromise, increasePromise]);

      expect(results[0].type).toBe("product/addToUserCart/fulfilled");
      expect(results[1].type).toBe(
        "/product/increase-product-quantity/fulfilled"
      );
    });
  });
});
