// src/store/homepageFeatureSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getHomepageBrands = createAsyncThunk(
  "homepage/getHomepageBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/brand/homepage`);
      return response.data.brands;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch brands");
    }
  }
);

export const getHomepageProducts = createAsyncThunk(
  "homepage/getHomepageProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/product/homepage`);
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

const homepageFeatureSlice = createSlice({
  name: "homepage",
  initialState: {
    isLoading: false,
    homepageBrands: [],
    homepageProducts: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHomepageBrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHomepageBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homepageBrands = action.payload;
      })
      .addCase(getHomepageBrands.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getHomepageProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHomepageProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.homepageProducts = action.payload;
      })
      .addCase(getHomepageProducts.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default homepageFeatureSlice.reducer;
