import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "../lib/axiosConfig";

export interface Database {
  id: number;
  name: string;
  db_type: string;
  connection_string: string;
}

interface DatabaseState {
  items: Database[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: DatabaseState = {
  items: [],
  status: "idle",
};

// Async thunk to fetch databases from your .NET API
export const fetchDatabases = createAsyncThunk<Database[]>(
  "databases/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<Database[]>(
        "/api/databases",
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching databases:", error);
      return rejectWithValue("Failed to fetch databases");
    }
  },
);

const databaseSlice = createSlice({
  name: "databases",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDatabases.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchDatabases.fulfilled,
        (state, action: PayloadAction<Database[]>) => {
          state.items = action.payload;
          state.status = "succeeded";
        },
      )
      .addCase(fetchDatabases.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default databaseSlice.reducer;
