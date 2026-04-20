import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// ================= FETCH WISHLIST
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("wishlist/");
      return res.data?.items || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Wishlist fetch failed"
      );
    }
  }
);

// ================= TOGGLE WISHLIST (NO FAKE DATA)
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await API.post("wishlist/toggle/", {
        product: productId,
      });

      // ✅ Always sync with backend (no guessing)
      dispatch(fetchWishlist());

      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Wishlist toggle failed"
      );
    }
  }
);

// ================= REMOVE FROM WISHLIST
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await API.delete(`wishlist/remove/${id}/`);

      // ✅ Sync again
      dispatch(fetchWishlist());

      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Wishlist remove failed"
      );
    }
  }
);

// ================= SLICE
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // ================= FETCH
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load wishlist";
      })

      // ================= TOGGLE
      .addCase(toggleWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.error = action.payload || "Toggle failed";
      })

      // ================= REMOVE
      .addCase(removeFromWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload || "Remove failed";
      });
  },
});

export default wishlistSlice.reducer;