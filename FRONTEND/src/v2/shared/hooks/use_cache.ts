import { sessionCache } from "@/shared/utils/session_cache.ts";
import { useCallback, useState } from "react";

export function useSessionCache<T>(key: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window === "undefined") return initialValue; // SSR guard
    return sessionCache.read<T>(key) ?? initialValue;
  });

  const set = useCallback(
    (next: T | ((prev: T | undefined) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T | undefined) => T)(prev) : next;
        sessionCache.write(key, resolved);
        return resolved;
      });
  }, [key]);

  const remove = useCallback(() => {
    sessionCache.delete(key);
    setValue(undefined);
  }, [key]);

  return [value, set, remove] as const;
}