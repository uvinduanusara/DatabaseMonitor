import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "../lib/axiosConfig";
import { type Metric } from "../types";

interface MetricsState {
  items: Metric[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: MetricsState = {
  items: [],
  status: "idle",
};

export const fetchMetrics = createAsyncThunk<Metric[]>(
  "metrics/fetchAll",
  async () => {
    const response = await axios.get<Metric[]>(
      "http://localhost:5037/api/metrics",
    );
    return response.data;
  },
);

const metricsSlice = createSlice({
  name: "metrics",
  initialState,
  reducers: {
    setMetrics: (state, action: PayloadAction<Metric[]>) => {
      state.items = action.payload;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchMetrics.fulfilled,
        (state, action: PayloadAction<Metric[]>) => {
          state.items = action.payload;
          state.status = "succeeded";
        },
      )
      .addCase(fetchMetrics.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setMetrics } = metricsSlice.actions;
export default metricsSlice.reducer;
