import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SelectedDatabaseState {
  selectedId: number | null;
}

const initialState: SelectedDatabaseState = {
  selectedId: null,
};

const selectedDatabaseSlice = createSlice({
  name: "selectedDatabase",
  initialState,
  reducers: {
    setSelectedDatabase: (state, action: PayloadAction<number | null>) => {
      state.selectedId = action.payload;
    },
  },
});

export const { setSelectedDatabase } = selectedDatabaseSlice.actions;
export default selectedDatabaseSlice.reducer;
