import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UsePaginationReturn<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => Promise<void>;
  setData: (data: T[]) => void;
}

export function usePagination<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, pageSize = 20 } = options;

  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn(pageNum, pageSize);
      setData(result.items);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, fetchFn]);

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < totalPages) {
      fetchData(page + 1);
    }
  }, [page, total, pageSize, fetchData]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      fetchData(page - 1);
    }
  }, [page, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(1);
  }, [fetchData]);

  const hasMore = page < Math.ceil(total / pageSize);

  return {
    data,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    isLoading,
    error,
    hasMore,
    setPage: fetchData,
    nextPage,
    prevPage,
    refresh,
    setData,
  };
}

export default usePagination;
