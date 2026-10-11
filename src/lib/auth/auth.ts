import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { existingAccountEmail, resetPasswordEmail, sendEmail, verificationEmail } from "@/lib/email";
import { isSignUpAllowed } from "./allowlist";
import { cleanProfile } from "./profile";

// Exact hosts from Vercel's system variables, so every preview URL works without BETTER_AUTH_URL.
// Never a wildcard: "*.vercel.app" would trust every Vercel deployment as an origin.
const onVercel = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
const allowedHosts = onVercel
  ? [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL].filter(
      (host): host is string => Boolean(host),
    )
  : ["localhost:3000"];

export const auth = betterAuth({
  baseURL: { allowedHosts, protocol: onVercel ? "https" : "http" },
  database: drizzleAdapter(db, { provider: "pg", transaction: true }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      sendEmail(resetPasswordEmail(user.email, url));
    },
    onExistingUserSignUp: async ({ user }) => {
      sendEmail(existingAccountEmail(user.email));
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      sendEmail(verificationEmail(user.email, url));
    },
  },
  // Reset and verification tokens are stored hashed: previews copy the production database.
  verification: { storeIdentifier: "hashed" },
  rateLimit: {
    storage: "database",
  },
  // Unexpected errors reach the route handler, which logs them without their query parameters.
  onAPIError: { throw: true },
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
          return { data: cleanProfile(user) };
        },
      },
      update: {
        before: async (user) => ({ data: cleanProfile(user) }),
      },
    },
  },
  // Must stay last: it applies cookies set by auth.api calls inside Server Actions.
  plugins: [nextCookies()],
});
