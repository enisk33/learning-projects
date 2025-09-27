/**
 * Rate Limiting Middleware
 * In-memory rate limiting (production için Redis önerilir)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Rate limit kontrolü
   */
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store[key];

    if (!entry || now > entry.resetTime) {
      // Yeni window başlat
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Expired entries'leri temizle
   */
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  /**
   * Store'u temizle (test için)
   */
  reset(): void {
    this.store = {};
  }
}

// Singleton instances
export const apiRateLimiter = new RateLimiter(60000, 20); // 20 requests per minute
export const authRateLimiter = new RateLimiter(60000, 5); // 5 requests per minute (login/register)
export const uploadRateLimiter = new RateLimiter(60000, 3); // 3 uploads per minute

/**
 * Rate limit key oluştur (IP veya user ID bazlı)
 */
export function getRateLimitKey(identifier: string, type: string): string {
  return `${type}:${identifier}`;
}
