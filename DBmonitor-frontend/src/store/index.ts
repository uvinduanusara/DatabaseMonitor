import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import databaseReducer from "./databaseSlice";
import metricsReducer from "./metricsSlice";
import selectedDatabaseReducer from "./selectedDatabaseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    databases: databaseReducer,
    metrics: metricsReducer,
    selectedDatabase: selectedDatabaseReducer,
  },
});

// This line is what TypeScript uses to determine what exists on 'state'
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
