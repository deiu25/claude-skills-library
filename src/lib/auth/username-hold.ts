import { and, desc, eq, gt, isNull, ne, notInArray, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { usernameHold } from "@/lib/db/schema";

// No server-only here: auth.ts imports this, and the Better Auth CLI loads auth.ts in plain Node.

/** How long a username given up by a rename or an account deletion stays out of anyone else's reach. */
export const USERNAME_HOLD_DAYS = 90;

/** How many given-up usernames one account holds at once: renaming in a loop cannot park names without end. */
export const HOLDS_PER_ACCOUNT = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export const holdEnds = (now: Date) => new Date(now.getTime() + USERNAME_HOLD_DAYS * DAY_MS);

/**
 * Whether `username` is held from the account `userId`: given up within the hold by any other
 * account, or by one since deleted. With a null `userId`, as at sign-up, every hold counts.
 */
export async function isUsernameHeld(username: string, userId: string | null, now = new Date()): Promise<boolean> {
  const [held] = await db
    .select({ username: usernameHold.username })
    .from(usernameHold)
    .where(
      and(
        eq(usernameHold.username, username),
        gt(usernameHold.heldUntil, now),
        userId === null ? undefined : or(isNull(usernameHold.userId), ne(usernameHold.userId, userId)),
      ),
    )
    .limit(1);
  return Boolean(held);
}

/**
 * Holds `username` for the account that gives it up, which alone may take it back until the hold
 * ends, and releases that account's holds beyond its newest HOLDS_PER_ACCOUNT.
 */
export async function holdUsername(username: string, userId: string, now = new Date()) {
  const heldUntil = holdEnds(now);
  await db
    .insert(usernameHold)
    .values({ username, userId, heldUntil })
    .onConflictDoUpdate({ target: usernameHold.username, set: { userId, heldUntil } });
  const newest = db
    .select({ username: usernameHold.username })
    .from(usernameHold)
    .where(eq(usernameHold.userId, userId))
    .orderBy(desc(usernameHold.heldUntil))
    .limit(HOLDS_PER_ACCOUNT);
  await db.delete(usernameHold).where(and(eq(usernameHold.userId, userId), notInArray(usernameHold.username, newest)));
}
