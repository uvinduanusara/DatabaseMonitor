import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://dbmonitor.uvindu.xyz",
  withCredentials: true, // This allows the cookie to be sent
});

export default api; // Export THIS specific instance
