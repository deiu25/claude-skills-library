import Stripe from "stripe";

// Every call uses Accounts v2 and falls back to v1, with the same settings, on a platform that
// Stripe has not given v2. No "server-only": the auth config closes accounts on deletion.

/** Stripe's answer to a v2 call from a platform without v2 access. */
const V2_BLOCKED = "accounts_v2_access_blocked";

const v2Blocked = (error: unknown) => error instanceof Stripe.errors.StripeError && error.code === V2_BLOCKED;

/** Whether Stripe lets an account receive transfers, which is how a sale pays its seller. */
export type TransfersStatus = "active" | "pending" | "restricted" | "rejected" | "unsupported";

const STATUSES = new Set<string>(["active", "pending", "restricted", "rejected", "unsupported"]);

export interface NewSeller {
  userId: string;
  email: string;
  name: string;
  country: string;
}

/**
 * Opens the Stripe account a seller is paid into: the Express Dashboard, the platform collecting
 * fees and covering losses, as destination charges need, and the recipient configuration, which
 * only receives transfers. Keyed per user and country, so a repeated request opens no second one.
 */
export async function createSellerAccount(stripe: Stripe, seller: NewSeller): Promise<string> {
  const idempotencyKey = `seller-account:${seller.userId}:${seller.country}`;
  try {
    const account = await stripe.v2.core.accounts.create(
      {
        contact_email: seller.email,
        display_name: seller.name,
        dashboard: "express",
        identity: { country: seller.country },
        defaults: { responsibilities: { fees_collector: "application", losses_collector: "application" } },
        configuration: { recipient: { capabilities: { stripe_balance: { stripe_transfers: { requested: true } } } } },
        metadata: { user_id: seller.userId },
      },
      { idempotencyKey },
    );
    return account.id;
  } catch (error) {
    if (!v2Blocked(error)) throw error;
  }
  const account = await stripe.accounts.create(
    {
      country: seller.country,
      email: seller.email,
      controller: {
        fees: { payer: "application" },
        losses: { payments: "application" },
        requirement_collection: "stripe",
        stripe_dashboard: { type: "express" },
      },
      capabilities: { transfers: { requested: true } },
      metadata: { user_id: seller.userId },
    },
    { idempotencyKey: `${idempotencyKey}:v1` },
  );
  return account.id;
}

/**
 * The single-use address of Stripe's onboarding form for an account, which expires within minutes.
 * Stripe sends the seller back to the sales page, or to its refresh address for a new link.
 */
export async function createOnboardingLink(stripe: Stripe, accountId: string, origin: string): Promise<string> {
  const urls = { refresh: `${origin}/dashboard/sales/refresh`, return: `${origin}/dashboard/sales` };
  try {
    // API 2026-09-30.endive dropped `configurations` here: the link onboards the account's own.
    const link = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: { type: "account_onboarding", account_onboarding: { refresh_url: urls.refresh, return_url: urls.return } },
    });
    return link.url;
  } catch (error) {
    if (!v2Blocked(error)) throw error;
  }
  const link = await stripe.accountLinks.create({ account: accountId, type: "account_onboarding", refresh_url: urls.refresh, return_url: urls.return });
  return link.url;
}

/** Where an account stands with Stripe on receiving transfers. Only "active" can be paid. */
export async function transfersStatus(stripe: Stripe, accountId: string): Promise<TransfersStatus> {
  let status: string | undefined;
  try {
    const account = await stripe.v2.core.accounts.retrieve(accountId, { include: ["configuration.recipient"] });
    status = account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status;
  } catch (error) {
    if (!v2Blocked(error)) throw error;
    const account = await stripe.accounts.retrieve(accountId);
    // v1 names a capability "active", "pending" or "inactive".
    status = account.capabilities?.transfers === "inactive" ? "restricted" : account.capabilities?.transfers;
  }
  return status && STATUSES.has(status) ? (status as TransfersStatus) : "restricted";
}

/** A single-use sign-in to the account's Express Dashboard, the only way in for a test-mode account. */
export async function createDashboardLink(stripe: Stripe, accountId: string): Promise<string> {
  return (await stripe.accounts.createLoginLink(accountId)).url;
}

/** Closes an account for good, as deleting the seller's own account does. */
export async function closeSellerAccount(stripe: Stripe, accountId: string, options?: Stripe.RequestOptions): Promise<void> {
  try {
    await stripe.v2.core.accounts.close(accountId, { applied_configurations: ["recipient"] }, options);
    return;
  } catch (error) {
    if (!v2Blocked(error)) throw error;
  }
  await stripe.accounts.del(accountId, undefined, options);
}
