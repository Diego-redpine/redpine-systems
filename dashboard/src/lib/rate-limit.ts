import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // ms until window resets
}

// Create Redis-backed rate limiter if Upstash env vars are available
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Cache rate limiter instances by window config
const limiters = new Map<string, Ratelimit>();

function getLimiter(maxRequests: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;

  const key = `${maxRequests}:${windowMs}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    const windowSec = Math.ceil(windowMs / 1000);
    // Upstash uses seconds for window, format as "Xs"
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
      prefix: `ratelimit:${key}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

// ── In-memory fallback (for local dev without Redis) ──
const memStore = new Map<string, number[]>();

function rateLimitMemory(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const timestamps = (memStore.get(identifier) || []).filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: timestamps[0] + windowMs - now,
    };
  }

  timestamps.push(now);
  memStore.set(identifier, timestamps);

  return {
    success: true,
    remaining: maxRequests - timestamps.length,
    reset: windowMs,
  };
}

/**
 * Check rate limit for a given identifier.
 * Uses Upstash Redis in production, falls back to in-memory for local dev.
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60_000,
): Promise<RateLimitResult> {
  const limiter = getLimiter(maxRequests, windowMs);

  if (!limiter) {
    return rateLimitMemory(identifier, maxRequests, windowMs);
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset - Date.now(),
  };
}

/**
 * Get client identifier from request (IP-based)
 */
export function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return ip;
}
