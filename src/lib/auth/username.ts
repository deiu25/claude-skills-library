export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

// Lowercase letters and digits, with single hyphens between them: the shape of a URL segment,
// since a username becomes /u/<username>.
const USERNAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Route names under the site root, and names that would pass for the site or its operator.
const RESERVED = new Set([
  "about",
  "account",
  "accounts",
  "admin",
  "administrator",
  "anthropic",
  "api",
  "app",
  "auth",
  "basetech",
  "billing",
  "blog",
  "claude",
  "claude-code",
  "claude-skills",
  "community",
  "contact",
  "dashboard",
  "docs",
  "help",
  "home",
  "legal",
  "login",
  "logout",
  "me",
  "mod",
  "moderator",
  "new",
  "null",
  "official",
  "owner",
  "playbooks",
  "privacy",
  "recommend",
  "report",
  "root",
  "security",
  "settings",
  "sign-in",
  "sign-out",
  "sign-up",
  "signin",
  "signup",
  "skills",
  "staff",
  "stacks",
  "status",
  "support",
  "system",
  "team",
  "terms",
  "two-factor",
  "u",
  "undefined",
  "user",
  "users",
  "www",
]);

/** What is wrong with a username, or null when it can be used. Expects the lowercased form. */
export function usernameProblem(username: string): string | null {
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `Use ${USERNAME_MIN} to ${USERNAME_MAX} characters.`;
  }
  if (!USERNAME_RE.test(username)) {
    return "Use letters, digits and single hyphens, starting and ending with a letter or digit.";
  }
  if (RESERVED.has(username)) return "This username is reserved. Choose another.";
  return null;
}

export function isValidUsername(username: string): boolean {
  return usernameProblem(username) === null;
}
