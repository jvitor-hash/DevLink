export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

// Session persistence times
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours for session data
export const CACHE_KEYS = {
  CURRENT_USER: 'current_user',
  AUTH_TOKEN: 'auth_token',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

export class InMemoryCache<K, V> {
  private cache: Map<K, CacheEntry<V>> = new Map();
  private options: Required<CacheOptions>;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? SESSION_TTL, // Default 24 hours for session persistence
      maxSize: options.maxSize ?? 100, // Default 100 entries
    };
  }

  /**
   * Set a value in the cache
   */
  set(key: K, value: V): void {
    const now = Date.now();

    // Check if we need to evict old entries
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + this.options.ttl,
    });
  }

  /**
   * Get a value from the cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);

    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific entry
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total === 0 ? 0 : this.stats.hits / total,
    };
  }

  /**
   * Get all current keys (non-expired)
   */
  keys(): K[] {
    const keys: K[] = [];
    for (const [key, entry] of this.cache) {
      if (Date.now() <= entry.expiresAt) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Clean expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Evict the oldest entry (based on timestamp)
   */
  private evictOldest(): void {
    let oldestKey: K | undefined;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey);
    }
  }
}
