import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormMessage } from "@/components/auth/FormMessage";
import { CommunityLabel } from "@/components/community/CommunityLabel";
import { ListingInstall } from "@/components/community/ListingInstall";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { FileList } from "@/components/skills/FileList";
import { FindingList } from "@/components/skills/FindingList";
import { RiskBadge } from "@/components/skills/RiskBadge";
import { TerminalBlock } from "@/components/TerminalBlock";
import { CATEGORY_LABELS, type SkillCategory } from "@/data/types";
import { isSignUpOpen } from "@/lib/auth/allowlist";
import { formatDate, revealBidi } from "@/lib/community/format";
import { listingPath, profilePath, proposeUrl } from "@/lib/community/links";
import { communityMetadata } from "@/lib/community/metadata";
import { getListing } from "@/lib/community/queries";
import { formatBytes } from "@/lib/skills/files";

// Rendered on its first visit, then served from the cache until a write marks it stale.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ handle: string; slug: string }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle, slug } = await params;
  const listing = isSignUpOpen() ? await getListing(handle, slug) : null;
  if (!listing) return {};
  return communityMetadata({
    title: listing.name,
    description: listing.description,
    path: listingPath(handle, slug),
    unlisted: listing.visibility === "unlisted",
  });
}

export default async function ListingPage({ params }: PageProps) {
  if (!isSignUpOpen()) notFound();
  const { handle, slug } = await params;
  const listing = await getListing(handle, slug);
  if (!listing) notFound();

  const bytes = listing.files.reduce((sum, file) => sum + file.size, 0);
  const isPublic = listing.visibility === "public";

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8">
          <Link href="/community" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft size={15} aria-hidden />
            Community
          </Link>
        </div>

        <article className="space-y-10">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-all font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{listing.name}</h1>
              <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
                {CATEGORY_LABELS[listing.category as SkillCategory] ?? listing.category}
              </span>
              <CommunityLabel />
            </div>
            <p className="max-w-[60ch] text-pretty text-base leading-relaxed text-muted sm:text-lg">{listing.description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
              <span>
                by{" "}
                {/* An author's profile lists their public skills, so an unlisted one does not link to it. */}
                {isPublic ? (
                  <Link href={profilePath(handle)} className="font-mono text-muted transition-colors hover:text-accent-strong">
                    {handle}
                  </Link>
                ) : (
                  <span className="font-mono text-muted">{handle}</span>
                )}
              </span>
              <span>
                Version {listing.version}, updated {formatDate(listing.updatedAt)}
              </span>
              <RiskBadge risk={listing.risk} />
            </div>
          </header>

          <FormMessage tone="warning">
            Published by its author, not curated: nobody at the library has reviewed it. The scan flags what it
            recognises and cannot show that a skill is safe. Read SKILL.md and the files before you install it.
          </FormMessage>

          <ListingInstall id={listing.id} />

          <section aria-labelledby="scan-title" className="space-y-3">
            <h2 id="scan-title" className="text-xl font-semibold text-foreground">
              Scan
            </h2>
            <div className="rounded-[8px] border border-line bg-surface">
              {listing.findings.length ? (
                <FindingList findings={listing.findings} />
              ) : (
                <p className="px-4 py-3 text-sm leading-relaxed text-muted">
                  Nothing flagged when version {listing.version} was saved. No findings does not prove a skill is safe.
                </p>
              )}
            </div>
          </section>

          <section aria-labelledby="files-title" className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="files-title" className="text-xl font-semibold text-foreground">
                Files
              </h2>
              {listing.files.length > 0 && (
                <span className="text-xs tabular-nums text-faint">
                  {listing.files.length === 1 ? "1 file" : `${listing.files.length} files`} beside SKILL.md, {formatBytes(bytes)}
                </span>
              )}
            </div>
            <div className="rounded-[8px] border border-line bg-surface">
              {listing.files.length ? (
                <FileList files={listing.files} />
              ) : (
                <p className="px-4 py-3 text-sm leading-relaxed text-muted">Only SKILL.md.</p>
              )}
            </div>
          </section>

          {/* As text, never rendered: what Claude reads, and no Markdown parser runs on an author's input. */}
          <section aria-labelledby="skill-md-title" className="space-y-3">
            <h2 id="skill-md-title" className="font-mono text-xl font-semibold text-foreground">
              SKILL.md
            </h2>
            <TerminalBlock title="SKILL.md">
              <pre className="whitespace-pre-wrap break-words">{revealBidi(listing.skillMd)}</pre>
            </TerminalBlock>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <div className="flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
            {isPublic && (
              <a
                href={proposeUrl(listing)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-strong"
              >
                Propose it for the curated catalog
                <ArrowSquareOut size={14} aria-hidden />
              </a>
            )}
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
