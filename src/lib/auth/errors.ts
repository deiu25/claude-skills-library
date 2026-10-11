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
};

/** For a request that never got an answer. */
export const OFFLINE_MESSAGE = "Could not reach the server. Check your connection and try again.";

export function authErrorMessage(error: AuthError): string {
  if (error.status === 429) return "Too many attempts. Wait a minute, then try again.";
  return (error.code && MESSAGES[error.code]) || error.message || "Something went wrong. Try again.";
}
