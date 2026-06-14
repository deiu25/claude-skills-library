import Link from "next/link";
import { GithubLogo, TerminalWindow } from "@phosphor-icons/react/dist/ssr";
import { SITE_REPO_URL } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-foreground"
        >
          <TerminalWindow size={22} weight="regular" className="text-accent" aria-hidden />
          <span className="hidden sm:inline">claude-skills-library</span>
          <span className="sm:hidden">csl</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/skills"
            className="rounded-[10px] px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            Browse skills
          </Link>
          <Link
            href="/recommend"
            className="hidden rounded-[10px] px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:block"
          >
            Recommend
          </Link>
          <Link
            href="/report"
            className="hidden rounded-[10px] px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:block"
          >
            Report
          </Link>
          <a
            href={SITE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line text-muted transition-colors hover:border-faint hover:text-foreground"
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
