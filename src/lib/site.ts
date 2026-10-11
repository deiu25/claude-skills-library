export const SITE_NAME = "Claude Skills Library";

export const SITE_REPO_URL = "https://github.com/deiu25/claude-skills-library";

export const SITE_URL = "https://claude-skills-library-psi.vercel.app";

export const SITE_DESCRIPTION =
  "A curated library of Claude Code skills: what each one does, when to use it, and how to install it.";

/**
 * Who runs the site, exactly as registered with the Romanian trade register (ONRC). The registered
 * office is the owner's home, so only its locality is published, as on basetech.ro.
 */
export const OPERATOR = {
  name: "Code Art Web Solutions S.R.L.",
  brand: "BaseTech",
  locality: "Iordăcheanu, Prahova county, Romania",
  tradeRegister: "J2024001424294",
  euid: "ROONRC.J2024001424294",
  cui: "50223815",
  shareCapital: "200 lei",
  email: "contact@basetech.ro",
} as const;

/**
 * aria-current for a nav link: "page" when it points at the page you are on,
 * "true" when you are on a page nested under its section, otherwise unset.
 */
export function ariaCurrent(pathname: string, href: string): "page" | "true" | undefined {
  if (pathname === href) return "page";
  return pathname.startsWith(`${href}/`) ? "true" : undefined;
}
