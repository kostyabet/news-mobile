// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiError } from './types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...params: P) => Promise<{ success: boolean; data?: T; error?: ApiError }>;
  reset: () => void;
}

export function useApi<T, P extends any[] = any[]>(
  apiFunction: (...params: P) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    showErrorAlert?: boolean;
    initialData?: T | null;
  }
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: options?.initialData ?? null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...params);
        
        setState({
          data: result,
          loading: false,
          error: null,
        });

        options?.onSuccess?.(result);

        return { success: true, data: result };
      } catch (error) {
        const apiError = error as ApiError;
        
        setState({
          data: null,
          loading: false,
          error: apiError,
        });

        if (options?.showErrorAlert !== false) {
          Alert.alert('Ошибка', apiError.message || 'Произошла ошибка');
        }

        options?.onError?.(apiError);

        return { success: false, error: apiError };
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({
      data: options?.initialData ?? null,
      loading: false,
      error: null,
    });
  }, [options?.initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}