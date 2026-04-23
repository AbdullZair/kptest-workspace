import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface UseSecureStorageReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  setData: (value: T) => Promise<void>;
  removeData: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSecureStorage<T>(key: string): UseSecureStorageReturn<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stored = await SecureStore.getItemAsync(key);
      if (stored) {
        setDataState(JSON.parse(stored));
      } else {
        setDataState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setDataState(null);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setData = useCallback(async (value: T) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      setDataState(value);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
    }
  }, [key]);

  const removeData = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(key);
      setDataState(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove data');
    }
  }, [key]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    setData,
    removeData,
    refresh: loadData,
  };
}

export default useSecureStorage;
