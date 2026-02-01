import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
// Using your custom instance that has withCredentials: true
import api from "../lib/axiosConfig"; 
import type { User, AuthState } from "../types";

const initialState: AuthState = {
  user: null,
  status: "idle",
};

// --- Async Thunks ---

export const fetchUser = createAsyncThunk<User>(
  "auth/fetchUser", 
  async (_, { rejectWithValue }) => {
    try {
      // This will now properly carry the SaaS_Auth cookie
      const response = await api.get<User>("/api/auth/me");
      return response.data;
    } catch (error: any) {
      // If the API returns 401, we reject so the state moves to 'failed'
      return rejectWithValue(error.response?.data || "Session expired");
    }
  }
);

export const performLogout = createAsyncThunk(
  "auth/performLogout",
  async (_, { dispatch }) => {
    try {
      await api.get("/api/auth/logout");
    } finally {
      // Always clear local state even if the server-side logout fails
      dispatch(logout());
      // Redirect to Google logout or just home
      window.location.href = "/"; 
    }
  }
);

// --- Slice ---

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Cases
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.status = "failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;