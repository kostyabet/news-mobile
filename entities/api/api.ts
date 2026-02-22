// src/services/axiosClient.ts
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ApiError } from './types';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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
    // Получаем URL из конфига Expo
    const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;
    
    if (__DEV__) {
      console.log('📱 Platform:', Platform.OS);
      console.log('🔧 API URL from config:', apiUrlFromConfig);

      // Если передан конкретный URL через переменную окружения
      if (apiUrlFromConfig && apiUrlFromConfig !== 'DEV') {
        return apiUrlFromConfig;
      }

      // Автоматический выбор для эмуляторов
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3100'; // Android эмулятор
      } else if (Platform.OS === 'ios') {
        return 'http://localhost:3100'; // iOS симулятор
      }
    }

    // Продакшен
    return apiUrlFromConfig || 'https://api.yourapp.com';
  }

  private setupInterceptors(): void {
    // Интерсептор для запросов
    this.instance.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        if (__DEV__) {
          console.log('🚀 Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            params: config.params,
            baseURL: config.baseURL,
          });
        }
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(this.normalizeError(error));
      }
    );

    // Интерсептор для ответов
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log('✅ Response Success:', {
            url: response.config.url,
            status: response.status,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (__DEV__) {
          console.error('❌ Response Error:', {
            url: originalRequest?.url,
            message: error.message,
            status: error.response?.status,
          });
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        statusCode: error.response?.status || 500,
        errors: error.response?.data?.errors,
      };
    }

    return {
      message: error?.message || 'Произошла неизвестная ошибка',
      statusCode: 500,
    };
  }

  public async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.instance.get<T>(url, { params });
    return response.data;
  }

  public async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data);
    return response.data;
  }

  public async delete<T = any>(url: string): Promise<T> {
    const response = await this.instance.delete<T>(url);
    return response.data;
  }
}

// Создаем и экспортируем экземпляр
export default new AxiosClient();