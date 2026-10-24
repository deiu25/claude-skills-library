// Exact hosts from Vercel's system variables, so every preview URL works without BETTER_AUTH_URL.
// Never a wildcard: "*.vercel.app" would trust every Vercel deployment as an origin.
export const onVercel = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
export const allowedHosts = onVercel
  ? [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL].filter(
      (host): host is string => Boolean(host),
    )
  : ["localhost:3000"];

/** The origin a request came to, when its host is one of the site's own; null for any other host. */
export function siteOrigin(host: string | null): string | null {
  return host && allowedHosts.includes(host) ? `${onVercel ? "https" : "http"}://${host}` : null;
}
