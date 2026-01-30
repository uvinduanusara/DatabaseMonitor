import axios from "axios";

// Configure axios to include credentials (cookies) with all requests
axios.defaults.baseURL = "http://localhost:5037";
axios.defaults.withCredentials = true;

export default axios;
