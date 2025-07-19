
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


// 🔁 Thunks
export const getFeaturedBrands = createAsyncThunk(
  "commonFeature/getFeaturedBrands",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/api/brands/featured");
      return res.data.brands;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getFeaturedProducts = createAsyncThunk(
  "commonFeature/getFeaturedProducts",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("/api/shop/products/featured");
      return res.data.products;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🔧 Slice
const initialState = {
  featuredBrands: [],
  featuredProducts: [],
  isLoading: false,
  error: null,
};

const commonFeatureSlice = createSlice({
  name: "commonFeature",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeaturedBrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeaturedBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredBrands = action.payload;
      })
      .addCase(getFeaturedBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getFeaturedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default commonFeatureSlice.reducer;
