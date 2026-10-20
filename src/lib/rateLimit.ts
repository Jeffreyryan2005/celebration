/**
 * Robust Sliding Window Rate Limiter
 * Enforces per-IP request throttling to prevent API abuse and DoS attacks.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const ipHistory = new Map<string, RateLimitRecord>();

// Cleanup stale IP entries periodically (skip in test environment to prevent open handle leaks)
if (process.env.NODE_ENV !== 'test') {
  const timer = setInterval(() => {
    const cutoff = Date.now() - 60_000;
    for (const [ip, record] of ipHistory.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
      if (record.timestamps.length === 0) {
        ipHistory.delete(ip);
      }
    }
  }, 60_000);
  timer?.unref?.();
}

export function resetRateLimit(): void {
  ipHistory.clear();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks if a request from an IP is allowed under the rate limit
 * @param ip Client IP address
 * @param limit Max requests per window (default 30/minute)
 * @param windowMs Time window in milliseconds (default 60 seconds)
 */
export function checkRateLimit(
  ip: string,
  limit = parseInt(process.env.RATE_LIMIT_RPM || '30', 10),
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = ipHistory.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipHistory.set(ip, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const reset = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(1, reset),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}
