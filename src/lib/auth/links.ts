/**
 * Where the emailed password link of a new account lands. Sign-up asks for no password: the
 * account's first password is chosen from this link, so no password exists before the address
 * is proven.
 */
export const NEW_ACCOUNT_PASSWORD_PATH = "/reset-password?new=1";

/** Whether a password link Better Auth built carries the sign-up landing page as its callback. */
export function isNewAccountLink(url: string): boolean {
  const callbackURL = new URL(url).searchParams.get("callbackURL");
  return callbackURL !== null && new URL(callbackURL, url).searchParams.get("new") === "1";
}
