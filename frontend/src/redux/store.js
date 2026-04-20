import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
  },

  // optional but useful (helps catch bugs early)
  devTools: process.env.NODE_ENV !== "production",
});