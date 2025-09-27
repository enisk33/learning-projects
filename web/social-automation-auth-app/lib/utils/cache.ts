/**
 * Simple In-Memory Cache
 * Production için Redis kullanılabilir
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default TTL: 5 dakika
    this.defaultTTL = defaultTTL;

    // Expired entries'leri temizle (her 1 dakikada bir)
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Cache'den değer al
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Expired kontrolü
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Cache'e değer kaydet
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Cache'den değer sil
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Cache'i temizle
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Expired entries'leri temizle
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cache size'ı al
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instances
// Account ID'ler için cache (10 dakika TTL - daha uzun süreli)
export const accountIdCache = new MemoryCache(10 * 60 * 1000);

// Token'lar için cache (2 dakika TTL - kısa süreli)
export const tokenCache = new MemoryCache(2 * 60 * 1000);
