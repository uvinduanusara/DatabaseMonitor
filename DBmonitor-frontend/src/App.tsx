import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks/store";
import { fetchUser } from "./store/authSlice";
import { fetchDatabases } from "./store/databaseSlice";
import { fetchMetrics } from "./store/metricsSlice";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Databases } from "./pages/Databases";
import LandingPage from "./pages/LandingPage";

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

  // Show routes based on auth state
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          status === "succeeded" && user ? <Navigate to="/dashboard" replace /> : <LandingPage />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          status === "succeeded" && user ? <Dashboard /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/databases" 
        element={
          status === "succeeded" && user ? <Databases /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/login" 
        element={
          status === "succeeded" && user ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
