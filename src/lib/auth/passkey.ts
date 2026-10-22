import { APIError, createAuthMiddleware } from "better-auth/api";

/**
 * @better-auth/passkey (1.7.x) asks for user verification only as "preferred" when signing in, so
 * some authenticators skip the PIN or biometric check that `authentication.afterVerification` then
 * refuses to do without. Rewriting the sign-in options to "required" makes them perform it.
 */
export const requirePasskeyUserVerification = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/passkey/generate-authenticate-options") return;
  const options = ctx.context.returned;
  if (options instanceof APIError || typeof options !== "object" || options === null) return;
  return ctx.json({ ...options, userVerification: "required" });
});
