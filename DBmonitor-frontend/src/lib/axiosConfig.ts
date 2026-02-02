import axios from "axios";

// Create a NAMED instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true, // This is the most important line
});

export default api;