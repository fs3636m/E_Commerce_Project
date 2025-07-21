import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

// Initial state with proper structure
const initialState = {
  brands: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBrands: 0
  }
};

// Get all brands with pagination
export const fetchAllBrands = createAsyncThunk(
  "adminBrands/fetchAllBrands",
  async ({ page = 1, limit = 9 }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/brands`,
        {
          params: { page, limit },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return {
        brands: response.data.data,
        pagination: response.data.pagination || {
          currentPage: page,
          totalPages: Math.ceil(response.data.total / limit),
          totalBrands: response.data.total
        }
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch brands");
      return rejectWithValue(error.response?.data?.message || "Failed to fetch brands");
    }
  }
);

// Delete a brand
export const deleteBrand = createAsyncThunk(
  "adminBrands/deleteBrand",
  async (brandId, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/brands/${brandId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Brand deleted successfully");
      return brandId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete brand");
      return rejectWithValue(error.response?.data?.message || "Failed to delete brand");
    }
  }
);

const adminBrandSlice = createSlice({
  name: "adminBrands",
  initialState,
  reducers: {
    // You can add any synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Brands Cases
      .addCase(fetchAllBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload.brands;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Brand Cases
      .addCase(deleteBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = state.brands.filter(brand => brand._id !== action.payload);
        state.pagination.totalBrands -= 1;
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default adminBrandSlice.reducer;