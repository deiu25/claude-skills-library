import "server-only";
import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimit, session, verification } from "@/lib/db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes what Better Auth leaves behind: sessions and email links past their expiry, and
 * rate-limit counters untouched for a day. Safe to run twice: each delete only removes more.
 */
export async function deleteExpiredAuthRows(now = new Date()) {
  const [sessions, verifications, rateLimits] = await Promise.all([
    db.delete(session).where(lt(session.expiresAt, now)),
    db.delete(verification).where(lt(verification.expiresAt, now)),
    db.delete(rateLimit).where(lt(rateLimit.lastRequest, now.getTime() - DAY_MS)),
  ]);
  return {
    sessions: sessions.rowCount ?? 0,
    verifications: verifications.rowCount ?? 0,
    rateLimits: rateLimits.rowCount ?? 0,
  };
}
