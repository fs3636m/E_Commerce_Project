import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  brandOrders: [],
  error: null,
};

export const fetchBrandOrders = createAsyncThunk(
  "brand/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/brand/orders`,
        { withCredentials: true }
      );
      return res.data.orders;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Error fetching orders");
    }
  }
);

const brandOrderSlice = createSlice({
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

export default brandOrderSlice.reducer;
