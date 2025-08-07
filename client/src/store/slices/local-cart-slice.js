import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  try {
    return JSON.parse(sessionStorage.getItem("localCart")) || {};
  } catch {
    return {};
  }
};

const saveCart = (cart) => {
  sessionStorage.setItem("localCart", JSON.stringify(cart));
};

const localCartSlice = createSlice({
  name: "localCart",
  initialState: loadCart(),
  reducers: {
    addItem: (state, { payload: { product, size } }) => {
      const key = `${product._id}__${size}`;
      if (!state[key]) {
        state[key] = { product, size, quantity: 1 };
      } else {
        state[key].quantity += 1;
      }
      saveCart(state);
    },
    removeItem: (state, { payload: { productId, size } }) => {
      const key = `${productId}__${size}`;
      delete state[key];
      saveCart(state);
    },
    increaseQty: (state, { payload: { productId, size } }) => {
      const key = `${productId}__${size}`;
      state[key].quantity += 1;
      saveCart(state);
    },
    decreaseQty: (state, { payload: { productId, size } }) => {
      const key = `${productId}__${size}`;
      if (--state[key].quantity <= 0) {
        delete state[key];
      }
      saveCart(state);
    },
    clearCart: (state) => {
      Object.keys(state).forEach((k) => delete state[k]);
      saveCart(state);
    },
  },
});

export const { addItem, removeItem, increaseQty, decreaseQty, clearCart } =
  localCartSlice.actions;
export default localCartSlice.reducer;
