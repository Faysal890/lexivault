import { Redis } from "@upstash/redis";
import { RateLimitedError } from "./errors";

/**
 * Sliding-window rate limiter.
 *
 * Backed by Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set
 * (works correctly across multiple instances). Falls back to per-process in-memory state
 * for local dev or single-instance deployments without Redis configured.
 */

interface RateLimitOptions {
  name: string;
  limit: number;
  windowMs: number;
  /** Optional extra key (e.g. email or userId) appended to the IP. */
  key?: string;
}

let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// In-memory fallback for environments without Redis configured.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastCleanup = 0;

function memoryCheck(k: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const existing = buckets.get(k);
  if (!existing || existing.resetAt <= now) {
    buckets.set(k, { count: 1, resetAt: now + windowMs });
    if (now - lastCleanup > 60_000) {
      lastCleanup = now;
      buckets.forEach((v, key) => {
        if (v.resetAt <= now) buckets.delete(key);
      });
    }
    return;
  }
  if (existing.count >= limit) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    throw new RateLimitedError(`Too many requests. Try again in ${retryAfter}s.`);
  }
  existing.count += 1;
}

async function redisCheck(client: Redis, k: string, limit: number, windowMs: number): Promise<void> {
  // INCR + PEXPIRE NX gives us a fixed-window counter that auto-expires.
  const key = `rl:${k}`;
  const count = await client.incr(key);
  if (count === 1) {
    // First hit in the window — set TTL.
    await client.pexpire(key, windowMs);
  }
  if (count > limit) {
    const ttlMs = await client.pttl(key);
    const retryAfter = Math.max(1, Math.ceil((ttlMs > 0 ? ttlMs : windowMs) / 1000));
    throw new RateLimitedError(`Too many requests. Try again in ${retryAfter}s.`);
  }
}

export async function rateLimit(req: Request, opts: RateLimitOptions): Promise<void> {
  const ip = clientIp(req);
  const k = `${opts.name}:${ip}${opts.key ? `:${opts.key}` : ""}`;

  const client = getRedis();
  if (client) {
    try {
      await redisCheck(client, k, opts.limit, opts.windowMs);
      return;
    } catch (err) {
      // If it's our own RateLimitedError, propagate. Anything else (network/Upstash outage)
      // falls through to in-memory so we don't lock all users out during a Redis outage.
      if (err instanceof RateLimitedError) throw err;
      console.error("[rate-limit] Redis check failed, falling back to memory");
    }
  }
  memoryCheck(k, opts.limit, opts.windowMs);
}
