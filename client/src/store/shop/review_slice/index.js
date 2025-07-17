import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

// ---------------------------
// 🛍️ Product Reviews
// ---------------------------

export const addReview = createAsyncThunk(
  "review/addProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shop/review/add`,
        formData
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add review");
    }
  }
);

export const getReviews = createAsyncThunk(
  "review/getProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/review/${productId}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load reviews");
    }
  }
);

// ---------------------------
// 🧑‍💼 Brand Reviews (Public)
// ---------------------------

export const addBrandReview = createAsyncThunk(
  "review/addBrand",
  async ({ brandId, reviewMessage, reviewValue }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shop/review/brand/${brandId}`,
        { reviewMessage, reviewValue }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add brand review");
    }
  }
);

export const getBrandReviews = createAsyncThunk(
  "review/getBrand",
  async (brandId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/review/brand/${brandId}`
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch brand reviews");
    }
  }
);

// ---------------------------
// 🧑‍💼 Brand Reviews (Dashboard)
// ---------------------------

export const getMyBrandReviews = createAsyncThunk(
  "review/getMyBrand",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/review/my-reviews`
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch your brand reviews");
    }
  }
);

// ---------------------------
// 🛡️ Admin Delete
// ---------------------------

export const deleteBrandReviewByAdmin = createAsyncThunk(
  "review/deleteByAdmin",
  async (reviewId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/review/brand/${reviewId}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete review");
    }
  }
);

// ---------------------------
// 🔁 Slice
// ---------------------------

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔄 Product Reviews
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.reviews = [];
      })

      // 🔄 Add Product Review
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 🔄 Brand Reviews (Public)
      .addCase(getBrandReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBrandReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(getBrandReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload;
      })

      .addCase(addBrandReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addBrandReview.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addBrandReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 🔄 Brand Dashboard Reviews
      .addCase(getMyBrandReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyBrandReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(getMyBrandReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload;
      })

      // 🔄 Admin Delete
      .addCase(deleteBrandReviewByAdmin.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((r) => r._id !== action.meta.arg);
      });
  },
});

export default reviewSlice.reducer;
