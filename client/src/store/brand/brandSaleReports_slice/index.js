import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchBrandSalesReport = createAsyncThunk(
  "brandReports/fetchBrandSalesReport",
  async ({ granularity, start, end }, { rejectWithValue }) => {
    try {
      // ✅ get token from localStorage (or Redux auth state if that’s where you store it)
      const token = sessionStorage.getItem("token");

      const { data } = await axios.get(
       `${import.meta.env.VITE_API_URL}/api/brand/reports/my-sales`,
        {
          params: { period: granularity, start, end },
          headers: {
            Authorization: `Bearer ${token}`, // 🔑 attach token
          },
          withCredentials: true,
        }
      );

      return data; // { success: true, series: [...] }
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? "Request failed");
    }
  }
);

const brandReportsSlice = createSlice({
  name: "brandReports",
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
      })
      .addCase(fetchBrandSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.series = action.payload?.series ?? [];
        state.error = null;
      })
      .addCase(fetchBrandSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setGranularity } = brandReportsSlice.actions;
export default brandReportsSlice.reducer;