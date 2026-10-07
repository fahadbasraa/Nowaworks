import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes("/auth/me");
    if (error.response?.status === 401 && !isAuthCheck && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
