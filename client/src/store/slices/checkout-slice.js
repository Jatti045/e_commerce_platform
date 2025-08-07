import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  userAddress: null,
  userOrders: [],
  isCheckoutStateLoading: false,
};

export const addUserAddress = createAsyncThunk(
  "checkout/addUserAddress",
  async (addressFormData) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/checkout/add-user-address`,
      addressFormData
    );

    return response.data;
  }
);

export const fetchUserAddress = createAsyncThunk(
  "checkout/getUserAddress",
  async (userId) => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/checkout/get-user-address/${userId}`
    );

    return response.data;
  }
);

export const deleteUserAddress = createAsyncThunk(
  "checkout/deleteUserData",
  async (userId) => {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/checkout/delete-user-address`,
      {
        data: { userId },
      }
    );

    return response.data;
  }
);

export const updateUserAddress = createAsyncThunk(
  "/checkout/updateUserAddress",
  async (updatedAddressFormData) => {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/checkout/update-user-address`,
      updatedAddressFormData
    );

    return response.data;
  }
);

export const fetchUserOrders = createAsyncThunk(
  "/checkout/get-orders",
  async ({ id }) => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/checkout/get-orders/${id}`
    );

    return response.data;
  }
);

const checkoutSlice = createSlice({
  name: "checkout-slice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAddress.pending, (state, action) => {
        state.isCheckoutStateLoading = true;
      })
      .addCase(fetchUserAddress.fulfilled, (state, action) => {
        state.isCheckoutStateLoading = false;
        state.userAddress = action?.payload?.data;
      })
      .addCase(fetchUserAddress.rejected, (state, action) => {
        state.isCheckoutStateLoading = false;
        state.userAddress = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action?.payload?.orders;
      });
  },
});

export const {} = checkoutSlice.actions;
export default checkoutSlice.reducer;
