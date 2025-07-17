// 📁 src/store/brand/products_slice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  products: [],
  error: null,
};

// ✅ Fetch all products uploaded by the brand
export const fetchMyBrandProducts = createAsyncThunk(
  "brand/fetchMyBrandProducts",
  async (_, thunkAPI) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/shop/brand/my-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.products;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// ✅ Add new product
export const addBrandProduct = createAsyncThunk(
  "brand/addBrandProduct",
  async (formData, thunkAPI) => {
    const token = sessionStorage.getItem("token");

    // Assume user is logged in and has brand info in auth
    const brandId = thunkAPI.getState().auth.user._id;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shop/brand/upload-product`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.product;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Add product failed"
      );
    }
  }
);

// ✅ Edit product
export const editBrandProduct = createAsyncThunk(
  "brand/editBrandProduct",
  async ({ id, formData }, thunkAPI) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/shop/brand/edit-product/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.product;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Edit product failed"
      );
    }
  }
);

// ✅ Delete product
export const deleteBrandProduct = createAsyncThunk(
  "brand/deleteBrandProduct",
  async (id, thunkAPI) => {
    const token = sessionStorage.getItem("token");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/shop/brand/delete-product/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Delete failed"
      );
    }
  }
);

const brandProductsSlice = createSlice({
  name: "brandProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBrandProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyBrandProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload || [];
      })
      .addCase(fetchMyBrandProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.products = [];
        state.error = action.payload;
      })

      // Add Product
      .addCase(addBrandProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })

      // Edit Product
      .addCase(editBrandProduct.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })

      // Delete Product
      .addCase(deleteBrandProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (p) => p._id !== action.payload
        );
      });
  },
});

export default brandProductsSlice.reducer;
