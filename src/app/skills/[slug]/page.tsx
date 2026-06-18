import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowSquareOut,
  Calendar,
  Eye,
  GitFork,
  Scales,
  Star,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { skills, getSkill } from "@/data/skills";
import { CATEGORY_LABELS } from "@/data/types";
import { getRepoStats, formatCount, formatRelativeDate } from "@/lib/github";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TerminalBlock } from "@/components/TerminalBlock";
import { Markdown } from "@/components/Markdown";

export const revalidate = 21600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return skills.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) return {};
  return {
    title: skill.name,
    description: skill.tagline,
  };
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  const stats = skill.repo ? await getRepoStats(skill.repo) : null;
  const repoUrl = skill.repo
    ? `https://github.com/${skill.repo}${skill.repoPath ? `/tree/HEAD/${skill.repoPath}` : ""}`
    : null;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/skills"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} aria-hidden />
          All skills
        </Link>

        <article className="space-y-10">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-balance font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {skill.name}
              </h1>
              <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
                {CATEGORY_LABELS[skill.category]}
              </span>
            </div>
            <p className="max-w-[60ch] text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {skill.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
              <span>by {skill.author}</span>
              {repoUrl ? (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent-strong"
                >
                  {skill.repo}
                  <ArrowSquareOut size={14} aria-hidden />
                </a>
              ) : (
                <span>local skill, no public repo</span>
              )}
            </div>
          </header>

          {stats ? (
            <section aria-label="GitHub stats" className="card grid grid-cols-2 gap-px overflow-hidden bg-line p-0 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { icon: Star, label: "Stars", value: formatCount(stats.stars) },
                { icon: GitFork, label: "Forks", value: formatCount(stats.forks) },
                { icon: Eye, label: "Watchers", value: formatCount(stats.watchers) },
                { icon: Warning, label: "Open issues", value: formatCount(stats.openIssues) },
                { icon: Scales, label: "License", value: stats.license ?? "n/a" },
                { icon: Calendar, label: "Last push", value: formatRelativeDate(stats.pushedAt) },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1.5 bg-surface p-4">
                  <span className="flex items-center gap-1.5 text-xs text-faint">
                    <item.icon size={14} aria-hidden />
                    {item.label}
                  </span>
                  <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </section>
          ) : skill.repo ? (
            <p className="card px-5 py-4 text-sm text-muted">
              GitHub stats are temporarily unavailable for this repo.
            </p>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Install</h2>
            <TerminalBlock title="install" copyText={skill.install.command}>
              <p>
                <span className="text-accent">$</span> {skill.install.command}
              </p>
            </TerminalBlock>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">When to use it</h2>
            <ul className="space-y-2.5">
              {skill.whenToUse.map((item) => (
                <li key={item} className="flex max-w-[65ch] gap-3 text-[15px] leading-relaxed text-muted">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">How to use it</h2>
            <Markdown content={skill.howToUse} />
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Why it earns its place
            </h2>
            <Markdown content={skill.whyUseful} />
          </section>

          {skill.examplePrompt ? (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Try it</h2>
              <TerminalBlock title="claude" copyText={skill.examplePrompt}>
                <p>
                  <span className="text-accent">&gt;</span> {skill.examplePrompt}
                </p>
              </TerminalBlock>
            </section>
          ) : null}

          <footer className="flex flex-wrap items-center gap-2 border-t border-line pt-6">
            {skill.tags.map((tag) => (
              <Link key={tag} href={`/skills?q=${encodeURIComponent(tag)}`} className="chip">
                {tag}
              </Link>
            ))}
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
