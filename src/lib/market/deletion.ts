import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sellerAccount } from "@/lib/db/schema";

// No "server-only": the auth config calls this, and the Better Auth CLI loads that config in plain Node.

/**
 * Closes the Stripe account of a user whose own account is being deleted; their seller_account row
 * goes with them. Nothing here may keep anyone from deleting their account, so it never throws: a
 * failure is logged with the Stripe account's id, for the operator to close it by hand.
 */
export async function closeStripeAccountOf(userId: string): Promise<void> {
  let accountId = "unknown account";
  try {
    const [row] = await db.select({ id: sellerAccount.stripeAccountId }).from(sellerAccount).where(eq(sellerAccount.userId, userId));
    if (!row) return;
    accountId = row.id;
    // Loaded only for a seller: every route that loads the auth config would pay for the SDK otherwise.
    const [{ getStripe }, { closeSellerAccount }] = await Promise.all([import("@/lib/stripe"), import("./stripe-accounts")]);
    const stripe = getStripe();
    if (!stripe) throw new Error("No Stripe key");
    // One try within a few seconds: the deletion waits for it.
    await closeSellerAccount(stripe, row.id, { maxNetworkRetries: 0, timeout: 5_000 });
  } catch (error) {
    const code = (error as { code?: unknown } | null)?.code;
    console.error("Stripe account not closed:", accountId, typeof code === "string" ? code : error instanceof Error ? error.name : "unknown error");
  }
}
