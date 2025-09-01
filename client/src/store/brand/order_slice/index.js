// store/brand/orders_slice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  brandOrders: [],
  error: null,
};

// ✅ Thunk to fetch orders for the logged-in brand
export const fetchBrandOrders = createAsyncThunk(
  "brand/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("token"); // get JWT
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/brand/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.orders; // array of orders filtered for this brand
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Error fetching brand orders"
      );
    }
  }
);

const brandOrdersSlice = createSlice({
  name: "brandOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrandOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandOrders = action.payload;
      })

      .addCase(fetchBrandOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.brandOrders = [];
      });
  },
});

export default brandOrdersSlice.reducer;
