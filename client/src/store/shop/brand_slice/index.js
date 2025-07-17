import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Thunk to fetch all public brands
export const fetchAllBrands = createAsyncThunk(
  "brand/fetchAllBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/brands");
      return response.data.brands;
    } catch (error) {
      console.error("❌ Failed to fetch brands:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands"
      );
    }
  }
);

// ✅ Slice
const brandSlice = createSlice({
  name: "brand",
  initialState: {
    brandList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearBrandState: (state) => {
      state.brandList = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.brandList = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong while fetching brands";
      });
  },
});

export const { clearBrandState } = brandSlice.actions;

export default brandSlice.reducer;
