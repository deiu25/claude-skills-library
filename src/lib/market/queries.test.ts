import { beforeEach, describe, expect, it, vi } from "vitest";

const { rows, updates, rateLimit, getStripe, transfersStatus } = vi.hoisted(() => ({
  rows: [] as unknown[][],
  updates: [] as unknown[],
  rateLimit: vi.fn(),
  getStripe: vi.fn(),
  transfersStatus: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), cache: <T>(run: T) => run }));
vi.mock("@/lib/db", () => {
  const read = { from: () => read, where: async () => rows.shift() ?? [] };
  const write = { set: (values: unknown) => (updates.push(values), write), where: async () => [] };
  return { db: { select: () => read, update: () => write } };
});
vi.mock("@/lib/rate-limit", () => ({ rateLimit }));
vi.mock("@/lib/stripe", () => ({ getStripe, errorCode: () => "code" }));
vi.mock("./stripe-accounts", () => ({ transfersStatus }));

const { getSeller, sellerState } = await import("./queries");

const notReady = [{ stripeAccountId: "acct_1", ready: false, country: "RO" }];

beforeEach(() => {
  vi.clearAllMocks();
  rows.length = 0;
  updates.length = 0;
  rateLimit.mockResolvedValue("ok");
  getStripe.mockReturnValue({});
});

describe("getSeller", () => {
  it("is null for a user who never set up selling", async () => {
    expect(await getSeller("user-1")).toBeNull();
    expect(transfersStatus).not.toHaveBeenCalled();
  });

  it("never asks Stripe again about an account it already accepted", async () => {
    rows.push([{ stripeAccountId: "acct_1", ready: true, country: "RO" }]);
    expect(await getSeller("user-1")).toEqual({ country: "RO", ready: true, status: "active" });
    expect(transfersStatus).not.toHaveBeenCalled();
    expect(rateLimit).not.toHaveBeenCalled();
  });

  it("marks the account ready once Stripe reports its transfers active", async () => {
    rows.push(notReady);
    transfersStatus.mockResolvedValue("active");
    expect(await getSeller("user-1")).toEqual({ country: "RO", ready: true, status: "active" });
    expect(updates).toEqual([{ ready: true, updatedAt: expect.any(Date) }]);
  });

  it.each(["pending", "restricted", "rejected", "unsupported", "missing"])("stores nothing while Stripe reports %s", async (status) => {
    rows.push(notReady);
    transfersStatus.mockResolvedValue(status);
    expect(await getSeller("user-1")).toEqual({ country: "RO", ready: false, status });
    expect(updates).toEqual([]);
  });

  it("asks Stripe within a limit per user, and shows the state as unknown past it", async () => {
    rows.push(notReady);
    rateLimit.mockResolvedValue("limited");
    expect(await getSeller("user-1")).toEqual({ country: "RO", ready: false, status: "unknown" });
    expect(rateLimit).toHaveBeenCalledWith("seller-status", "user-1");
    expect(transfersStatus).not.toHaveBeenCalled();
  });

  it("shows the state as unknown when Stripe fails or selling is off", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    rows.push(notReady, notReady);
    transfersStatus.mockRejectedValue(new Error("timeout"));
    expect((await getSeller("user-1"))?.status).toBe("unknown");
    getStripe.mockReturnValue(null);
    expect((await getSeller("user-1"))?.status).toBe("unknown");
    expect(updates).toEqual([]);
  });
});

describe("sellerState", () => {
  it("reads only the stored row", async () => {
    rows.push([], [{ ready: false }], [{ ready: true }]);
    expect(await sellerState("user-1")).toBe("none");
    expect(await sellerState("user-1")).toBe("not-ready");
    expect(await sellerState("user-1")).toBe("ready");
    expect(transfersStatus).not.toHaveBeenCalled();
  });
});
