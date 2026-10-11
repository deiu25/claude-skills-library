import { timingSafeEqual } from "node:crypto";

/**
 * Whether a request comes from Vercel Cron, which sends `Authorization: Bearer <CRON_SECRET>`.
 * Without the secret set, nothing passes, so an unconfigured job fails closed.
 */
export function isCronRequest(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || !authorization) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authorization);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
