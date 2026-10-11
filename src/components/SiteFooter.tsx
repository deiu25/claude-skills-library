import Link from "next/link";
import { OPERATOR, SITE_REPO_URL } from "@/lib/site";

const LINK = "inline-flex min-h-11 items-center text-muted transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1.5">
          <p className="text-sm text-muted">
            MIT licensed. Skill names and content belong to their authors.
          </p>
          <p className="text-xs leading-relaxed text-faint">
            Run by {OPERATOR.name} · CUI {OPERATOR.cui} · Reg. Com. {OPERATOR.tradeRegister} ·{" "}
            {OPERATOR.locality} ·{" "}
            <a href={`mailto:${OPERATOR.email}`} className="transition-colors hover:text-foreground">
              {OPERATOR.email}
            </a>{" "}
            ·{" "}
            <a
              href={`tel:${OPERATOR.phone.replaceAll(" ", "")}`}
              className="whitespace-nowrap transition-colors hover:text-foreground"
            >
              {OPERATOR.phone}
            </a>
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 text-sm sm:shrink-0">
          <Link href="/skills" className={LINK}>
            All skills
          </Link>
          <Link href="/recommend" className={LINK}>
            Recommend
          </Link>
          <Link href="/report" className={LINK}>
            Report
          </Link>
          <Link href="/privacy" className={LINK}>
            Privacy
          </Link>
          <Link href="/terms" className={LINK}>
            Terms
          </Link>
          <a href={SITE_REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
            Source
          </a>
        </nav>
      </div>
    </footer>
  );
}
