// frontend/lib/utils/rateLimit.ts
// Minimal in-memory, sliding-window rate limiter for API route handlers.
// Key by user id (or IP for anonymous) so a single user can't hammer writes.

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();
const CLEANUP_INTERVAL_MS = 10_000;
let lastCleanup = Date.now();

export type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

export function rateLimit(
  key: string,
  max: number,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [k, b] of buckets) {
      if (now - b.windowStart >= windowMs) buckets.delete(k);
    }
    lastCleanup = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true, retryAfterSeconds: 0, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    const retry = windowMs - (now - bucket.windowStart);
    return { ok: false, retryAfterSeconds: Math.ceil(retry / 1000), remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0, remaining: max - bucket.count };
}