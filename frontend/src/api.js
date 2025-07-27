import axios from "axios";

const api = axios.create({
  baseURL: "/api", // ✅ Let Vite proxy redirect this to http://localhost:5000
});

// ✅ Automatically attach token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
