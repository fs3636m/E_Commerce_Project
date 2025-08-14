// src/store/shop/cart-slice.js
import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],      // always an array
  isLoading: false,
  error: null,
};

// --- Thunks ---
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shop/cart/add`,
        { userId, productId, quantity }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? "Request failed");
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/cart/get/${userId}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? "Request failed");
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/shop/cart/${userId}/${productId}`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? "Request failed");
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/shop/cart/update-cart`,
        { userId, productId, quantity }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? "Request failed");
    }
  }
);

// --- Normalize responses to items array ---
function toItems(payload) {
  if (!payload) return [];
  const d = payload.data ?? payload;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearCart(state) {
      state.cartItems = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // add
      .addCase(addToCart.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(addToCart.fulfilled, (s, a) => {
        s.isLoading = false;
        s.cartItems = toItems(a.payload);
      })
      .addCase(addToCart.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload ?? "Add to cart failed";
      })

      // fetch
      .addCase(fetchCartItems.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchCartItems.fulfilled, (s, a) => {
        s.isLoading = false;
        s.cartItems = toItems(a.payload);
      })
      .addCase(fetchCartItems.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload ?? "Fetch cart failed";
      })

      // update qty
      .addCase(updateCartQuantity.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(updateCartQuantity.fulfilled, (s, a) => {
        s.isLoading = false;
        s.cartItems = toItems(a.payload);
      })
      .addCase(updateCartQuantity.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload ?? "Update quantity failed";
      })

      // delete
      .addCase(deleteCartItem.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(deleteCartItem.fulfilled, (s, a) => {
        s.isLoading = false;
        s.cartItems = toItems(a.payload);
      })
      .addCase(deleteCartItem.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.payload ?? "Delete cart item failed";
      });
  },
});

export const { clearCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
