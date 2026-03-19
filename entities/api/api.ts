import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError } from "./types";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/entities/services/keychain";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const CACHE_PREFIX = "@api_cache_";

class AxiosClient {
  private readonly instance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private sessionExpiredCallback: (() => void) | null = null;

  public onSessionExpired(callback: () => void) {
    this.sessionExpiredCallback = callback;
  }

  constructor() {
    this.instance = axios.create({
      baseURL: this.getBaseUrl(),
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private getBaseUrl(): string {
    const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;

    if (__DEV__) {
      if (apiUrlFromConfig && apiUrlFromConfig !== "DEV") {
        return apiUrlFromConfig;
      }
      if (Platform.OS === "android") {
        return "http://10.0.2.2:3100";
      } else if (Platform.OS === "ios") {
        return "http://localhost:3100";
      }
    }
    return apiUrlFromConfig || "https://api.yourapp.com";
  }

  private normalizeError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const isNetworkError = !error.response && Boolean(error.request);

      return {
        message: isNetworkError
          ? "Отсутствует подключение к интернету"
          : error.response?.data?.message || error.message,
        statusCode: error.response?.status || (isNetworkError ? 0 : 500),
        errors: error.response?.data?.errors,
        isNetworkError,
      };
    }

    return {
      message: error?.message || "Произошла неизвестная ошибка",
      statusCode: 500,
    };
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      async (config: CustomAxiosRequestConfig) => {
        const token = await getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
          console.log(
            `🚀 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`,
          );
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Если ошибка 401 и мы еще не пробовали переповторить (retry)
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Если это запрос на логин или рефреш сам по себе упал - не зацикливаемся
          if (
            originalRequest.url?.includes("login") ||
            originalRequest.url?.includes("refresh")
          ) {
            return Promise.reject(this.normalizeError(error));
          }

          if (this.isRefreshing) {
            // Если процесс обновления уже идет, ждем его завершения
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await getRefreshToken();

            const response = await axios.post(
              `${this.getBaseUrl()}/users/refresh`,
              {
                refreshToken,
              },
            );

            const { accessToken, refreshToken: newRefresh } = response.data;

            await saveTokens(accessToken, newRefresh);

            this.isRefreshing = false;
            this.onTokenRefreshed(accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            await clearTokens();

            if (__DEV__) console.log("❌ [AUTH] Refresh token expired");

            this.sessionExpiredCallback?.();

            return Promise.reject(this.normalizeError(refreshError));
          }
        }

        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.map((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  // --- ЛОГИКА КЭШИРОВАНИЯ ---

  private getCacheKey(url: string, params?: any): string {
    return `${CACHE_PREFIX}${url}${params ? JSON.stringify(params) : ""}`;
  }

  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  private async clearCacheForUrl(url: string) {
    try {
      const baseUrl = url.split("/")[1];
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) =>
        key.includes(`${CACHE_PREFIX}/${baseUrl}`),
      );

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        if (__DEV__) {
          console.log(
            `🗑️[CACHE CLEARED] Удален кэш для эндпоинта: /${baseUrl} (${cacheKeys.length} ключей)`,
          );
        }
      }
    } catch (e) {
      if (__DEV__) console.error("❌ [CACHE ERROR] Ошибка очистки кэша", e);
    }
  }

  public async get<T = any>(url: string, params?: any): Promise<T> {
    const cacheKey = this.getCacheKey(url, params);

    // Network first: всегда пробуем сеть
    try {
      if (__DEV__) console.log(`🚀 [REQUEST] GET ${url}`);

      const response = await this.instance.get<T>(url, { params });

      if (__DEV__) console.log(`🌐 [NET] ${url} — OK`);

      // Сохраняем в кэш в фоне
      AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: response.data }),
      ).catch(() => {});

      return response.data;
    } catch (error: any) {
      // Сеть не доступна — fallback на кэш
      if (__DEV__) console.log(`⚠️ [NET FAIL] ${url} — пробуем кэш...`);

      try {
        const cachedItem = await AsyncStorage.getItem(cacheKey);
        if (cachedItem) {
          const parsedCache = JSON.parse(cachedItem);
          if (__DEV__) console.log(`📦 [CACHE] ${url} — данные из кэша`);
          return parsedCache.data as T;
        }
      } catch (cacheError) {
        if (__DEV__) console.error("❌ [CACHE ERROR]", cacheError);
      }

      throw error;
    }
  }

  public async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data);
    this.clearCacheForUrl(url);
    return response.data;
  }

  public async postFormData<T = any>(url: string, formData: FormData): Promise<T> {
    const response = await this.instance.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  public async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data);
    this.clearCacheForUrl(url);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data);
    this.clearCacheForUrl(url);
    return response.data;
  }

  public async delete<T = any>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url);
    this.clearCacheForUrl(url);
    return response.data;
  }
}

export default new AxiosClient();
