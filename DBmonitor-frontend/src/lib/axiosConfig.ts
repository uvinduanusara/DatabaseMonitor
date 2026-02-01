import axios from "axios";

// Create a NAMED instance
const api = axios.create({
  baseURL: "https://dbmonitor.uvindu.xyz",
  withCredentials: true, // This is the most important line
});

export default api;