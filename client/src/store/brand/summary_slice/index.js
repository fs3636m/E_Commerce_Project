import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchBrandSummary = createAsyncThunk(
  "brand/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/brand/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load brand summary");
    }
  }
);

const summarySlice = createSlice({
  name: "brandSummary",
  initialState: {
    summary: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBrandSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchBrandSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.summary = null;
        state.error = action.payload;
      });
  },
});

export default summarySlice.reducer;
