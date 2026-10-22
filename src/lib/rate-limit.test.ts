import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { limit, Ratelimit } = vi.hoisted(() => {
  const limit = vi.fn();
  const Ratelimit = Object.assign(
    vi.fn(function (this: { limit: typeof limit }) {
      this.limit = limit;
    }),
    { slidingWindow: vi.fn((requests: number, window: string) => ({ requests, window })) },
  );
  return { limit, Ratelimit };
});

vi.mock("server-only", () => ({}));
vi.mock("@upstash/redis", () => ({ Redis: { fromEnv: vi.fn(() => ({})) } }));
vi.mock("@upstash/ratelimit", () => ({ Ratelimit }));

/** A fresh module, so its cached limiters do not leak between tests. */
async function load() {
  vi.resetModules();
  return (await import("./rate-limit")).rateLimit;
}

function configure(nodeEnv: string) {
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("KV_REST_API_URL", "https://redis.example.com");
  vi.stubEnv("KV_REST_API_TOKEN", "token");
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const name of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"]) {
      vi.stubEnv(name, "");
    }
  });
  afterEach(() => vi.unstubAllEnvs());

  it("refuses every request in production when Upstash is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await (await load())("skill-write", "user-1")).toBe(false);
    expect(console.error).toHaveBeenCalledWith("Rate limit refused a request: Upstash Redis is not configured.");
    expect(limit).not.toHaveBeenCalled();
  });

  it("allows requests in development without Upstash", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(await (await load())("skill-write", "user-1")).toBe(true);
  });

  it("passes only when every window allows the request", async () => {
    configure("production");
    const rateLimit = await load();
    limit.mockResolvedValue({ success: true });
    expect(await rateLimit("skill-write", "user-1")).toBe(true);
    expect(limit).toHaveBeenCalledTimes(2);
    expect(limit).toHaveBeenCalledWith("user-1");

    limit.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    expect(await rateLimit("skill-write", "user-1")).toBe(false);
  });

  it("keeps one limiter per window, keyed by environment and limit name", async () => {
    configure("production");
    vi.stubEnv("VERCEL_ENV", "preview");
    const rateLimit = await load();
    limit.mockResolvedValue({ success: true });
    await rateLimit("skill-write", "user-1");
    await rateLimit("skill-write", "user-2");
    expect(Ratelimit).toHaveBeenCalledTimes(2);
    expect((Ratelimit.mock.calls as unknown as [{ prefix: string }][]).map(([config]) => config.prefix)).toEqual([
      "ratelimit:preview:skill-write:0",
      "ratelimit:preview:skill-write:1",
    ]);
    expect(Ratelimit.slidingWindow.mock.calls).toEqual([
      [20, "1 m"],
      [200, "1 d"],
    ]);
  });

  it("refuses in production when Redis times out or fails, and allows in development", async () => {
    configure("production");
    let rateLimit = await load();
    limit.mockResolvedValue({ success: true, reason: "timeout" });
    expect(await rateLimit("skill-write", "user-1")).toBe(false);
    limit.mockRejectedValue(new TypeError("fetch failed"));
    expect(await rateLimit("skill-write", "user-1")).toBe(false);
    expect(console.error).toHaveBeenCalledWith("Rate limit check failed:", "TypeError");

    configure("development");
    rateLimit = await load();
    limit.mockResolvedValue({ success: true, reason: "timeout" });
    expect(await rateLimit("skill-write", "user-1")).toBe(true);
    limit.mockRejectedValue(new TypeError("fetch failed"));
    expect(await rateLimit("skill-write", "user-1")).toBe(true);
  });
});
