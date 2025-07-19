import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
  featuredBrands: [],
  featuredProducts: [],
};

export const getFeatureImages = createAsyncThunk(
  "feature/getFeatureImages",
  async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/common/feature/get`
    );
    return response.data;
  }
);


export const getFeaturedBrands = createAsyncThunk(
  "commonFeature/getFeaturedBrands",
  async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shop/brands/featured`);
    return res.data.brands;
  }
);

export const getFeaturedProducts = createAsyncThunk(
  "commonFeature/getFeaturedProducts",
  async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shop/products/featured`);
    return res.data.data;
  }
);


export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async (image) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/common/feature/add`,
      { image }
    );

    return response.data;
  }
);

export const deleteFeatureImage = createAsyncThunk(
  "feature/deleteFeatureImage",
  async (id) => {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/common/feature/delete/${id}`
    );
    return response.data;
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })
      .addCase(deleteFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = state.featureImageList.filter(
          (item) => item._id !== action.meta.arg
        );
      })
      .addCase(deleteFeatureImage.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default commonSlice.reducer;
