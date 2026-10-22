import "server-only";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Limits for Server Actions. Requests to /api/auth have Better Auth's own limiter in Postgres.
// A request passes only when every window of its limit allows it.
const LIMITS = {
  // Creating, saving and deleting skills: bursts while editing, and a daily ceiling on stored versions.
  "skill-write": [
    [20, "1 m"],
    [200, "1 d"],
  ],
} satisfies Record<string, [number, Duration][]>;

export type LimitName = keyof typeof LIMITS;

const limiters = new Map<LimitName, Ratelimit[]>();

function getLimiters(name: LimitName): Ratelimit[] {
  let list = limiters.get(name);
  if (!list) {
    // Previews share the production Redis database, so the environment is part of every key.
    const prefix = `ratelimit:${process.env.VERCEL_ENV ?? "development"}:${name}`;
    const redis = Redis.fromEnv();
    list = LIMITS[name].map(
      ([requests, window], index) =>
        new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window), prefix: `${prefix}:${index}`, timeout: 3_000 }),
    );
    limiters.set(name, list);
  }
  return list;
}

// The Vercel Marketplace integration names them KV_REST_API_*; Redis.fromEnv() reads either pair.
const redisConfigured = () =>
  Boolean(
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
      (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN),
  );

/**
 * Whether `key`, usually a user id, may make one more `name` request. In production it fails
 * closed: without Upstash, after a Redis error, or when Redis takes longer than the timeout, the
 * request is refused. In development and tests it allows what it cannot check.
 */
export async function rateLimit(name: LimitName, key: string): Promise<boolean> {
  const failClosed = process.env.NODE_ENV === "production";
  if (!redisConfigured()) {
    if (failClosed) console.error("Rate limit refused a request: Upstash Redis is not configured.");
    return !failClosed;
  }
  try {
    const results = await Promise.all(getLimiters(name).map((limiter) => limiter.limit(key)));
    // The SDK lets a request through when Redis is slower than the timeout, and says so in `reason`.
    return results.every((result) => result.success && !(failClosed && result.reason === "timeout"));
  } catch (error) {
    console.error("Rate limit check failed:", error instanceof Error ? error.name : "unknown error");
    return !failClosed;
  }
}
