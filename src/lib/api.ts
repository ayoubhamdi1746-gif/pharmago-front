import axios from "axios";
import { getRefreshToken, setTokens, clearTokens } from "./auth";

const baseURL = "/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

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
      originalRequest._retry = true;
      try {
        const refresh = await getRefreshToken();
        if (!refresh) {
          await clearTokens();
          window.location.href = "/login";
          return Promise.reject(error);
        }
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refresh }
        );
        await setTokens(data.access_token, data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        await clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
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
