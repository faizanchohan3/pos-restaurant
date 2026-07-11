// API Configuration
// Use environment variable if available, otherwise use deployed backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://pos-backend-lime.vercel.app";

export default API_BASE_URL;
