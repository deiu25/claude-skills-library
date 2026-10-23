import "server-only";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimit, session, user, usernameHold, verification } from "@/lib/db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

/** How long a new account may wait for its address to be confirmed. */
const UNCONFIRMED_DAYS = 7;

/**
 * Deletes what Better Auth leaves behind: sessions and email links past their expiry, rate-limit
 * counters untouched for a day, and username holds that have ended. Safe to run twice: each delete
 * only removes more.
 */
export async function deleteExpiredAuthRows(now = new Date()) {
  const [sessions, verifications, rateLimits, usernameHolds] = await Promise.all([
    db.delete(session).where(lt(session.expiresAt, now)),
    db.delete(verification).where(lt(verification.expiresAt, now)),
    db.delete(rateLimit).where(lt(rateLimit.lastRequest, now.getTime() - DAY_MS)),
    db.delete(usernameHold).where(lt(usernameHold.heldUntil, now)),
  ]);
  return {
    sessions: sessions.rowCount ?? 0,
    verifications: verifications.rowCount ?? 0,
    rateLimits: rateLimits.rowCount ?? 0,
    usernameHolds: usernameHolds.rowCount ?? 0,
  };
}

/**
 * Deletes accounts whose address was not confirmed within a week of sign-up: until then a
 * stranger's sign-up holds the address and any username it set. Such an account never signed in,
 * so it owns no skills; its sessions and sign-in methods go with it, and its emailed link has
 * long expired.
 */
export async function deleteUnconfirmedAccounts(now = new Date()) {
  const result = await db
    .delete(user)
    .where(and(eq(user.emailVerified, false), lt(user.createdAt, new Date(now.getTime() - UNCONFIRMED_DAYS * DAY_MS))));
  return result.rowCount ?? 0;
}
