import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** A stand-in for a drizzle query builder, as in skills/actions.test.ts: calls are recorded, results queued. */
const { calls, results, builder, redirect, stripeAccounts, getStripe, sellerState } = vi.hoisted(() => {
  const calls: { method: string; args: unknown[] }[] = [];
  const results: unknown[] = [];
  const builder: unknown = new Proxy(() => {}, {
    get(_target, property) {
      if (property === "then") {
        return (resolve: (value: unknown) => void, reject: (error: unknown) => void) => {
          const next = results.length ? results.shift() : [];
          return next instanceof Error ? reject(next) : resolve(next);
        };
      }
      return (...args: unknown[]) => {
        calls.push({ method: String(property), args });
        return builder;
      };
    },
  });
  const redirect = vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  });
  const stripeAccounts = {
    createSellerAccount: vi.fn(),
    createOnboardingLink: vi.fn(),
    createDashboardLink: vi.fn(),
    closeSellerAccount: vi.fn(),
  };
  return { calls, results, builder, redirect, stripeAccounts, getStripe: vi.fn(), sellerState: vi.fn() };
});

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => (builder as { select: (...a: unknown[]) => unknown }).select(...args),
    insert: (...args: unknown[]) => (builder as { insert: (...a: unknown[]) => unknown }).insert(...args),
    update: (...args: unknown[]) => (builder as { update: (...a: unknown[]) => unknown }).update(...args),
  },
}));
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(async () => "ok") }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ host: "localhost:3000" }) }));
vi.mock("@/lib/stripe", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/stripe")>()), getStripe }));
vi.mock("./stripe-accounts", () => stripeAccounts);
vi.mock("./queries", () => ({ sellerState }));

const { getSession } = await import("@/lib/auth/session");
const { rateLimit } = await import("@/lib/rate-limit");
const { revalidatePath } = await import("next/cache");
const { openStripeDashboard, removeSkillPrice, setSkillPrice, startSelling } = await import("./actions");

const STRIPE = { client: "stripe" };
const SKILL = "6f1c2a3e-8b4d-4f5a-9c7e-1d2b3c4d5e6f";
const USER = { id: "user-b", email: "seller@example.com", name: "Seller" };
const NOT_FOUND = { ok: false, error: "We could not find this skill. It may have been deleted." };

const wheres = () =>
  calls.filter((call) => call.method === "where").map((call) => new PgDialect().sqlToQuery(call.args[0] as SQL));
const valuesOf = (method: string) => calls.filter((call) => call.method === method).map((call) => call.args[0]);
const country = (code: string) => {
  const data = new FormData();
  data.set("country", code);
  return data;
};
const price = (value: string) => {
  const data = new FormData();
  data.set("price", value);
  return data;
};
const refused = () => new Stripe.errors.StripeInvalidRequestError({ type: "invalid_request_error", code: "email_domain_invalid_for_recipient" });

beforeEach(() => {
  vi.clearAllMocks();
  calls.length = 0;
  results.length = 0;
  vi.spyOn(console, "error").mockImplementation(() => {});
  getStripe.mockReturnValue(STRIPE);
  vi.mocked(getSession).mockResolvedValue({ user: USER } as never);
  stripeAccounts.createOnboardingLink.mockResolvedValue("https://connect.stripe.com/setup/e/acct_x/link");
  stripeAccounts.createDashboardLink.mockResolvedValue("https://connect.stripe.com/express/acct_x/login");
  stripeAccounts.createSellerAccount.mockResolvedValue("acct_new");
  stripeAccounts.closeSellerAccount.mockResolvedValue(undefined);
});

describe("startSelling", () => {
  it("is off without a Stripe test key, before reading the session", async () => {
    getStripe.mockReturnValue(null);
    expect(await startSelling(null, country("RO"))).toEqual({ ok: false, error: "Selling is not available on this site yet." });
    expect(getSession).not.toHaveBeenCalled();
  });

  it("answers a signed-out request with a message, and spends the seller limit of a signed-in one", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    expect(await startSelling(null, country("RO"))).toMatchObject({ ok: false, error: expect.stringMatching(/^You are signed out/) });
    vi.mocked(getSession).mockResolvedValue({ user: USER } as never);
    vi.mocked(rateLimit).mockResolvedValueOnce("limited");
    expect(await startSelling(null, country("RO"))).toMatchObject({ ok: false, error: expect.stringMatching(/^Too many requests/) });
    expect(rateLimit).toHaveBeenCalledWith("seller", "user-b");
    expect(stripeAccounts.createSellerAccount).not.toHaveBeenCalled();
  });

  it("sends a user with an account back to Stripe's form, opening no second one", async () => {
    results.push([{ id: "acct_old" }]);
    await expect(startSelling(null, country("DE"))).rejects.toThrow("NEXT_REDIRECT https://connect.stripe.com/setup/e/acct_x/link");
    expect(stripeAccounts.createSellerAccount).not.toHaveBeenCalled();
    expect(stripeAccounts.createOnboardingLink).toHaveBeenCalledWith(STRIPE, "acct_old", "http://localhost:3000");
    expect(wheres()[0].params).toEqual(["user-b"]);
  });

  it("refuses a country Stripe does not onboard for the platform, before calling Stripe", async () => {
    results.push([]);
    expect(await startSelling(null, country("US"))).toEqual({ ok: false, error: "Choose the country you are based in." });
    expect(stripeAccounts.createSellerAccount).not.toHaveBeenCalled();
  });

  it("opens the account in the chosen country, stores it, then sends the user to Stripe", async () => {
    results.push([], [{ id: "acct_new" }]);
    await expect(startSelling(null, country("RO"))).rejects.toThrow("NEXT_REDIRECT");
    expect(stripeAccounts.createSellerAccount).toHaveBeenCalledWith(STRIPE, { userId: "user-b", email: "seller@example.com", name: "Seller", country: "RO" });
    expect(valuesOf("values")).toEqual([{ userId: "user-b", stripeAccountId: "acct_new", country: "RO" }]);
    expect(calls.map((call) => call.method)).toContain("onConflictDoNothing");
    expect(stripeAccounts.createOnboardingLink).toHaveBeenCalledWith(STRIPE, "acct_new", "http://localhost:3000");
  });

  it("closes an account a request opened at the same moment as another, and uses the one stored", async () => {
    results.push([], [], [{ id: "acct_first" }]);
    await expect(startSelling(null, country("DE"))).rejects.toThrow("NEXT_REDIRECT");
    expect(stripeAccounts.closeSellerAccount).toHaveBeenCalledWith(STRIPE, "acct_new");
    expect(stripeAccounts.createOnboardingLink).toHaveBeenCalledWith(STRIPE, "acct_first", "http://localhost:3000");
  });

  it("logs the id of an account Stripe opened but the database did not store", async () => {
    results.push([], Object.assign(new Error("insert failed"), { code: "57P01" }));
    expect(await startSelling(null, country("RO"))).toEqual({ ok: false, error: "Stripe did not answer. Try again in a moment." });
    expect(console.error).toHaveBeenCalledWith("Seller account not stored:", "acct_new", "57P01");
  });

  it("refreshes the page when only the link failed, so it offers to continue instead of a new country", async () => {
    results.push([], [{ id: "acct_new" }]);
    stripeAccounts.createOnboardingLink.mockRejectedValue(new Stripe.errors.StripeConnectionError({ message: "socket hang up" }));
    expect(await startSelling(null, country("RO"))).toEqual({ ok: false, error: "Stripe did not answer. Try again in a moment." });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/sales");
  });

  it("tells a seller Stripe refused, instead of asking them to retry", async () => {
    results.push([]);
    stripeAccounts.createSellerAccount.mockRejectedValue(refused());
    expect(await startSelling(null, country("RO"))).toEqual({
      ok: false,
      error: expect.stringMatching(/^Stripe could not set up your account\. If this happens again, write to us at /),
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("openStripeDashboard", () => {
  it("signs a ready seller in to the Express Dashboard", async () => {
    results.push([{ stripeAccountId: "acct_1", ready: true }]);
    await expect(openStripeDashboard()).rejects.toThrow("NEXT_REDIRECT https://connect.stripe.com/express/acct_x/login");
    expect(stripeAccounts.createDashboardLink).toHaveBeenCalledWith(STRIPE, "acct_1");
  });

  it("refuses a seller Stripe has not accepted, and a user with no seller account", async () => {
    results.push([{ stripeAccountId: "acct_1", ready: false }], []);
    expect(await openStripeDashboard()).toEqual({ ok: false, error: "Finish setting up selling first." });
    expect(await openStripeDashboard()).toEqual({ ok: false, error: "Finish setting up selling first." });
    expect(stripeAccounts.createDashboardLink).not.toHaveBeenCalled();
  });
});

describe("setSkillPrice", () => {
  it("refuses an id that cannot be a skill, and works only while selling is on", async () => {
    expect(await setSkillPrice("not-a-uuid", null, price("9"))).toEqual(NOT_FOUND);
    getStripe.mockReturnValue(null);
    expect(await setSkillPrice(SKILL, null, price("9"))).toEqual({ ok: false, error: "Selling is not available on this site yet." });
    expect(calls).toEqual([]);
  });

  it("prices only for a seller Stripe has accepted", async () => {
    sellerState.mockResolvedValue("not-ready");
    expect(await setSkillPrice(SKILL, null, price("9"))).toEqual({ ok: false, error: "Set up selling before you price a skill." });
    expect(valuesOf("set")).toEqual([]);
  });

  it("refuses a price outside the range before touching the database", async () => {
    sellerState.mockResolvedValue("ready");
    expect(await setSkillPrice(SKILL, null, price("0.50"))).toEqual({ ok: false, error: "Set a price from €1.00 to €1,000.00." });
    expect(sellerState).not.toHaveBeenCalled();
  });

  it("writes the price only to the user's own skill that is not removed", async () => {
    sellerState.mockResolvedValue("ready");
    results.push([{ id: SKILL }]);
    expect(await setSkillPrice(SKILL, null, price("9.99"))).toEqual({ ok: true, message: "Priced at €9.99." });
    expect(valuesOf("set")).toEqual([{ priceCents: 999, currency: "eur" }]);
    expect(wheres()).toEqual([
      { sql: '("skill"."id" = $1 and "skill"."owner_id" = $2 and "skill"."status" <> $3)', params: [SKILL, "user-b", "removed"], typings: expect.anything() },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith(`/dashboard/skills/${SKILL}`);
  });

  it("answers a replay with someone else's skill as if it did not exist", async () => {
    sellerState.mockResolvedValue("ready");
    results.push([]);
    expect(await setSkillPrice(SKILL, null, price("9"))).toEqual(NOT_FOUND);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("removeSkillPrice", () => {
  it("clears both columns of the user's own skill, removed or not", async () => {
    results.push([{ id: SKILL }]);
    expect(await removeSkillPrice(SKILL)).toEqual({ ok: true, message: "The skill has no price." });
    expect(valuesOf("set")).toEqual([{ priceCents: null, currency: null }]);
    expect(wheres()[0]).toMatchObject({ sql: '("skill"."id" = $1 and "skill"."owner_id" = $2)', params: [SKILL, "user-b"] });
  });

  it("answers a replay with someone else's skill as if it did not exist", async () => {
    results.push([]);
    expect(await removeSkillPrice(SKILL)).toEqual(NOT_FOUND);
  });
});
