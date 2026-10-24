import Stripe from "stripe";

// No "server-only": the auth config closes a deleted account's Stripe account, and the Better Auth
// CLI loads that config in plain Node. Nothing in the browser imports this file.

/** A test-mode key. Live keys arrive only when payments go live (ROADMAP.md, merge rule 6). */
export const isTestKey = (key: string) => /^(sk|rk)_test_/.test(key);

let cached: { key: string; client: Stripe } | null = null;

/**
 * The Stripe client, made on first use so a build needs no key. Null when selling is not set up
 * here: no `STRIPE_SECRET_KEY`, or one that is not a test-mode key.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!isTestKey(key)) {
    console.error("Selling is off: STRIPE_SECRET_KEY is not a test-mode key.");
    return null;
  }
  // A Server Action waits for Stripe, so a slow request fails in seconds, not after the SDK's 80.
  if (cached?.key !== key) cached = { key, client: new Stripe(key, { maxNetworkRetries: 2, timeout: 10_000, telemetry: false }) };
  return cached.client;
}

/** Whether selling can be set up here: a Stripe test key is configured. */
export const isSellingAvailable = () => getStripe() !== null;

/** A Stripe error's code for the log, never its message, which can quote what was sent. */
export function stripeCode(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError) return error.code ?? error.type;
  return error instanceof Error ? error.name : "unknown error";
}
