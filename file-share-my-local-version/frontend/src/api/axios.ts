import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiError(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default api;
