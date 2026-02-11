/**
 * Rate Limiter
 * Simple in-memory rate limiting system
 * For production, consider using Upstash Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (e.g., userId)
   * @param limit - Max requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  check(key: string, limit: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    // No previous entry or expired
    if (!entry || now > entry.resetAt) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.store.set(key, newEntry);

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: newEntry.resetAt,
      };
    }

    // Entry exists and not expired
    if (entry.count < limit) {
      entry.count++;
      this.store.set(key, entry);

      return {
        allowed: true,
        remaining: limit - entry.count,
        resetAt: entry.resetAt,
      };
    }

    // Limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Rate limiter: cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Get current stats
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
  } {
    const now = Date.now();
    let active = 0;

    for (const entry of this.store.values()) {
      if (now <= entry.resetAt) {
        active++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys: active,
    };
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configs
 */
export const RATE_LIMITS = {
  IDENTITY_UPLOAD_HOURLY: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  IDENTITY_UPLOAD_DAILY: {
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
};

/**
 * Check identity upload rate limit
 * Returns true if allowed, false if exceeded
 */
export function checkIdentityUploadLimit(userId: string): {
  allowed: boolean;
  hourlyRemaining: number;
  dailyRemaining: number;
  resetAt: number;
  message?: string;
} {
  const hourlyKey = `identity-upload-hourly:${userId}`;
  const dailyKey = `identity-upload-daily:${userId}`;

  const hourlyResult = rateLimiter.check(
    hourlyKey,
    RATE_LIMITS.IDENTITY_UPLOAD_HOURLY.limit,
    RATE_LIMITS.IDENTITY_UPLOAD_HOURLY.windowMs
  );

  if (!hourlyResult.allowed) {
    const resetDate = new Date(hourlyResult.resetAt);
    const minutesLeft = Math.ceil((hourlyResult.resetAt - Date.now()) / 60000);
    
    return {
      allowed: false,
      hourlyRemaining: 0,
      dailyRemaining: 0,
      resetAt: hourlyResult.resetAt,
      message: `Limite orario superato. Riprova tra ${minutesLeft} minuti (${resetDate.toLocaleTimeString('it-IT')})`,
    };
  }

  const dailyResult = rateLimiter.check(
    dailyKey,
    RATE_LIMITS.IDENTITY_UPLOAD_DAILY.limit,
    RATE_LIMITS.IDENTITY_UPLOAD_DAILY.windowMs
  );

  if (!dailyResult.allowed) {
    const resetDate = new Date(dailyResult.resetAt);
    const hoursLeft = Math.ceil((dailyResult.resetAt - Date.now()) / 3600000);
    
    return {
      allowed: false,
      hourlyRemaining: hourlyResult.remaining,
      dailyRemaining: 0,
      resetAt: dailyResult.resetAt,
      message: `Limite giornaliero superato. Riprova tra ${hoursLeft} ore (${resetDate.toLocaleDateString('it-IT')} alle ${resetDate.toLocaleTimeString('it-IT')})`,
    };
  }

  return {
    allowed: true,
    hourlyRemaining: hourlyResult.remaining,
    dailyRemaining: dailyResult.remaining,
    resetAt: Math.max(hourlyResult.resetAt, dailyResult.resetAt),
  };
}

/**
 * Reset user's upload rate limit (admin only)
 */
export function resetIdentityUploadLimit(userId: string): void {
  rateLimiter.reset(`identity-upload-hourly:${userId}`);
  rateLimiter.reset(`identity-upload-daily:${userId}`);
  console.log(`🔓 Rate limit reset for user: ${userId}`);
}

/**
 * Get rate limiter stats
 */
export function getRateLimiterStats() {
  return rateLimiter.getStats();
}

export default rateLimiter;
