/**
 * The GitHub OAuth app's credentials, or null when either is unset. GitHub callback URLs
 * cannot be wildcards, so previews get no app and sign in with email and password only.
 */
export function githubCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}
