import Link from "next/link";
import {
  ArrowRight,
  GithubLogo,
  MagnifyingGlass,
  Plus,
  Star,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { skills, getFeaturedSkills, getCategoriesWithCounts, getUniqueRepos } from "@/data/skills";
import { CATEGORY_LABELS } from "@/data/types";
import type { Skill } from "@/data/types";
import { getRepoStats, formatCount } from "@/lib/github";
import type { RepoStats } from "@/lib/github";
import { SITE_REPO_URL } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSearch } from "@/components/HeroSearch";
import { TerminalBlock } from "@/components/TerminalBlock";
import { SkillCard } from "@/components/SkillCard";
import { Reveal } from "@/components/Reveal";

export const revalidate = 21600;

const heroSkill = skills[0]; // design-taste-frontend: real content for the hero terminal

export default async function HomePage() {
  const repos = getUniqueRepos();
  const statsList = await Promise.all(repos.map((r) => getRepoStats(r)));
  const statsByRepo: Record<string, RepoStats | null> = Object.fromEntries(
    repos.map((r, i) => [r, statsList[i]]),
  );

  const starsOf = (s: Skill): number => (s.repo ? (statsByRepo[s.repo]?.stars ?? 0) : 0);
  // Highest GitHub star count first; index i still drives span/accent below.
  const featured = [...getFeaturedSkills()].sort((a, b) => starsOf(b) - starsOf(a));
  const categories = getCategoriesWithCounts();
  const totalStars = statsList.reduce((sum, s) => sum + (s?.stars ?? 0), 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* 1. Hero: asymmetric split, search as primary CTA */}
        <section className="grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Claude Code skills, curated and explained.
            </h1>
            <p className="max-w-[42ch] text-pretty text-base leading-relaxed text-muted sm:text-lg">
              What each skill does, when to reach for it, and how to install it. With live GitHub
              stats.
            </p>
            <HeroSearch />
            <a
              href={SITE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <Star size={16} aria-hidden />
              Star on GitHub
            </a>
          </div>

          <Reveal>
            <TerminalBlock title="~/.claude/skills" copyText={heroSkill.install.command}>
              <div className="space-y-3">
                <p>
                  <span className="text-accent">$</span> {heroSkill.install.command}
                </p>
                <div className="border-t border-line/40 pt-3 text-faint">
                  <p>---</p>
                  <p>
                    name: <span className="text-terminal-fg">{heroSkill.slug}</span>
                  </p>
                  <p className="whitespace-pre-wrap">
                    description: <span className="text-terminal-fg">{heroSkill.tagline}</span>
                  </p>
                  <p>---</p>
                </div>
                <p className="text-accent">skill installed. available next session.</p>
              </div>
            </TerminalBlock>
          </Reveal>
        </section>

        {/* 2. Category strip: chip row, no cards */}
        <section aria-label="Categories" className="border-t border-line py-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="mr-2 font-mono text-xs text-faint">
              {skills.length} skills, {formatCount(totalStars)} combined stars
            </span>
            {categories.map(({ category, count }) => (
              <Link key={category} href={`/skills?category=${category}`} className="chip">
                {CATEGORY_LABELS[category]}
                <span className="text-faint">{count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Featured: asymmetric bento, exactly one cell per featured skill */}
        <section className="border-t border-line py-16 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Start with these
            </h2>
            <Link
              href="/skills"
              className="flex shrink-0 items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-strong"
            >
              All skills
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {featured.map((skill, i) => {
              const stats = skill.repo ? (statsByRepo[skill.repo] ?? null) : null;
              const spans = [
                "md:col-span-3",
                "md:col-span-3",
                "md:col-span-2",
                "md:col-span-2",
                "md:col-span-2",
              ];
              return (
                <Reveal key={skill.slug} delay={i * 0.06} className={spans[i] ?? "md:col-span-2"}>
                  <SkillCard skill={skill} stats={stats} featured accent={i === 0} />
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* 4. How it works: vertical numbered flow */}
        <section className="border-t border-line py-16 sm:py-20">
          <h2 className="mb-10 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            From browsing to working skill in three steps
          </h2>
          <ol className="space-y-8">
            {[
              {
                icon: MagnifyingGlass,
                title: "Find the right skill",
                body: "Browse by category or search the library. Each entry explains when the skill earns its place and when it does not.",
                snippet: null,
              },
              {
                icon: TerminalWindow,
                title: "Install it",
                body: "Every skill ships its exact install command: a plugin marketplace, npx skills, or a plain git clone.",
                snippet: "/plugin marketplace add obra/superpowers-marketplace",
              },
              {
                icon: Plus,
                title: "Invoke it in Claude Code",
                body: "Skills activate automatically when their trigger matches, or on demand with a slash command.",
                snippet: "/design-taste-frontend build a landing page, dark, Linear-clean",
              },
            ].map((step, i) => (
              <Reveal
                key={step.title}
                as="li"
                delay={i * 0.08}
                className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-surface text-accent">
                  <step.icon size={20} aria-hidden />
                </div>
                <div className="space-y-2.5">
                  <h3 className="pt-2 text-lg font-medium tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="max-w-[60ch] text-sm leading-relaxed text-muted">{step.body}</p>
                  {step.snippet ? (
                    <code className="inline-block rounded-[8px] border border-line bg-terminal-bg px-3.5 py-2 font-mono text-[13px] text-terminal-fg">
                      {step.snippet}
                    </code>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* 5. Contribute: full-width band */}
        <section className="border-t border-line py-16 sm:py-20">
          <div className="flex flex-col items-start gap-6 rounded-[14px] border border-line bg-surface p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
                Know a skill that belongs here?
              </h2>
              <p className="max-w-[50ch] text-pretty text-sm leading-relaxed text-muted">
                The library is a set of typed data files. Add one file, open a pull request, done.
              </p>
            </div>
            <a
              href={SITE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary shrink-0 text-sm"
            >
              <GithubLogo size={18} aria-hidden />
              Contribute a skill
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
