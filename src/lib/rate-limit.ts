import "server-only";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Limits for Server Actions and the downloads that read whole skills. Requests to /api/auth have
// Better Auth's own limiter in Postgres. A request passes only when every window of its limit
// allows it, checked shortest first.
const LIMITS = {
  // Creating, saving and deleting skills: bursts while editing, and a daily ceiling on stored versions.
  "skill-write": [
    [20, "1 m"],
    [200, "1 d"],
  ],
  // Zip downloads: each reads up to a megabyte of files from the database.
  "skill-download": [
    [30, "1 m"],
    [300, "1 d"],
  ],
} satisfies Record<string, [number, Duration][]>;

export type LimitName = keyof typeof LIMITS;

/** "ok": go ahead. "limited": too many requests. "unavailable": the limit could not be checked. */
export type LimitResult = "ok" | "limited" | "unavailable";

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
 * answer is "unavailable". In development and tests it allows what it cannot check.
 */
export async function rateLimit(name: LimitName, key: string): Promise<LimitResult> {
  const failClosed = process.env.NODE_ENV === "production";
  if (!redisConfigured()) {
    if (failClosed) console.error("Rate limit refused a request: Upstash Redis is not configured.");
    return failClosed ? "unavailable" : "ok";
  }
  try {
    // One window at a time, so a request the short window refuses does not spend the long one.
    for (const limiter of getLimiters(name)) {
      const result = await limiter.limit(key);
      // The SDK lets a request through when Redis is slower than the timeout, and says so in `reason`.
      if (result.reason === "timeout") return failClosed ? "unavailable" : "ok";
      if (!result.success) return "limited";
    }
    return "ok";
  } catch (error) {
    console.error("Rate limit check failed:", error instanceof Error ? error.name : "unknown error");
    return failClosed ? "unavailable" : "ok";
  }
}
