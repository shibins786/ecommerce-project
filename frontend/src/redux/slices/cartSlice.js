import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// ================= FETCH CART
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("cart/");
      return res.data?.items || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch cart"
      );
    }
  }
);

// ================= ADD TO CART
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await API.post("cart/add/", {
        product: productId,
        quantity,
      });

      // ✅ backend MUST return full cart item
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Add to cart failed"
      );
    }
  }
);

// ================= REMOVE FROM CART
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`cart/remove/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Remove from cart failed"
      );
    }
  }
);

// ================= SLICE
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // ===== FETCH
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== ADD TO CART (FIXED)
      .addCase(addToCart.fulfilled, (state, action) => {
        const newItem = action.payload;

        // 🔴 SAFETY CHECK (prevents crash if backend changes)
        if (!newItem || !newItem.product) return;

        const existing = state.items.find(
          (item) => item.product?.id === newItem.product.id
        );

        if (existing) {
          // ✅ overwrite (NOT add)
          existing.quantity = newItem.quantity;
        } else {
          state.items.push(newItem);
        }
      })

      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ===== REMOVE
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const id = action.payload;

        state.items = state.items.filter(
          (item) =>
            item.id !== id && item.product?.id !== id
        );
      })

      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;