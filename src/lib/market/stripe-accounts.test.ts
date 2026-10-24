import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import {
  closeSellerAccount,
  createDashboardLink,
  createOnboardingLink,
  createSellerAccount,
  transfersStatus,
} from "./stripe-accounts";

const blocked = () =>
  new Stripe.errors.StripeInvalidRequestError({
    type: "invalid_request_error",
    code: "accounts_v2_access_blocked",
    message: "Accounts v2 is not enabled for your merchant.",
  });

/** A Stripe client whose v2 calls answer with `v2` (a value, or an error to throw) and whose v1 calls answer `v1`. */
function fakeStripe({ v2, v1 }: { v2?: unknown; v1?: unknown }) {
  const answer = (value: unknown) => vi.fn(async () => {
    if (value instanceof Error) throw value;
    return value;
  });
  return {
    v2: {
      core: {
        accounts: { create: answer(v2), retrieve: answer(v2), close: answer(v2) },
        accountLinks: { create: answer(v2) },
      },
    },
    accounts: { create: answer(v1), retrieve: answer(v1), del: answer(v1), createLoginLink: answer(v1) },
    accountLinks: { create: answer(v1) },
  };
}

const asStripe = (fake: ReturnType<typeof fakeStripe>) => fake as unknown as Stripe;

const seller = { userId: "user-1", email: "seller@example.com", name: "Seller", country: "RO" };

describe("createSellerAccount", () => {
  it("opens an Express recipient account with Accounts v2, the platform covering fees and losses", async () => {
    const stripe = fakeStripe({ v2: { id: "acct_v2" } });
    expect(await createSellerAccount(asStripe(stripe), seller)).toBe("acct_v2");
    expect(stripe.v2.core.accounts.create).toHaveBeenCalledWith(
      {
        contact_email: "seller@example.com",
        display_name: "Seller",
        dashboard: "express",
        identity: { country: "RO" },
        defaults: { responsibilities: { fees_collector: "application", losses_collector: "application" } },
        configuration: { recipient: { capabilities: { stripe_balance: { stripe_transfers: { requested: true } } } } },
        metadata: { user_id: "user-1" },
      },
      { idempotencyKey: "seller-account:user-1:RO" },
    );
    expect(stripe.accounts.create).not.toHaveBeenCalled();
  });

  it("falls back to v1 controller settings when the platform has no v2 access", async () => {
    const stripe = fakeStripe({ v2: blocked(), v1: { id: "acct_v1" } });
    expect(await createSellerAccount(asStripe(stripe), seller)).toBe("acct_v1");
    expect(stripe.accounts.create).toHaveBeenCalledWith(
      {
        country: "RO",
        email: "seller@example.com",
        controller: {
          fees: { payer: "application" },
          losses: { payments: "application" },
          requirement_collection: "stripe",
          stripe_dashboard: { type: "express" },
        },
        capabilities: { transfers: { requested: true } },
        metadata: { user_id: "user-1" },
      },
      { idempotencyKey: "seller-account:user-1:RO:v1" },
    );
  });

  it("passes any other error on, without trying v1", async () => {
    const error = new Stripe.errors.StripeInvalidRequestError({ type: "invalid_request_error", code: "capability_not_available_in_country" });
    const stripe = fakeStripe({ v2: error, v1: { id: "acct_v1" } });
    await expect(createSellerAccount(asStripe(stripe), seller)).rejects.toBe(error);
    expect(stripe.accounts.create).not.toHaveBeenCalled();
  });
});

describe("createOnboardingLink", () => {
  const urls = { refresh: "https://example.test/dashboard/sales/refresh", return: "https://example.test/dashboard/sales" };

  it("asks v2 for an onboarding link that returns to the sales page", async () => {
    const stripe = fakeStripe({ v2: { url: "https://connect.stripe.com/v2" } });
    expect(await createOnboardingLink(asStripe(stripe), "acct_1", "https://example.test")).toBe("https://connect.stripe.com/v2");
    expect(stripe.v2.core.accountLinks.create).toHaveBeenCalledWith({
      account: "acct_1",
      use_case: { type: "account_onboarding", account_onboarding: { refresh_url: urls.refresh, return_url: urls.return } },
    });
  });

  it("falls back to a v1 account link", async () => {
    const stripe = fakeStripe({ v2: blocked(), v1: { url: "https://connect.stripe.com/v1" } });
    expect(await createOnboardingLink(asStripe(stripe), "acct_1", "https://example.test")).toBe("https://connect.stripe.com/v1");
    expect(stripe.accountLinks.create).toHaveBeenCalledWith({
      account: "acct_1",
      type: "account_onboarding",
      refresh_url: urls.refresh,
      return_url: urls.return,
    });
  });
});

