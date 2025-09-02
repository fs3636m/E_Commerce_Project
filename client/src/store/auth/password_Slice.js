import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// -------------------- Forgot Password --------------------
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      );
      return res.data; // return full response { success, message }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { success: false, message: "Failed to send reset email" }
      );
      return res.data;
    }
  }
);

// -------------------- Reset Password --------------------
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, thunkAPI) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        { password }
      );
      return res.data; // return full response { success, message }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { success: false, message: "Failed to reset password" }
      );
    }
  }
);

const passwordSlice = createSlice({
  name: "password",
  initialState: {
    isLoading: false,
    successMessage: "",
    errorMessage: "",
  },
  reducers: {
    clearPasswordState: (state) => {
      state.isLoading = false;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload?.message || "Failed to send reset email";
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.errorMessage = action.payload?.message || "Failed to reset password";
      });
  },
});

export const { clearPasswordState } = passwordSlice.actions;
export default passwordSlice.reducer;
