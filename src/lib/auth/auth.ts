import { randomBytes } from "node:crypto";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor, username, USERNAME_ERROR_CODES } from "better-auth/plugins";
import { and, eq, like, or } from "drizzle-orm";
import { revalidateCommunity } from "@/lib/community/revalidate";
import { db } from "@/lib/db";
import { closeStripeAccountOf } from "@/lib/market/deletion";
import { account, skill, user as userTable, verification } from "@/lib/db/schema";
import {
  changeEmailConfirmationEmail,
  deleteAccountEmail,
  newEmailAddressEmail,
  passkeyAddedEmail,
  passwordLinkEmail,
  sendEmail,
} from "@/lib/email";
import { SITE_NAME } from "@/lib/site";
import { adminUserIds } from "./admin";
import { isSignUpAllowed } from "./allowlist";
import { generateBackupCodes } from "./backup-codes";
import { githubCredentials } from "./github";
import { allowedHosts, onVercel } from "./hosts";
import { requirePasskeyUserVerification } from "./passkey";
import { cleanProfile } from "./profile";
import { isValidUsername } from "./username";
import { holdUsername, isUsernameHeld } from "./username-hold";

const github = githubCredentials();

/** The profile fields of a sign-up or update, cleaned; a name that cleans down to nothing is refused. */
function cleanedProfile(input: Parameters<typeof cleanProfile>[0]) {
  const profile = cleanProfile(input);
  if (profile.name === "") {
    throw new APIError("BAD_REQUEST", { code: "NAME_REQUIRED", message: "Enter your name." });
  }
  return profile;
}

const passkeyNotVerified = () =>
  new APIError("BAD_REQUEST", {
    code: "PASSKEY_NOT_USER_VERIFIED",
    message: "This passkey did not check that it is you.",
  });

// The username plugin's own error for a taken name, so a held name answers like one in use.
const usernameTaken = () => APIError.from("BAD_REQUEST", USERNAME_ERROR_CODES.USERNAME_IS_ALREADY_TAKEN);

