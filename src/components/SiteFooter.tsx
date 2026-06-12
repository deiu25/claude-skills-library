import Link from "next/link";
import { SITE_REPO_URL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted">
          MIT licensed. Skill names and content belong to their authors.
        </p>
        <nav aria-label="Footer" className="flex items-center gap-5 text-sm">
          <Link href="/skills" className="text-muted transition-colors hover:text-foreground">
            All skills
          </Link>
          <a
            href={SITE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-foreground"
          >
            Source
          </a>
        </nav>
      </div>
    </footer>
  );
}
