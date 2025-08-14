import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchBrandSalesReport = createAsyncThunk(
  "adminReports/fetchBrandSalesReport",
  async ({ granularity, start, end }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/reports/brands`,
        { params: { period: granularity, start, end } }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? "Request failed");
    }
  }
);


const adminReportsSlice = createSlice({
  name: "adminReports",
  initialState: {
    loading: false,
    series: [],
    error: null,
    granularity: "day",
  },
  reducers: {
    setGranularity(state, action) {
      state.granularity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.series = Array.isArray(payload?.series)
          ? payload.series
          : Array.isArray(payload)
          ? payload
          : [];
      })
      .addCase(fetchBrandSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { setGranularity } = adminReportsSlice.actions; // ✅ real function
export default adminReportsSlice.reducer;
