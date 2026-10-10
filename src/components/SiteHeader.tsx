import Link from "next/link";
import { GithubLogo, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { SITE_REPO_URL } from "@/lib/site";
import { NavLink } from "./NavLink";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINK =
  "rounded-[10px] px-3 py-2 text-sm text-muted transition-colors hover:text-foreground aria-[current]:bg-surface-raised aria-[current]:text-foreground";

export function SiteHeader() {
  return (
    <header className="material scroll-edge sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-sm font-semibold text-foreground"
        >
          <TerminalWindow size={22} weight="regular" className="text-accent" aria-hidden />
          <span className="hidden sm:inline">claude-skills-library</span>
          <span className="sm:hidden">csl</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/skills" className={NAV_LINK}>
            Browse skills
          </NavLink>
          <NavLink href="/recommend" className={`hidden sm:block ${NAV_LINK}`}>
            Recommend
          </NavLink>
          <NavLink href="/report" className={`hidden sm:block ${NAV_LINK}`}>
            Report
          </NavLink>
          <a
            href={SITE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex h-11 w-11 items-center justify-center rounded-[10px] border border-line text-muted hover:border-faint hover:text-foreground"
            aria-label="GitHub repository"
          >
            <GithubLogo size={20} weight="regular" aria-hidden />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