describe("transfersStatus", () => {
  const v2Account = (status?: string, statusDetails: { code: string; resolution: string }[] = []) => ({
    configuration: {
      recipient: { capabilities: { stripe_balance: { stripe_transfers: status ? { status, status_details: statusDetails } : undefined } } },
    },
  });

  it("reports an account Stripe no longer has, or closed, as missing", async () => {
    const notFound = new Stripe.errors.StripeInvalidRequestError({ type: "invalid_request_error", code: "not_found", statusCode: 404 });
    expect(await transfersStatus(asStripe(fakeStripe({ v2: notFound })), "acct_1")).toBe("missing");
    expect(await transfersStatus(asStripe(fakeStripe({ v2: { closed: true, ...v2Account("active") } })), "acct_1")).toBe("missing");
    const invalid = new Stripe.errors.StripePermissionError({ type: "invalid_request_error", code: "account_invalid", statusCode: 403 });
    expect(await transfersStatus(asStripe(fakeStripe({ v2: blocked(), v1: invalid })), "acct_1")).toBe("missing");
  });

  it("passes any other Stripe failure on", async () => {
    const outage = new Stripe.errors.StripeAPIError({ type: "api_error", statusCode: 500 });
    await expect(transfersStatus(asStripe(fakeStripe({ v2: outage })), "acct_1")).rejects.toBe(outage);
  });

  it("counts restricted with nothing for the seller to do as pending, as right after onboarding", async () => {
    const verifying = v2Account("restricted", [{ code: "requirements_pending_verification", resolution: "no_resolution" }]);
    expect(await transfersStatus(asStripe(fakeStripe({ v2: verifying })), "acct_1")).toBe("pending");
    const missing = v2Account("restricted", [{ code: "requirements_past_due", resolution: "provide_info" }]);
    expect(await transfersStatus(asStripe(fakeStripe({ v2: missing })), "acct_1")).toBe("restricted");
  });

  it("counts a v1 account Stripe is still verifying as pending", async () => {
    const account = (requirements: object) => ({ capabilities: { transfers: "inactive" }, requirements });
    const verifying = account({ currently_due: [], pending_verification: ["individual.id_number"] });
    expect(await transfersStatus(asStripe(fakeStripe({ v2: blocked(), v1: verifying })), "acct_1")).toBe("pending");
    const missing = account({ currently_due: ["external_account"], pending_verification: [] });
    expect(await transfersStatus(asStripe(fakeStripe({ v2: blocked(), v1: missing })), "acct_1")).toBe("restricted");
  });

  it.each(["active", "pending", "restricted", "rejected", "unsupported"])("reads %s from the recipient configuration", async (status) => {
    const stripe = fakeStripe({ v2: v2Account(status) });
    expect(await transfersStatus(asStripe(stripe), "acct_1")).toBe(status);
    expect(stripe.v2.core.accounts.retrieve).toHaveBeenCalledWith("acct_1", { include: ["configuration.recipient"] });
  });

  it("counts a missing or unknown status as restricted, never as active", async () => {
    expect(await transfersStatus(asStripe(fakeStripe({ v2: v2Account() })), "acct_1")).toBe("restricted");
    expect(await transfersStatus(asStripe(fakeStripe({ v2: v2Account("something_new") })), "acct_1")).toBe("restricted");
    expect(await transfersStatus(asStripe(fakeStripe({ v2: {} })), "acct_1")).toBe("restricted");
  });

  it.each([
    ["active", "active"],
    ["pending", "pending"],
    ["inactive", "restricted"],
    [undefined, "restricted"],
  ])("maps the v1 transfers capability %s to %s", async (capability, status) => {
    const stripe = fakeStripe({ v2: blocked(), v1: { capabilities: capability ? { transfers: capability } : {} } });
    expect(await transfersStatus(asStripe(stripe), "acct_1")).toBe(status);
  });
});

describe("dashboard and closing", () => {
  it("signs in to the Express Dashboard through a v1 login link", async () => {
    const stripe = fakeStripe({ v1: { url: "https://connect.stripe.com/express/acct_1/abc" } });
    expect(await createDashboardLink(asStripe(stripe), "acct_1")).toBe("https://connect.stripe.com/express/acct_1/abc");
    expect(stripe.accounts.createLoginLink).toHaveBeenCalledWith("acct_1");
  });

  it("closes the account's recipient configuration with v2", async () => {
    const stripe = fakeStripe({ v2: {} });
    await closeSellerAccount(asStripe(stripe), "acct_1", { timeout: 5_000 });
    expect(stripe.v2.core.accounts.close).toHaveBeenCalledWith("acct_1", { applied_configurations: ["recipient"] }, { timeout: 5_000 });
    expect(stripe.accounts.del).not.toHaveBeenCalled();
  });

  it("deletes it with v1 when the platform has no v2 access", async () => {
    const stripe = fakeStripe({ v2: blocked(), v1: { deleted: true } });
    await closeSellerAccount(asStripe(stripe), "acct_1");
    expect(stripe.accounts.del).toHaveBeenCalledWith("acct_1", undefined, undefined);
  });
});
