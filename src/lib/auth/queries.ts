import "server-only";
import { and, asc, desc, eq, gt, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { account, passkey, session, user, usernameHold } from "@/lib/db/schema";

// Reads for the account settings page and the data export. Each one takes the signed-in user's id
// from the caller, which got it from requireUser(); none returns a token, hash or key.

export interface SignInMethods {
  hasPassword: boolean;
  /** The connected GitHub account's row, which unlinking needs, or null. */
  github: { id: string; connectedAt: Date } | null;
}

export async function getSignInMethods(userId: string): Promise<SignInMethods> {
  const rows = await db
    .select({ id: account.id, providerId: account.providerId, hasPassword: isNotNull(account.password), createdAt: account.createdAt })
    .from(account)
    .where(eq(account.userId, userId));
  const github = rows.find((row) => row.providerId === "github");
  return {
    hasPassword: rows.some((row) => row.providerId === "credential" && row.hasPassword),
    github: github ? { id: github.id, connectedAt: github.createdAt } : null,
  };
}

export interface ActiveSession {
  id: string;
  createdAt: Date;
  lastActiveAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

/** Sessions that still work, most recently used first: the 50 latest, far more than anyone keeps. */
export async function getActiveSessions(userId: string): Promise<ActiveSession[]> {
  return db
    .select({
      id: session.id,
      createdAt: session.createdAt,
      lastActiveAt: session.updatedAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    })
    .from(session)
    .where(and(eq(session.userId, userId), gt(session.expiresAt, new Date())))
    .orderBy(desc(session.updatedAt))
    .limit(50);
}

export interface PasskeySummary {
  id: string;
  name: string | null;
  createdAt: Date | null;
  backedUp: boolean;
}

export async function getPasskeys(userId: string): Promise<PasskeySummary[]> {
  return db
    .select({ id: passkey.id, name: passkey.name, createdAt: passkey.createdAt, backedUp: passkey.backedUp })
    .from(passkey)
    .where(eq(passkey.userId, userId))
    .orderBy(asc(passkey.createdAt));
}

/**
 * Everything the site keeps about a user, for /api/me/export. Secrets stay out: the password
 * hash, GitHub tokens, session tokens, the two-factor secret and backup codes, and passkey keys.
 */
export async function getAccountExport(userId: string) {
  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      username: user.username,
      bio: user.bio,
      image: user.image,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, userId));
  const [accounts, sessions, passkeys, reservedUsernames] = await Promise.all([
    db
      .select({
        provider: account.providerId,
        providerAccountId: account.accountId,
        scope: account.scope,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })
      .from(account)
      .where(eq(account.userId, userId)),
    db
      .select({
        createdAt: session.createdAt,
        lastActiveAt: session.updatedAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(eq(session.userId, userId)),
    db
      .select({
        name: passkey.name,
        deviceType: passkey.deviceType,
        backedUp: passkey.backedUp,
        transports: passkey.transports,
        createdAt: passkey.createdAt,
      })
      .from(passkey)
      .where(eq(passkey.userId, userId)),
    db
      .select({ username: usernameHold.username, heldUntil: usernameHold.heldUntil })
      .from(usernameHold)
      .where(eq(usernameHold.userId, userId)),
  ]);
  return { profile, signInMethods: accounts, sessions, passkeys, reservedUsernames };
}
