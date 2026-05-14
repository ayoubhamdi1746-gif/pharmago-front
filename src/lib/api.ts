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

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const { getToken: clientGetToken } = await import("./auth");
    const token = await clientGetToken();
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
        const { getToken: clientGetToken } = await import("./auth");
        const newToken = await clientGetToken();
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
          window.location.href = "/login";
          throw error;
        }
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refresh }
        );
        await setTokens(data.access_token, data.refresh_token);
      })();

      try {
        await refreshPromise;
        const { getToken: clientGetToken } = await import("./auth");
        const newToken = await clientGetToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        await clearTokens();
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
