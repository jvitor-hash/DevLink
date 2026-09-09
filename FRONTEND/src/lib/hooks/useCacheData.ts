import { useCallback, useEffect, useState } from 'react';
import { useCache } from './useCache';

export interface CachedDataOptions {
  ttl?: number;
  maxSize?: number;
  staleWhileRevalidate?: boolean;
}

export interface UseCachedDataResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  clear: () => void;
}

/**
 * Hook for caching asynchronous data
 */
export function useCachedData<T, K = string>(
  key: K,
  fetchFn: () => Promise<T>,
  options: CachedDataOptions = {}
): UseCachedDataResult<T> {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const cache = useCache<K, T>({
    ttl: options.ttl,
    maxSize: options.maxSize,
  });

  const fetchData = useCallback(async (): Promise<T> => {
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    try {
      const result = await fetchFn();
      cache.set(key, result);
      return result;
    } catch (err) {
      // If stale data exists and staleWhileRevalidate is true, return it
      if (options.staleWhileRevalidate && cached !== undefined) {
        console.warn('Using stale data due to fetch error:', err);
        return cached;
      }
      throw err;
    }
  }, [key, fetchFn, cache, options.staleWhileRevalidate]);

  const [data, setData] = useState<T | undefined>(() => cache.get(key));

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      // If we have cached data, keep it
      if (data === undefined) {
        setData(cache.get(key));
      }
    } finally {
      setLoading(false);
    }
  }, [fetchData, key, cache, data]);

  const clear = useCallback(() => {
    cache.remove(key);
    setData(undefined);
    setError(null);
  }, [cache, key]);

  // Initial load
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    clear,
  };
}
