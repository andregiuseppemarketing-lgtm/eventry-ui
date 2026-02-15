/**
 * Rate Limiting Utility
 * 
 * Uses Upstash Redis REST API for serverless-compatible rate limiting.
 * Compatible with Vercel Edge/Serverless Functions.
 * 
 * Setup:
 * 1. Create Upstash Redis database: https://console.upstash.com/
 * 2. Add env vars to Vercel:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 * 
 * Usage:
 * ```ts
 * import { rateLimitOr429 } from '@/lib/ratelimit';
 * 
 * const rateLimitResult = await rateLimitOr429(req, {
 *   key: 'register',
 *   identifier: req.ip || 'anonymous',
 *   limit: 5,
 *   window: '1h'
 * });
 * 
 * if (!rateLimitResult.ok) {
 *   return rateLimitResult.response; // Returns 429 with headers
 * }
 * ```
 */

import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client (cached)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[RateLimit] Upstash credentials missing. Rate limiting disabled.');
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

// Rate limiters cache
const limiters = new Map<string, Ratelimit>();

function normalizeWindowDuration(window: string): Duration {
  const match = window.trim().toLowerCase().match(/^(\d+)\s*(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`[RateLimit] Invalid window format: "${window}". Use values like "60 s" or "1 h".`);
  }
  const [, amount, unit] = match;
  return `${amount} ${unit}` as Duration;
}

function getRateLimiter(limit: number, window: string): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  let normalizedWindow: Duration;
  try {
    normalizedWindow = normalizeWindowDuration(window);
  } catch (error) {
    console.error('[RateLimit] Invalid window value:', error);
    return null;
  }

  const key = `${limit}-${normalizedWindow}`;
  if (!limiters.has(key)) {
    limiters.set(key, new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(limit, normalizedWindow),
      analytics: true,
      prefix: 'eventry:ratelimit',
    }));
  }

  return limiters.get(key)!;
}

interface RateLimitOptions {
  /** Route identifier (e.g., 'register', 'follow', 'ticket-issue') */
  key: string;
  /** Unique identifier (IP, userId, or combination) */
  identifier: string;
  /** Max requests allowed */
  limit: number;
  /** Time window (e.g., '1h', '1m', '60s') */
  window: string;
}

interface RateLimitResult {
  ok: boolean;
  response?: NextResponse;
}

/**
 * Check rate limit and return 429 response if exceeded
 * 
 * @param req NextRequest object
 * @param options Rate limit configuration
 * @returns { ok: true } if allowed, or { ok: false, response: NextResponse } with 429
 */
export async function rateLimitOr429(
  req: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(options.limit, options.window);

  // If rate limiting not configured, allow all requests
  if (!limiter) {
    return { ok: true };
  }

  try {
    const rateLimitKey = `${options.key}:${options.identifier}`;
    const { success, limit, reset, remaining } = await limiter.limit(rateLimitKey);

    // Add rate limit headers to all responses
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    };

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter,
          },
          {
            status: 429,
            headers: {
              ...headers,
              'Retry-After': retryAfter.toString(),
            },
          }
        ),
      };
    }

    return { ok: true };
  } catch (error) {
    // On error, fail open (allow request) but log
    console.error('[RateLimit] Error checking rate limit:', error);
    return { ok: true };
  }
}

/**
 * Extract IP address from NextRequest
 * Falls back to 'anonymous' if IP cannot be determined
 */
export function getClientIp(req: NextRequest): string {
  // Vercel provides x-forwarded-for and x-real-ip headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  if (realIp) {
    return realIp;
  }

  // Fallback for local development
  return 'anonymous';
}
