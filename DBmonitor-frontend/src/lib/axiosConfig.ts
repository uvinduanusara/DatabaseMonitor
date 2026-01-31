import axios from "axios";

// Configure axios to include credentials (cookies) with all requests
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5002";
axios.defaults.withCredentials = true;

export default axios;
