import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sellerAccount } from "@/lib/db/schema";
import { getStripe, stripeCode } from "@/lib/stripe";
import { closeSellerAccount } from "./stripe-accounts";

// No "server-only": the auth config calls this, and the Better Auth CLI loads that config in plain Node.

/**
 * Closes the Stripe account of a user whose own account is being deleted; their seller_account row
 * goes with them. A Stripe outage must not keep anyone from deleting their account, so a failure is
 * logged with the Stripe account's id, for the operator to close it by hand.
 */
export async function closeStripeAccountOf(userId: string): Promise<void> {
  const [row] = await db.select({ stripeAccountId: sellerAccount.stripeAccountId }).from(sellerAccount).where(eq(sellerAccount.userId, userId));
  if (!row) return;
  const stripe = getStripe();
  try {
    if (!stripe) throw new Error("No Stripe key");
    // One try within a few seconds: the deletion waits for it.
    await closeSellerAccount(stripe, row.stripeAccountId, { maxNetworkRetries: 0, timeout: 5_000 });
  } catch (error) {
    console.error("Stripe account not closed:", row.stripeAccountId, stripeCode(error));
  }
}
