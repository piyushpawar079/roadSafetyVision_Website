// ===========================================
// CUSTOM HOOKS FOR API CALLS
// ===========================================

'use client';

import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      url: string,
      options?: RequestInit
    ): Promise<ApiResponse<T> | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          ...options,
        });

        const result: ApiResponse<T> = await response.json();

        if (result.success) {
          setState({ data: result.data || null, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: result.message || 'Something went wrong',
          });
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Network error';
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}