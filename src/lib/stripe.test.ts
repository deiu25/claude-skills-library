import { afterEach, describe, expect, it, vi } from "vitest";
import { getStripe, isSellingAvailable, isTestKey } from "./stripe";

afterEach(() => vi.unstubAllEnvs());

describe("getStripe", () => {
  it("is null without a key, so selling stays off", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect(getStripe()).toBeNull();
    expect(isSellingAvailable()).toBe(false);
  });

  it("refuses a live key until payments go live", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_123");
    expect(getStripe()).toBeNull();
    vi.stubEnv("STRIPE_SECRET_KEY", "rk_live_123");
    expect(isSellingAvailable()).toBe(false);
    expect(error).toHaveBeenCalledWith("Selling is off: STRIPE_SECRET_KEY is not a test-mode key.");
    error.mockRestore();
  });

  it("makes one client per test key", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    const client = getStripe();
    expect(client).not.toBeNull();
    expect(getStripe()).toBe(client);
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_456");
    expect(getStripe()).not.toBe(client);
  });
});

describe("isTestKey", () => {
  it.each([
    ["sk_test_abc", true],
    ["rk_test_abc", true],
    ["sk_live_abc", false],
    ["pk_test_abc", false],
    ["whsec_abc", false],
    [" sk_test_abc", false],
  ])("%j is a test secret key: %s", (key, expected) => {
    expect(isTestKey(key)).toBe(expected);
  });
});
