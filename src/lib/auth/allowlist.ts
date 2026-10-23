type Env = Record<string, string | undefined>;

/** Whether the owner has launched: sign-up is open to everyone, and so are the Community pages. */
export function isSignUpOpen(env: Env = process.env): boolean {
  return env.ACCOUNTS_OPEN === "true";
}

/**
 * Sign-up stays closed until the owner launches: only `ACCOUNTS_OPEN=true` opens it,
 * and until then only the comma-separated `ACCOUNTS_ALLOWLIST` addresses may sign up.
 */
export function isSignUpAllowed(email: string, env: Env = process.env): boolean {
  if (isSignUpOpen(env)) return true;
  const address = email.trim().toLowerCase();
  if (!address) return false;
  return (env.ACCOUNTS_ALLOWLIST ?? "")
    .split(",")
    .some((entry) => entry.trim().toLowerCase() === address);
}
