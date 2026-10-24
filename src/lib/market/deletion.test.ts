import { beforeEach, describe, expect, it, vi } from "vitest";

const { where, getStripe, closeSellerAccount } = vi.hoisted(() => ({
  where: vi.fn(),
  getStripe: vi.fn(),
  closeSellerAccount: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const query = { from: () => query, where };
  return { db: { select: () => query } };
});
vi.mock("@/lib/stripe", () => ({ getStripe }));
vi.mock("./stripe-accounts", () => ({ closeSellerAccount }));

const { closeStripeAccountOf } = await import("./deletion");

const error = vi.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  vi.clearAllMocks();
  where.mockResolvedValue([]);
  getStripe.mockReturnValue({});
  closeSellerAccount.mockResolvedValue(undefined);
});

describe("closeStripeAccountOf", () => {
  it("does nothing for a user who never set up selling", async () => {
    await closeStripeAccountOf("user-1");
    expect(getStripe).not.toHaveBeenCalled();
    expect(closeSellerAccount).not.toHaveBeenCalled();
  });

  it("closes the seller's Stripe account in one quick try", async () => {
    where.mockResolvedValue([{ id: "acct_1" }]);
    await closeStripeAccountOf("user-1");
    expect(closeSellerAccount).toHaveBeenCalledWith({}, "acct_1", { maxNetworkRetries: 0, timeout: 5_000 });
    expect(error).not.toHaveBeenCalled();
  });

  it("never throws, and logs the account's id and the error's code, never its message", async () => {
    where.mockResolvedValue([{ id: "acct_1" }]);
    closeSellerAccount.mockRejectedValue(Object.assign(new Error("message with request data"), { code: "resource_missing" }));
    await expect(closeStripeAccountOf("user-1")).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith("Stripe account not closed:", "acct_1", "resource_missing");
  });

  it("logs and goes on when selling is not set up here", async () => {
    where.mockResolvedValue([{ id: "acct_1" }]);
    getStripe.mockReturnValue(null);
    await expect(closeStripeAccountOf("user-1")).resolves.toBeUndefined();
    expect(closeSellerAccount).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Stripe account not closed:", "acct_1", "Error");
  });

  it("does not stop the deletion when the database read fails", async () => {
    where.mockRejectedValue(Object.assign(new Error("db down"), { code: "ECONNREFUSED" }));
    await expect(closeStripeAccountOf("user-1")).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith("Stripe account not closed:", "unknown account", "ECONNREFUSED");
  });
});
