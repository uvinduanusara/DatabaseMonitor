// lib/axiosConfig.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002",
  withCredentials: true,
});

export default api;
