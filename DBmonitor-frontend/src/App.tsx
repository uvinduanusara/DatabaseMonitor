import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks/store";
import { fetchUser } from "./store/authSlice";
import { fetchDatabases } from "./store/databaseSlice";
import { fetchMetrics } from "./store/metricsSlice";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Databases } from "./pages/Databases";

export default function App() {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if we're already logged in via cookies
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    // Once user is authenticated, fetch databases and metrics
    if (user && status === "succeeded") {
      dispatch(fetchDatabases());
      dispatch(fetchMetrics());

      // Set up auto-refresh every 10 seconds (matching worker polling interval)
      const metricsInterval = setInterval(() => {
        dispatch(fetchMetrics());
      }, 10000);

      return () => clearInterval(metricsInterval);
    }
  }, [user, status, dispatch]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0b]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (status === "failed" || !user) {
    return <Login />;
  }

  // If authenticated, show dashboard
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/databases" element={<Databases />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
