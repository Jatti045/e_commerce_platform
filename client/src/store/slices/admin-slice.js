import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  totalSales: 0,
  totalOrders: 0,
  totalUsers: 0,
  totalProducts: 0,
  revenueByMonth: [],
  ordersByMonth: [],
  topProducts: [],
  orderStatusDistribution: [],
  recentActivity: [],
  categoryPerformance: [],
  isAdminStateLoading: true,
};

export const fetchAdminDashboardData = createAsyncThunk(
  "dashboard/dashboardData",
  async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/admin/get-admin-dashboard-data`
    );
    return response.data;
  }
);

const adminSlice = createSlice({
  name: "admin-slice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAdminDashboardData.pending, (state) => {
      state.isAdminStateLoading = true;
    });
    builder.addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.totalUsers = action.payload.data.totalUsers;
        state.totalProducts = action.payload.data.totalProducts;
        state.totalOrders = action.payload.data.totalOrders;
        state.totalSales = action.payload.data.totalSales;
        state.revenueByMonth = action.payload.data.revenueByMonth || [];
        state.ordersByMonth = action.payload.data.ordersByMonth || [];
        state.topProducts = action.payload.data.topProducts || [];
        state.orderStatusDistribution =
          action.payload.data.orderStatusDistribution || [];
        state.recentActivity = action.payload.data.recentActivity || [];
        state.categoryPerformance =
          action.payload.data.categoryPerformance || [];
      }
      state.isAdminStateLoading = false;
    });
    builder.addCase(fetchAdminDashboardData.rejected, (state) => {
      state.isAdminStateLoading = false;
    });
  },
});

export default adminSlice.reducer;
