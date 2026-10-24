import "server-only";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { sellerAccount } from "@/lib/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { errorCode, getStripe } from "@/lib/stripe";
import { transfersStatus, type TransfersStatus } from "./stripe-accounts";

export interface Seller {
  country: string;
  ready: boolean;
  /** Where the account stands with Stripe; "unknown" when Stripe could not be asked. */
  status: TransfersStatus | "unknown";
}

/**
 * The user's seller account, or null before they start selling. One that is not ready yet is read
 * again from Stripe, within a limit per user, since Stripe finishes its checks in its own time, and
 * marked ready once Stripe lets it receive transfers. A ready one is not asked again.
 */
export const getSeller = cache(async (userId: string): Promise<Seller | null> => {
  const [row] = await db
    .select({ stripeAccountId: sellerAccount.stripeAccountId, ready: sellerAccount.ready, country: sellerAccount.country })
    .from(sellerAccount)
    .where(eq(sellerAccount.userId, userId));
  if (!row) return null;
  if (row.ready) return { country: row.country, ready: true, status: "active" };
  const unknown = { country: row.country, ready: false, status: "unknown" } as const;
  const stripe = getStripe();
  if (!stripe || (await rateLimit("seller-status", userId)) !== "ok") return unknown;
  try {
    const status = await transfersStatus(stripe, row.stripeAccountId);
    if (status === "active") {
      await db.update(sellerAccount).set({ ready: true, updatedAt: new Date() }).where(eq(sellerAccount.userId, userId));
    }
    return { country: row.country, ready: status === "active", status };
  } catch (error) {
    console.error("Stripe account check failed:", errorCode(error));
    return unknown;
  }
});

/** Whether the user has a seller account, and whether Stripe has accepted it, as last read. */
export async function sellerState(userId: string): Promise<"none" | "not-ready" | "ready"> {
  const [row] = await db.select({ ready: sellerAccount.ready }).from(sellerAccount).where(eq(sellerAccount.userId, userId));
  return !row ? "none" : row.ready ? "ready" : "not-ready";
}

/** The user's seller account for /api/me/export, or null. */
export async function getSellerExport(userId: string) {
  const [row] = await db
    .select({
      stripeAccountId: sellerAccount.stripeAccountId,
      country: sellerAccount.country,
      ready: sellerAccount.ready,
      createdAt: sellerAccount.createdAt,
      updatedAt: sellerAccount.updatedAt,
    })
    .from(sellerAccount)
    .where(eq(sellerAccount.userId, userId));
  return row ?? null;
}
