// brandSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  brand: null,
  isLoading: false,
  error: null,
  redirectToCreate: false,
};

// 🔥 Thunk to fetch brand by ID
export const fetchBrandById = createAsyncThunk(
  "brand/fetchById",
  async (brandId, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/brands/${brandId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    resetBrandState: (state) => {
      state.brand = null;
      state.error = null;
      state.redirectToCreate = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.redirectToCreate = false;
      })
      .addCase(fetchBrandById.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.brand = action.payload.brand;
          state.redirectToCreate = false;
        }
      })
      .addCase(fetchBrandById.rejected, (state, action) => {
        state.isLoading = false;
        state.brand = null;
        state.error = action.payload?.message || "Failed to fetch brand";
        state.redirectToCreate = action.payload?.redirectToCreate || false;
      });
  },
});

export const { resetBrandState } = brandSlice.actions;
export default brandSlice.reducer;
