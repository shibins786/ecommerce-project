import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// ================= FETCH CART (ONLY ON LOAD)
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

      // assume backend returns updated cart item
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
      return id; // return removed id
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Remove from cart failed"
      );
    }
  }
);

// ================= CART SLICE
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

      // ================= FETCH
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= ADD (INSTANT UI UPDATE)
      .addCase(addToCart.fulfilled, (state, action) => {
        const newItem = action.payload;

        const existing = state.items.find(
          (item) => item.product.id === newItem.product.id
        );

        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          state.items.push(newItem);
        }
      })

      // ================= REMOVE (INSTANT UI UPDATE)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const id = action.payload;

        state.items = state.items.filter(
          (item) =>
             item.id !== id && item.product?.id !== id
        );
      });
  },
});

export default cartSlice.reducer;