/** The error shape Better Auth's client returns: an HTTP status and, usually, a code. */
export interface AuthError {
  status: number;
  code?: string;
  message?: string;
}

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Wrong email or password.",
  EMAIL_NOT_VERIFIED: "Confirm your email first. We sent a new link to your inbox.",
  INVALID_TOKEN: "This link is invalid or has expired. Request a new one.",
  PASSWORD_TOO_SHORT: "Use a password of at least 8 characters.",
  PASSWORD_TOO_LONG: "Use a password of at most 128 characters.",
  SIGN_UP_CLOSED:
    "Sign-up is invite-only for now, and this email address is not on the list. If you were invited, use that address.",
};

/** For a request that never got an answer. */
export const OFFLINE_MESSAGE = "Could not reach the server. Check your connection and try again.";

export function authErrorMessage(error: AuthError): string {
  if (error.status === 429) return "Too many attempts. Wait a minute, then try again.";
  return (error.code && MESSAGES[error.code]) || error.message || "Something went wrong. Try again.";
}

// Codes a failed GitHub sign-in sends back in ?error=. Only codes the user can act on get their own
// message; expired state, network and server failures all mean "try again".
const OAUTH_MESSAGES: Record<string, string> = {
  SIGN_UP_CLOSED:
    "Sign-up is invite-only for now, and your GitHub email address is not on the list. If you were invited, sign in with that address.",
  access_denied: "GitHub sign-in was cancelled.",
  email_not_verified: "Verify your email address on GitHub, then try again.",
  email_not_found: "GitHub did not share an email address. Add one to your GitHub account, then try again.",
  account_not_linked: "This email already has an account. Sign in with your email and password instead.",
};

/**
 * The message for a sign-in page reached with ?error=<code>. The URL is anyone's to write, so the
 * text always comes from this table, never from the URL's own error_description.
 */
export function oauthErrorMessage(code: string): string {
  return Object.hasOwn(OAUTH_MESSAGES, code) ? OAUTH_MESSAGES[code] : "GitHub sign-in did not finish. Try again.";
}
