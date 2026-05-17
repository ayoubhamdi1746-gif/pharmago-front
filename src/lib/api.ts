import axios from "axios";
import { getRefreshToken, setTokens, clearTokens } from "./auth";

const baseURL = "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pharmago_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (typeof window === "undefined") return Promise.reject(error);

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }
      if (isRefreshing && refreshPromise) {
        await refreshPromise;
        const newToken = localStorage.getItem("pharmago_token");
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshPromise = (async () => {
        const refresh = await getRefreshToken();
        if (!refresh) {
          await clearTokens();
          localStorage.removeItem("pharmago_token");
          window.location.href = "/login";
          throw error;
        }
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refresh }
        );
        localStorage.setItem("pharmago_token", data.access_token);
        await setTokens(data.access_token, data.refresh_token);
      })();

      try {
        await refreshPromise;
        const newToken = localStorage.getItem("pharmago_token");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        await clearTokens();
        localStorage.removeItem("pharmago_token");
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }
    if (error.response?.status === 403) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "error", message: "Access denied" },
        })
      );
    }
    if (error.response?.status === 429) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "warning", message: "Too many requests, please wait" },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default api;
