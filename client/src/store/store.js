import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import productReducer from "./slices/product-slice";
import checkoutReducer from "./slices/checkout-slice";
import adminReducer from "./slices/admin-slice";
import localCartReducer from "./slices/local-cart-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    checkout: checkoutReducer,
    admin: adminReducer,
  },
});

export default store;
