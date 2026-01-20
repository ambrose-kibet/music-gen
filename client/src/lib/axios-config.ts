import {
  removeLocalStorageItem,
  setLocalStorageItem,
} from "@/utils/local-storage";
import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

// extend request config with a retry counter
interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retryCount?: number;
}

const customAxios: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

customAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    try {
      if (
        error?.response?.status === 401 &&
        originalRequest.url !== "/auth/refresh"
      ) {
        // initialize retry counter if missing
        originalRequest._retryCount = originalRequest._retryCount ?? 0;

        // prevent infinite retry loops by capping attempts
        const MAX_RETRY = 5;
        if (originalRequest._retryCount >= MAX_RETRY) {
          // give up: clear user and redirect to auth
          removeLocalStorageItem("user");
          window.location.href = "/auth";
          return Promise.reject(error);
        }

        // increment and attempt token refresh
        originalRequest._retryCount += 1;
        await refreshAccessToken();
        return customAxios(originalRequest);
      }

      if (error?.response?.status === 403) {
        const response = await getCurrentUser();
        setLocalStorageItem("user", JSON.stringify(response));
        window.location.href = "/";
      }
    } catch (refreshError) {
      console.error(refreshError);
      removeLocalStorageItem("user");
      window.location.href = "/auth";
      return Promise.reject(refreshError);
    }
    return Promise.reject(error);
  }
);

export default customAxios;

const getCurrentUser = async () => {
  const res = await customAxios.get("/auth/me");
  return res.data;
};

const refreshAccessToken = async () => {
  const res = await customAxios.get("/auth/refresh");
  return res.data;
};
