import "server-only";
import { createHmac } from "node:crypto";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ipAddress } from "@vercel/functions";

/**
 * The network a visitor is limited by: an IPv4 address as it is, and an IPv6 address's /64, which
 * one subscriber usually holds whole and could otherwise rotate through without limit.
 */
export function clientNetwork(ip: string): string {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) return mapped[1];
  if (!ip.includes(":")) return ip;
  const [head, tail] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = tail === undefined ? left : [...left, ...Array<string>(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];
  return `${groups
    .slice(0, 4)
    .map((group) => group.toLowerCase().replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

/**
 * The key that limits a visitor without an account: a keyed hash of the network Vercel reports
 * them from, so Upstash never stores the address. Without that header, as off Vercel, all such
 * visitors share one key.
 */
export function visitorKey(request: Request): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  // Unkeyed, the hash of an IPv4 address could be reversed by trying them all.
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set, so a visitor's address cannot be hashed.");
  const network = clientNetwork(ipAddress(request) ?? "unknown");
  return `ip:${createHmac("sha256", secret).update(`rate-limit:${network}`).digest("base64url")}`;
}

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
  // Reports: each one emails its sender and every admin.
  report: [
    [3, "1 m"],
    [20, "1 d"],
  ],
  // Selling: each request opens a Stripe account or a single-use Stripe link.
  seller: [
    [5, "1 m"],
    [50, "1 d"],
  ],
  // The Sales page's read of an account Stripe has not accepted yet, which a seller may reload while waiting.
  "seller-status": [
    [20, "1 m"],
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
