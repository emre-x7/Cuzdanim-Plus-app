// Axios config (base URL, interceptors)
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  API_BASE_URL,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../constants/config";
import { storage } from "../utils/storage";
import { ApiResponse } from "../types/api";

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 saniye
  headers: {
    "Content-Type": "application/json",
  },
});

// Token yenileme için flag (sonsuz loop'u önlemek için)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR - Her istekte token ekle
axiosInstance.interceptors.request.use(
  async (config: any) => {
    const token = await storage.get(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - 401 hatalarını yakala, token yenile
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // 401 Unauthorized ve daha önce denenmemiş
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Zaten yenileniyor, kuyruğa ekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.get(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          throw new Error("Refresh token bulunamadı");
        }

        // Token yenile
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Yeni token'ları kaydet
        await storage.set(TOKEN_KEY, accessToken);
        await storage.set(REFRESH_TOKEN_KEY, newRefreshToken);

        // Kuyruktaki istekleri işle
        processQueue(null, accessToken);

        // Orijinal isteği yeni token ile tekrar dene
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh başarısız, logout yap
        await storage.remove(TOKEN_KEY);
        await storage.remove(REFRESH_TOKEN_KEY);

        // TODO: Navigation ile login ekranına yönlendir
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
