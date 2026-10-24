import Stripe from "stripe";

// Every call uses Accounts v2 and falls back to v1, with the same settings, on a platform that
// Stripe has not given v2. No "server-only": the auth config closes accounts on deletion.

/** Stripe's answer to a v2 call from a platform without v2 access. */
const V2_BLOCKED = "accounts_v2_access_blocked";

const v2Blocked = (error: unknown) => error instanceof Stripe.errors.StripeError && error.code === V2_BLOCKED;

/** Stripe's answer for an account it does not have, such as one in another sandbox; v1 calls it account_invalid. */
const accountMissing = (error: unknown) =>
  error instanceof Stripe.errors.StripeError && (error.statusCode === 404 || error.code === "account_invalid");

/**
 * Whether Stripe lets an account receive transfers, which is how a sale pays its seller, or
 * "missing" when Stripe no longer has the account or closed it.
 */
export type TransfersStatus = "active" | "pending" | "restricted" | "rejected" | "unsupported" | "missing";

const STATUSES = new Set<string>(["active", "pending", "restricted", "rejected", "unsupported", "missing"]);

export interface NewSeller {
  userId: string;
  email: string;
  name: string;
  country: string;
}

/**
 * Opens the Stripe account a seller is paid into: the Express Dashboard, the platform collecting
 * fees and covering losses, as destination charges need, and the recipient configuration, which
 * only receives transfers. Keyed per user, country and UTC day, so a repeated request that day opens
 * no second one, while a seller whose account was reset can open a new one the next day: Accounts
 * v2 replays a key for 30 days, and would hand back the old account.
 */
export async function createSellerAccount(stripe: Stripe, seller: NewSeller): Promise<string> {
  const idempotencyKey = `seller-account:${seller.userId}:${seller.country}:${new Date().toISOString().slice(0, 10)}`;
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

async function v2Status(stripe: Stripe, accountId: string): Promise<string | undefined> {
  const account = await stripe.v2.core.accounts.retrieve(accountId, { include: ["configuration.recipient"] });
  if (account.closed) return "missing";
  const transfers = account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers;
  const waiting = Boolean(transfers?.status_details.length) && transfers?.status_details.every((detail) => detail.resolution === "no_resolution");
  return transfers?.status === "restricted" && waiting ? "pending" : transfers?.status;
}

async function v1Status(stripe: Stripe, accountId: string): Promise<string | undefined> {
  const account = await stripe.accounts.retrieve(accountId);
  // v1 names a capability "active", "pending" or "inactive".
  const waiting = !account.requirements?.currently_due?.length && Boolean(account.requirements?.pending_verification?.length);
  return account.capabilities?.transfers === "inactive" ? (waiting ? "pending" : "restricted") : account.capabilities?.transfers;
}

/**
 * Where an account stands with Stripe on receiving transfers. Only "active" can be paid. Right
 * after onboarding Stripe reports "restricted" while it verifies what was sent; with nothing left
 * for the seller to do, that counts as "pending".
 */
export async function transfersStatus(stripe: Stripe, accountId: string): Promise<TransfersStatus> {
  let status: string | undefined;
  try {
    status = await v2Status(stripe, accountId);
  } catch (error) {
    if (accountMissing(error)) return "missing";
    if (!v2Blocked(error)) throw error;
    try {
      status = await v1Status(stripe, accountId);
    } catch (fallbackError) {
      if (accountMissing(fallbackError)) return "missing";
      throw fallbackError;
    }
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
