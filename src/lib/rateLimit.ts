import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding-window storage
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      // Remove timestamps older than 15 minutes
      record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Extract Client IP address from request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Check and record a rate-limited action using a sliding window algorithm
 * @param identifier Unique key (e.g. `checkout:${ip}`)
 * @param limit Maximum allowed requests in window
 * @param windowMs Window duration in milliseconds (e.g. 60000 for 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestInWindow = record.timestamps[0];
    const resetMs = oldestInWindow + windowMs - now;
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds: Math.ceil(Math.max(1, resetMs / 1000)),
    };
  }

  // Record this hit
  record.timestamps.push(now);

  const remaining = Math.max(0, limit - record.timestamps.length);
  return {
    success: true,
    limit,
    remaining,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}
