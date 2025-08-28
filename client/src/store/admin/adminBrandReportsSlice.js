// adminBrandReportsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ createAsyncThunk
export const fetchAdminBrandSales = createAsyncThunk(
  "adminReports/fetchAdminBrandSales",
  async ({ granularity, start, end }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/admin-reports/brands`,
        {
          params: { period: granularity, start, end },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? "Request failed");
    }
  }
);

const adminBrandReportsSlice = createSlice({
  name: "adminBrandReports",
  initialState: { loading: false, series: [], error: null, granularity: "day" },
  reducers: {
    setGranularity(state, action) {
      state.granularity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBrandSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBrandSales.fulfilled, (state, action) => {
        state.loading = false;
        state.series = Array.isArray(action.payload?.series)
          ? action.payload.series
          : [];
      })
      .addCase(fetchAdminBrandSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { setGranularity } = adminBrandReportsSlice.actions;
export default adminBrandReportsSlice.reducer;