export const auth = betterAuth({
  appName: SITE_NAME,
  baseURL: { allowedHosts, protocol: onVercel ? "https" : "http" },
  database: drizzleAdapter(db, { provider: "pg", transaction: true }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    // Also how a new account is finished: sign-up sends this link instead of a verification link.
    sendResetPassword: async ({ user, url }) => {
      sendEmail(passwordLinkEmail(user, url));
    },
    // Choosing a password from the emailed link proves the address.
    onPasswordReset: async ({ user }) => {
      if (!user.emailVerified) {
        await db.update(userTable).set({ emailVerified: true }).where(eq(userTable.id, user.id));
      }
    },
  },
  emailVerification: {
    // Verification links reach only the new address of an email change (user.changeEmail).
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
    // The link lands on the settings page once the change is done.
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set("callbackURL", "/dashboard/settings");
      sendEmail(newEmailAddressEmail(user.email, link.href));
    },
    // A password set before the address was proven may be someone else's, so it never survives
    // a verification link. Runs only for a user whose address is not yet confirmed.
    beforeEmailVerification: async (user) => {
      await db.delete(account).where(and(eq(account.userId, user.id), eq(account.providerId, "credential")));
    },
  },
  socialProviders: github ? { github } : {},
  account: {
    // GitHub access tokens are stored encrypted with BETTER_AUTH_SECRET.
    encryptOAuthTokens: true,
    // A GitHub sign-in never attaches itself to an existing account by email, which would skip
    // two-factor for anyone controlling the mailbox. Connecting GitHub happens in the settings.
    accountLinking: { disableImplicitLinking: true },
  },
  // Adding a passkey or disconnecting GitHub needs a sign-in from the last 5 minutes.
  session: { freshAge: 60 * 5 },
  user: {
    additionalFields: { bio: { type: "string", required: false } },
    changeEmail: {
      enabled: true,
      // The current address confirms on a page, with a button: a link scanner that opens every
      // URL in an email must not approve the change on its own.
      sendChangeEmailConfirmation: async ({ user, newEmail, url, token }) => {
        const confirmURL = new URL("/confirm-email-change", url);
        confirmURL.searchParams.set("token", token);
        sendEmail(changeEmailConfirmationEmail(user.email, newEmail, confirmURL.href));
      },
    },
    deleteUser: {
      enabled: true,
      // The link opens a page that asks once more, signed in, before anything is deleted.
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        const confirmURL = new URL("/dashboard/delete-account", url);
        confirmURL.searchParams.set("token", token);
        sendEmail(deleteAccountEmail(user.email, confirmURL.href));
      },
      // Skills reference their owner with ON DELETE SET NULL, so that a sold one can outlive its
      // author. Until anything can be bought, deleting an account deletes all of its skills.
      // Its username stays held, so the addresses of what it published pass to nobody else, and
      // the Stripe account it sold through is closed.
      beforeDelete: async (user) => {
        const { username } = user as typeof user & { username?: string | null };
        if (username) await holdUsername(username, user.id);
        await db.delete(skill).where(eq(skill.ownerId, user.id));
        await closeStripeAccountOf(user.id);
        revalidateCommunity();
      },
      // Sessions, accounts, passkeys and two-factor rows go with the user; email links and
      // passkey challenges, which hold the id as a value or inside JSON, would not.
      afterDelete: async (user) => {
        await db
          .delete(verification)
          .where(or(eq(verification.value, user.id), like(verification.value, `%"id":"${user.id}"%`)));
      },
    },
    // An unverified GitHub email may belong to someone else, and the allowlist would admit it.
    // Runs before a GitHub user is created or linked, and on every GitHub sign-in.
    validateUserInfo: ({ user, source }) => {
      if (source.oauth && !user.emailVerified) {
        return { error: "email_not_verified", errorDescription: "Verify your email address on GitHub first." };
      }
    },
  },
  // Reset and verification tokens are stored hashed: previews copy the production database.
  verification: { storeIdentifier: "hashed" },
  rateLimit: {
    storage: "database",
    customRules: {
      // Each of these sends an email to the account's own address.
      "/delete-user": { window: 60, max: 3 },
      "/change-email": { window: 60, max: 3 },
      // A profile change marks every Community page stale.
      "/update-user": { window: 60, max: 10 },
    },
  },
  // Usernames are handles, never a sign-in name, and the settings form checks one on save, where a
  // held name is refused too. Verification links go out only from the email change flow, never on
  // request. The rest return tokens or keys the pages never need: the settings page reads sessions
  // and passkeys on the server and revokes sessions by id. Moderation runs through Server Actions
  // on /dashboard/admin, so no admin endpoint answers over HTTP.
  disabledPaths: [
    "/sign-in/username",
    "/is-username-available",
    "/send-verification-email",
    "/list-sessions",
    "/revoke-session",
    "/revoke-sessions",
    "/revoke-other-sessions",
    "/get-access-token",
    "/refresh-token",
    "/passkey/list-user-passkeys",
    "/admin/set-role",
    "/admin/get-user",
    "/admin/create-user",
    "/admin/update-user",
    "/admin/list-users",
    "/admin/list-user-sessions",
    "/admin/unban-user",
    "/admin/ban-user",
    "/admin/impersonate-user",
    "/admin/stop-impersonating",
    "/admin/revoke-user-session",
    "/admin/revoke-user-sessions",
    "/admin/remove-user",
    "/admin/set-user-password",
    "/admin/has-permission",
  ],
  // Unexpected errors reach the route handler, which logs them without their query parameters.
  // A failed GitHub sign-in lands on /sign-in?error=<code>, which the page turns into a message.
  onAPIError: { throw: true, errorURL: "/sign-in" },
  hooks: {
    // Sign-up stores the server's own random password, whatever the request sent: nobody ever
    // knows it, and the account's real password is chosen from the emailed link. It refuses a
    // username, which is chosen in the settings, and an empty name here, before Better Auth answers
    // a taken address alike: a refusal after that point would tell the two apart.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      if (ctx.body?.username !== undefined) {
        throw new APIError("BAD_REQUEST", { code: "USERNAME_AT_SIGN_UP", message: "Choose a username in your settings once the account exists." });
      }
      cleanedProfile({ name: ctx.body?.name });
      return { context: { body: { ...ctx.body, password: randomBytes(32).toString("base64url") } } };
    }),
    after: requirePasskeyUserVerification,
  },
  databaseHooks: {
    user: {
      create: {
        // Runs for every sign-up method. A 403 here would turn into Better Auth's generic
        // "check your inbox" response, so the refusal is a 400 the form can show.
        before: async (user) => {
          if (!isSignUpAllowed(user.email)) {
            throw new APIError("BAD_REQUEST", {
              code: "SIGN_UP_CLOSED",
              message: "Sign-up is invite-only for now.",
            });
          }
          // No role is stored: admins are the ids in ADMIN_USER_IDS. Better Auth's generic answer
          // to a sign-up with a taken address shows no role either, so the two answers stay alike.
          return { data: { ...cleanedProfile(user), role: null } };
        },
      },
      update: {
        before: async (user, ctx) => {
          // Published skills' addresses start with the username: once chosen, it can change but
          // not go back to none.
          if (user.username === null || user.username === "") {
            throw new APIError("BAD_REQUEST", { code: "USERNAME_REQUIRED", message: "A username, once chosen, can change but not be removed." });
          }
          // A rename gives up the old username into a hold, and a name another account gave up
          // within its hold cannot be taken. Usernames change only through /update-user, which
          // runs as the account's own session.
          const current = ctx?.context.session?.user;
          if (typeof user.username === "string" && current && user.username !== current.username) {
            if (await isUsernameHeld(user.username, current.id)) throw usernameTaken();
            if (current.username) await holdUsername(current.username, current.id);
          }
          return { data: cleanedProfile(user) };
        },
        // Community pages show an author's username and bio. A change to either marks them all
        // stale, which costs one render of each page visited afterwards; other updates leave them.
        after: async (_user, ctx) => {
          const body = ctx?.body as Record<string, unknown> | undefined;
          if (body && ("username" in body || "bio" in body)) revalidateCommunity();
        },
      },
    },
  },
  plugins: [
    username({
      displayUsername: false,
      usernameValidator: isValidUsername,
      validationOrder: { username: "post-normalization" },
    }),
    // Challenges password sign-ins only: GitHub and passkeys verify the user their own way.
    // allowPasswordless lets an account without a password turn it on before it adds one.
    twoFactor({ allowPasswordless: true, backupCodeOptions: { customBackupCodesGenerate: generateBackupCodes } }),
    // No rpID or origin: both follow the request's host, which the auth hosts above limit.
    // A passkey stands in for the password and two-factor at once, so it must check the person,
    // with a fingerprint, face or device PIN, not only hold the device.
    passkey({
      authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
      registration: {
        afterVerification: async ({ ctx, verification }) => {
          if (!verification.registrationInfo?.userVerified) throw passkeyNotVerified();
          const email = ctx.context.session?.user.email;
          if (email) sendEmail(passkeyAddedEmail(email));
        },
      },
      authentication: {
        afterVerification: async ({ verification }) => {
          if (!verification.authenticationInfo.userVerified) throw passkeyNotVerified();
        },
      },
    }),
    // A suspended account cannot start a session by any sign-in method, and suspending one ends
    // its sessions. The forms show their own text for BANNED_USER.
    admin({ adminUserIds: adminUserIds(), bannedUserMessage: "This account is suspended." }),
    // Must stay last: it applies cookies set by auth.api calls inside Server Actions.
    nextCookies(),
  ],
});
