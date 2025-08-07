import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "./auth-slice";
import axios from "axios";

const initialState = {
  products: [],
  orders: [],
  filteredProductsByQuery: [],
  userCart: [],
  userCartCount: 0,
  totalCost: 0,
  isProductSliceLoadingState: false,
  isProductsPageLoading: true,
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Thunks for products
export const addNewProduct = createAsyncThunk(
  "/product/addNewProduct",
  async (newProductData) => {
    const response = await axios.post(
      `${API_BASE_URL}/product/add`,
      newProductData
    );
    return response.data;
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAll",
  async () => {
    const response = await axios.get(`${API_BASE_URL}/product/all`);
    return response.data;
  }
);

// Thunk to fetch all orders
export const fetchAllOrders = createAsyncThunk("/orders/fetchAll", async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/orders/all`);
  return response.data;
});

export const deleteExistingProduct = createAsyncThunk(
  "product/delete",
  async (productId) => {
    const response = await axios.delete(
      `${API_BASE_URL}/product/delete/${productId}`
    );
    return response.data;
  }
);

export const editExistingProduct = createAsyncThunk(
  "/product/edit",
  async ({ productId, updatedProductData }) => {
    const response = await axios.put(
      `${API_BASE_URL}/product/update/${productId}`,
      updatedProductData
    );
    return response.data;
  }
);

export const fetchSingleProduct = createAsyncThunk(
  "product/get/id",
  async (productId) => {
    const response = await axios.get(
      `${API_BASE_URL}/product/get/${productId}`
    );
    return response.data;
  }
);

export const addProductToUserCart = createAsyncThunk(
  "product/addToUserCart",
  async ({ productId, userId, size }) => {
    const response = await axios.post(
      `${API_BASE_URL}/product/add-to-user-cart`,
      {
        productId,
        userId,
        size,
      }
    );
    return response.data;
  }
);

export const removeProductFromUserCart = createAsyncThunk(
  "/product/removeProductFromUserCart",
  async ({ productId, userId, size }) => {
    const response = await axios.delete(
      `${API_BASE_URL}/product/delete-from-user-cart/${productId}`,
      {
        data: { userId, size },
      }
    );
    return response.data;
  }
);

export const fetchUserCart = createAsyncThunk(
  "product/fetchUserCart",
  async ({ id }) => {
    const response = await axios.post(`${API_BASE_URL}/product/get-user-cart`, {
      id,
    });
    return response.data;
  }
);

export const fetchProductsFromQuery = createAsyncThunk(
  "/products/getProductsFromQuery",
  async ({ category, type, sort }) => {
    const response = await axios.get(
      `${API_BASE_URL}/product/get-products-by-category`,
      {
        params: { category, type, sort },
      }
    );
    return response.data;
  }
);

export const increaseProductQuantity = createAsyncThunk(
  `/product/increase-product-quantity`,
  async ({ userId, productId }) => {
    const response = await axios.post(
      `${API_BASE_URL}/product/increase-product-quantity`,
      { userId, productId }
    );
    return response.data;
  }
);

export const decreaseProductQuantity = createAsyncThunk(
  `/checkout/decrease-product-quantity`,
  async ({ userId, productId }) => {
    const response = await axios.post(
      `${API_BASE_URL}/product/decrease-product-quantity`,
      { userId, productId }
    );

    return response.data;
  }
);

const productSlice = createSlice({
  name: "product-slice",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    setIsProductSliceLoadingState: (state, action) => {
      state.isProductSliceLoadingState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.userCart = [];
        state.userCartCount = 0;
        state.totalCost = 0;
      })
      // fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.products = action.payload.data;
        state.isProductSliceLoadingState = false;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // fetch all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload.data;
        state.isProductSliceLoadingState = false;
      })
      .addCase(fetchAllOrders.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // add new product
      .addCase(addNewProduct.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(addNewProduct.fulfilled, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(addNewProduct.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // delete product
      .addCase(deleteExistingProduct.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(deleteExistingProduct.fulfilled, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(deleteExistingProduct.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // edit product
      .addCase(editExistingProduct.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(editExistingProduct.fulfilled, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(editExistingProduct.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // fetch single product
      .addCase(fetchSingleProduct.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(fetchSingleProduct.fulfilled, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(fetchSingleProduct.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // cart operations
      .addCase(addProductToUserCart.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(addProductToUserCart.fulfilled, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(addProductToUserCart.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(removeProductFromUserCart.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(removeProductFromUserCart.fulfilled, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(removeProductFromUserCart.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(fetchUserCart.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.isProductSliceLoadingState = false;
        state.userCartCount = action.payload.totalItems;
        state.userCart = action.payload.data;
        state.totalCost = action.payload.totalCost;
      })
      .addCase(fetchUserCart.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // query products
      .addCase(fetchProductsFromQuery.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(fetchProductsFromQuery.fulfilled, (state, action) => {
        state.isProductSliceLoadingState = false;
        state.filteredProductsByQuery = action.payload.success
          ? action.payload.data
          : [];
      })
      .addCase(fetchProductsFromQuery.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      // adjust quantity
      .addCase(increaseProductQuantity.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(increaseProductQuantity.fulfilled, (state, action) => {
        state.isProductSliceLoadingState = false;
        state.userCartCount = action.payload.totalItems;
        state.userCart = action.payload.data;
        state.totalCost = action.payload.totalCost;
      })
      .addCase(increaseProductQuantity.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      })
      .addCase(decreaseProductQuantity.pending, (state) => {
        state.isProductSliceLoadingState = true;
      })
      .addCase(decreaseProductQuantity.fulfilled, (state, action) => {
        state.isProductSliceLoadingState = false;
        state.userCartCount = action.payload.totalItems;
        state.userCart = action.payload.data;
        state.totalCost = action.payload.totalCost;
      })
      .addCase(decreaseProductQuantity.rejected, (state) => {
        state.isProductSliceLoadingState = false;
      });
  },
});

export const { addProduct, setIsProductSliceLoadingState } =
  productSlice.actions;
export default productSlice.reducer;
