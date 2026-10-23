/** The error shape Better Auth's client returns: an HTTP status and, usually, a code. */
export interface AuthError {
  status: number;
  code?: string;
  message?: string;
}

const PASSKEY_CLOSED = "The passkey prompt closed before it finished. Try again.";
const USERNAME_LENGTH = "Use 3 to 30 characters.";

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Wrong email or password.",
  EMAIL_NOT_VERIFIED:
    "Finish creating your account first: open the link we emailed you, or use “Forgot your password?” to get a new one.",
  INVALID_TOKEN: "This link is invalid or has expired. Request a new one.",
  PASSWORD_TOO_SHORT: "Use a password of at least 8 characters.",
  PASSWORD_TOO_LONG: "Use a password of at most 128 characters.",
  SIGN_UP_CLOSED:
    "Sign-up is invite-only for now, and this email address is not on the list. If you were invited, use that address.",
  INVALID_PASSWORD: "Wrong password.",
  SESSION_NOT_FRESH: "This needs a sign-in from the last 5 minutes. Sign out, sign in again, then try once more.",
  NAME_REQUIRED: "Enter your name.",
  USERNAME_IS_ALREADY_TAKEN: "This username is taken. Choose another.",
  USERNAME_REQUIRED: "A username, once chosen, can change but not be removed.",
  USERNAME_TOO_SHORT: USERNAME_LENGTH,
  USERNAME_TOO_LONG: USERNAME_LENGTH,
  INVALID_USERNAME: "Use letters, digits and single hyphens, starting and ending with a letter or digit.",
  INVALID_CODE: "That code did not match. Enter the newest code from your authenticator app.",
  INVALID_BACKUP_CODE: "That backup code did not match, or it was already used.",
  INVALID_TWO_FACTOR_COOKIE: "This sign-in has expired. Sign in again.",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "Too many wrong codes for this sign-in. Sign in again.",
  ACCOUNT_TEMPORARILY_LOCKED: "Too many wrong codes. Wait 15 minutes, then try again.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "Add a password first, so you can still sign in without GitHub.",
  AUTH_CANCELLED: PASSKEY_CLOSED,
  ERROR_CEREMONY_ABORTED: PASSKEY_CLOSED,
  ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY: PASSKEY_CLOSED,
  ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED: "This device already holds a passkey for your account.",
  AUTHENTICATION_FAILED: "That passkey did not work. Try again, or sign in another way.",
  PASSKEY_NOT_FOUND: "That passkey belongs to no account here. Sign in another way.",
  PASSKEY_NOT_USER_VERIFIED:
    "This passkey did not check that it is you. Use one that asks for your fingerprint, face or device PIN.",
};

/** For a request that never got an answer. */
export const OFFLINE_MESSAGE = "Could not reach the server. Check your connection and try again.";

export function authErrorMessage(error: AuthError): string {
  // A two-factor lockout is a 429 as well, but it lasts 15 minutes, not one.
  if (error.status === 429 && error.code !== "ACCOUNT_TEMPORARILY_LOCKED") {
    return "Too many attempts. Wait a minute, then try again.";
  }
  if (error.code && Object.hasOwn(MESSAGES, error.code)) return MESSAGES[error.code];
  return error.message || "Something went wrong. Try again.";
}

// Codes a failed GitHub sign-in or link sends back in ?error=. Only codes the user can act on get
// their own message; expired state, network and server failures all mean "try again".
const OAUTH_MESSAGES: Record<string, string> = {
  SIGN_UP_CLOSED:
    "Sign-up is invite-only for now, and your GitHub email address is not on the list. If you were invited, sign in with that address.",
  access_denied: "GitHub sign-in was cancelled.",
  email_not_verified: "Verify your email address on GitHub, then try again.",
  email_not_found: "GitHub did not share an email address. Add one to your GitHub account, then try again.",
  account_not_linked:
    "This email already has an account. Sign in with its password, or use “Forgot your password?” to set one, then connect GitHub from your settings.",
  email_does_not_match: "Your GitHub email address is not the one on this account, so GitHub cannot be connected.",
  account_already_linked_to_different_user: "This GitHub account is already connected to another account here.",
};

/**
 * The message for a page reached with ?error=<code>. The URL is anyone's to write, so the text
 * always comes from this table, never from the URL's own error_description.
 */
export function oauthErrorMessage(code: string): string {
  return Object.hasOwn(OAUTH_MESSAGES, code) ? OAUTH_MESSAGES[code] : "GitHub sign-in did not finish. Try again.";
}
