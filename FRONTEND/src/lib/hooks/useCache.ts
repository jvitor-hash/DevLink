import { useCallback, useEffect, useMemo, useState } from 'react';
import { InMemoryCache, type CacheOptions } from '../utils/caching';

// Singleton cache instance
const globalCache = new InMemoryCache<unknown, unknown>();

/**
 * Hook for using cache in React components
 */
export function useCache<K, V>(options: CacheOptions = {}) {
  const [cache] = useState(() => new InMemoryCache<K, V>(options));
  const [version, setVersion] = useState(0);

  // Auto-cleanup every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const cleaned = cache.cleanup();
      if (cleaned > 0) {
        setVersion(v => v + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [cache]);

  const set = useCallback((key: K, value: V) => {
    cache.set(key, value);
    setVersion(v => v + 1);
  }, [cache]);

  const get = useCallback((key: K): V | undefined => {
    return cache.get(key);
  }, [cache]);

  const has = useCallback((key: K): boolean => {
    return cache.has(key);
  }, [cache]);

  const remove = useCallback((key: K) => {
    const result = cache.delete(key);
    setVersion(v => v + 1);
    return result;
  }, [cache]);

  const clear = useCallback(() => {
    cache.clear();
    setVersion(v => v + 1);
  }, [cache]);

  const getStats = useCallback(() => {
    return cache.getStats();
  }, [cache]);

  const getKeys = useCallback(() => {
    return cache.keys();
  }, [cache]);

  return useMemo(() => ({
    set,
    get,
    has,
    remove,
    clear,
    getStats,
    getKeys,
    version,
  }), [set, get, has, remove, clear, getStats, getKeys, version]);
}

/**
 * Global cache utility for non-React contexts
 */
export const cache = {
  get: <V>(key: unknown): V | undefined => globalCache.get(key) as V | undefined,
  set: <V>(key: unknown, value: V): void => globalCache.set(key, value),
  has: (key: unknown): boolean => globalCache.has(key),
  delete: (key: unknown): boolean => globalCache.delete(key),
  clear: (): void => globalCache.clear(),
  getStats: (): { size: number; hits: number; misses: number; hitRate: number } =>
    globalCache.getStats(),
  keys: (): unknown[] => globalCache.keys(),
  cleanup: (): number => globalCache.cleanup(),
};
