/**
 * Sign-up stays closed until the owner launches: only `ACCOUNTS_OPEN=true` opens it,
 * and until then only the comma-separated `ACCOUNTS_ALLOWLIST` addresses may sign up.
 */
export function isSignUpAllowed(
  email: string,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.ACCOUNTS_OPEN === "true") return true;
  const address = email.trim().toLowerCase();
  if (!address) return false;
  return (env.ACCOUNTS_ALLOWLIST ?? "")
    .split(",")
    .some((entry) => entry.trim().toLowerCase() === address);
}
