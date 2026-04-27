import { useMemo, useCallback } from 'react';

/**
 * Hook do memoizacji wartościowych obliczeń
 * Zapobiega niepotrzebnym re-renderom
 */
export function useMemoizedValue<T>(value: T, deps: any[] = []): T {
  return useMemo(() => value, deps);
}

/**
 * Hook do memoizacji funkcji callback
 * Zapobiega tworzeniu nowych referencji funkcji
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[] = []
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

/**
 * Hook do debouncingu wartości
 * Przydatny do wyszukiwania i inputów
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import { useState, useEffect } from 'react';

export default useMemoizedValue;
