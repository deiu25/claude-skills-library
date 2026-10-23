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
    expect(await (await load())("skill-write", "user-1")).toBe("unavailable");
    expect(console.error).toHaveBeenCalledWith("Rate limit refused a request: Upstash Redis is not configured.");
    expect(limit).not.toHaveBeenCalled();
  });

  it("allows requests in development without Upstash", async () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(await (await load())("skill-write", "user-1")).toBe("ok");
  });

  it("passes only when every window allows the request, and stops at the first that refuses", async () => {
    configure("production");
    const rateLimit = await load();
    limit.mockResolvedValue({ success: true });
    expect(await rateLimit("skill-write", "user-1")).toBe("ok");
    expect(limit).toHaveBeenCalledTimes(2);
    expect(limit).toHaveBeenCalledWith("user-1");

    limit.mockClear();
    limit.mockResolvedValueOnce({ success: false });
    expect(await rateLimit("skill-write", "user-1")).toBe("limited");
    // The day's window is not spent on a request the minute's window refused.
    expect(limit).toHaveBeenCalledTimes(1);
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

  it("answers unavailable in production when Redis times out or fails, and allows in development", async () => {
    configure("production");
    let rateLimit = await load();
    limit.mockResolvedValue({ success: true, reason: "timeout" });
    expect(await rateLimit("skill-write", "user-1")).toBe("unavailable");
    limit.mockRejectedValue(new TypeError("fetch failed"));
    expect(await rateLimit("skill-write", "user-1")).toBe("unavailable");
    expect(console.error).toHaveBeenCalledWith("Rate limit check failed:", "TypeError");

    configure("development");
    rateLimit = await load();
    limit.mockResolvedValue({ success: true, reason: "timeout" });
    expect(await rateLimit("skill-write", "user-1")).toBe("ok");
    limit.mockRejectedValue(new TypeError("fetch failed"));
    expect(await rateLimit("skill-write", "user-1")).toBe("ok");
  });
});

describe("visitorKey", () => {
  const request = (ip?: string) => new Request("https://example.com/", { headers: ip ? { "x-real-ip": ip } : {} });

  beforeEach(() => vi.stubEnv("BETTER_AUTH_SECRET", "secret-for-tests"));
  afterEach(() => vi.unstubAllEnvs());

  it("keys a visitor by a hash of their IP address that does not contain it", async () => {
    const { visitorKey } = await import("./rate-limit");
    const key = visitorKey(request("203.0.113.7"));
    expect(key).toMatch(/^ip:[\w-]{43}$/);
    expect(key).not.toContain("203.0.113.7");
    expect(visitorKey(request("203.0.113.7"))).toBe(key);
    expect(visitorKey(request("203.0.113.8"))).not.toBe(key);
  });

  it("changes every key with the secret, so the hash cannot be matched to an address without it", async () => {
    const { visitorKey } = await import("./rate-limit");
    const key = visitorKey(request("203.0.113.7"));
    vi.stubEnv("BETTER_AUTH_SECRET", "another-secret");
    expect(visitorKey(request("203.0.113.7"))).not.toBe(key);
  });

  it("gives visitors without an address one shared key", async () => {
    const { visitorKey } = await import("./rate-limit");
    expect(visitorKey(request())).toBe(visitorKey(request()));
  });

  it("keys every address of one IPv6 /64 alike, and other networks apart", async () => {
    const { visitorKey } = await import("./rate-limit");
    const key = visitorKey(request("2001:db8:aa:bb::1"));
    expect(visitorKey(request("2001:db8:aa:bb:ffff:1:2:3"))).toBe(key);
    expect(visitorKey(request("2001:db8:aa:bc::1"))).not.toBe(key);
  });

  it("refuses to key a visitor without the secret, rather than hash the address unkeyed", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    const { visitorKey } = await import("./rate-limit");
    expect(() => visitorKey(request("203.0.113.7"))).toThrow(/BETTER_AUTH_SECRET/);
  });
});

describe("clientNetwork", () => {
  it("keeps an IPv4 address whole", async () => {
    const { clientNetwork } = await import("./rate-limit");
    expect(clientNetwork("203.0.113.7")).toBe("203.0.113.7");
    expect(clientNetwork("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });

  it("reduces an IPv6 address to its /64, in one spelling", async () => {
    const { clientNetwork } = await import("./rate-limit");
    expect(clientNetwork("2001:0DB8:0000:00aa:1:2:3:4")).toBe("2001:db8:0:aa::/64");
    expect(clientNetwork("2001:db8::aa:1:2:3:4")).toBe("2001:db8:0:aa::/64");
    expect(clientNetwork("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(clientNetwork("::1")).toBe("0:0:0:0::/64");
  });
});
