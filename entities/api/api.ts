import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError } from './types';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const CACHE_PREFIX = '@api_cache_';

class AxiosClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: this.getBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private getBaseUrl(): string {
    const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;

    if (__DEV__) {
      if (apiUrlFromConfig && apiUrlFromConfig !== 'DEV') {
        return apiUrlFromConfig;
      }
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3100';
      } else if (Platform.OS === 'ios') {
        return 'http://localhost:3100';
      }
    }
    return apiUrlFromConfig || 'https://api.yourapp.com';
  }

  private setupInterceptors(): void {
    // Логирование исходящих запросов
    this.instance.interceptors.request.use(
        (config: CustomAxiosRequestConfig) => {
          if (__DEV__) {
            const bodyOrParams = config.data || config.params;
            console.log(
                `🚀 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`,
                bodyOrParams ? bodyOrParams : ''
            );
          }
          return config;
        },
        (error: AxiosError) => Promise.reject(this.normalizeError(error))
    );

    // Логирование входящих ответов
    this.instance.interceptors.response.use(
        (response: AxiosResponse) => {
          if (__DEV__) {
            console.log(`✅ [RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`);
          }
          return response;
        },
        async (error: AxiosError) => {
          if (__DEV__) {
            console.log(
                `❌ [ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.message} (${error.response?.status || 'No Status'})`
            );
          }
          return Promise.reject(this.normalizeError(error));
        }
    );
  }

  private normalizeError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const isNetworkError = !error.response && Boolean(error.request);

      return {
        message: isNetworkError
            ? 'Отсутствует подключение к интернету'
            : error.response?.data?.message || error.message,
        statusCode: error.response?.status || (isNetworkError ? 0 : 500),
        errors: error.response?.data?.errors,
        isNetworkError,
      };
    }

    return {
      message: error?.message || 'Произошла неизвестная ошибка',
      statusCode: 500,
    };
  }

// --- ЛОГИКА КЭШИРОВАНИЯ ---

  private getCacheKey(url: string, params?: any): string {
    return `${CACHE_PREFIX}${url}${params ? JSON.stringify(params) : ''}`;
  }

  // Настройка времени жизни кэша (например, 5 минут = 5 * 60 * 1000 мс)
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  private async clearCacheForUrl(url: string) {
    try {
      const baseUrl = url.split('/')[1];
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.includes(`${CACHE_PREFIX}/${baseUrl}`));

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        if (__DEV__) {
          console.log(`🗑️[CACHE CLEARED] Удален кэш для эндпоинта: /${baseUrl} (${cacheKeys.length} ключей)`);
        }
      }
    } catch (e) {
      if (__DEV__) console.error('❌ [CACHE ERROR] Ошибка очистки кэша', e);
    }
  }

  public async get<T = any>(url: string, params?: any): Promise<T> {
    const cacheKey = this.getCacheKey(url, params);

    // 1. СНАЧАЛА ПРОВЕРЯЕМ КЭШ
    try {
      const cachedItem = await AsyncStorage.getItem(cacheKey);
      if (cachedItem) {
        const parsedCache = JSON.parse(cachedItem);
        const isFresh = Date.now() - parsedCache.timestamp < this.CACHE_TTL_MS;

        // Если кэш есть и он еще "свежий" (не прошло 5 минут) - отдаем его и НЕ делаем запрос к сети
        if (isFresh) {
          if (__DEV__) {
            console.log(`📦 [DATA SOURCE] Данные для ${url} загружены из КЭША (без запроса к сети).`);
          }
          return parsedCache.data as T;
        } else {
          if (__DEV__) console.log(`🔄 [CACHE EXPIRED] Кэш для ${url} протух. Делаем новый запрос...`);
        }
      }
    } catch (e) {
      if (__DEV__) console.error('❌ [CACHE ERROR] Ошибка чтения кэша', e);
    }

    // 2. ЕСЛИ КЭША НЕТ ИЛИ ОН ПРОТУХ - ИДЕМ В СЕТЬ
    try {
      const response = await this.instance.get<T>(url, { params });

      if (__DEV__) {
        console.log(`🌐 [DATA SOURCE] Данные для ${url} загружены из СЕТИ.`);
      }

      // Сохраняем в кэш ответ + текущее время
      const cacheDataToSave = {
        timestamp: Date.now(),
        data: response.data,
      };

      AsyncStorage.setItem(cacheKey, JSON.stringify(cacheDataToSave))
          .then(() => {
            if (__DEV__) console.log(`💾[CACHE SAVED] Данные для ${url} обновлены в кэше.`);
          })
          .catch(e => {
            if (__DEV__) console.error('❌ [CACHE ERROR] Ошибка сохранения кэша', e);
          });

      return response.data;
    } catch (error: any) {
      // 3. ЕСЛИ ПРОПАЛ ИНТЕРНЕТ (даже если кэш протух, лучше отдать старый кэш, чем ничего)
      if (error.isNetworkError) {
        if (__DEV__) {
          console.log(`⚠️[NETWORK OFFLINE] Нет сети. Пытаемся достать любой кэш для: ${url}`);
        }

        try {
          const cachedItem = await AsyncStorage.getItem(cacheKey);
          if (cachedItem) {
            const parsedCache = JSON.parse(cachedItem);
            if (__DEV__) {
              console.log(`📦 [DATA SOURCE] Данные для ${url} загружены из СТАРОГО КЭША.`);
            }
            return parsedCache.data as T;
          }
        } catch (cacheError) {
          if (__DEV__) console.error('❌ [CACHE ERROR] Ошибка чтения кэша', cacheError);
        }
      }

      throw error;
    }
  }

  public async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data);
    this.clearCacheForUrl(url);
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