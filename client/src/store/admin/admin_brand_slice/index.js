import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get all brands
export const fetchAllBrands = createAsyncThunk(
  "admin/fetchAllBrands",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/brands`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch brands");
    }
  }
);

// Delete a brand
export const deleteBrandByAdmin = createAsyncThunk(
  "admin/deleteBrandByAdmin",
  async (brandId, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/brands/${brandId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("🗑️ Brand deleted successfully");
      return brandId; // Return the ID for removal from state
    } catch (error) {
      toast.error(err.response?.data?.message || "❌ Failed to delete brand");
      return rejectWithValue(error.response?.data?.message || "Failed to delete brand");
    }
  }
);

const adminBrandSlice = createSlice({
  name: "adminBrands",
  initialState: {
    brands: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload;
      })
      .addCase(fetchAllBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteBrandByAdmin.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b._id !== action.payload);
      });
  },
});

export default adminBrandSlice.reducer;
