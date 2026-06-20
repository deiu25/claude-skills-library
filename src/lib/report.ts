import type { Skill, SkillCategory } from "@/data/types";
import { CATEGORY_LABELS } from "@/data/types";
import type { RepoStats } from "@/lib/github";

/**
 * Serialization layer for the skill catalog. Every export the site offers
 * (the /report page, the /skills.json and /llms.txt endpoints, the
 * multi-select export) renders through these pure functions, so the output
 * is consistent everywhere and there is exactly one place to change a format.
 *
 * `statsByRepo` is optional: callers that have GitHub stats (server pages)
 * pass them to enrich the output; callers that do not (client selection
 * export) simply omit them and stars are left out.
 */
export type StatsByRepo = Record<string, RepoStats | null>;

const CATALOG_VERSION = 1;

export interface CatalogSkill {
  slug: string;
  name: string;
  tagline: string;
  category: SkillCategory;
  categoryLabel: string;
  tags: string[];
  author: string;
  repo: string | null;
  stars: number | null;
  install: { method: string; command: string };
  whenToUse: string[];
  url: string;
  dateAdded: string;
}

export interface JsonCatalog {
  version: number;
  generatedAt: string;
  count: number;
  skills: CatalogSkill[];
}

function starsOf(skill: Skill, statsByRepo?: StatsByRepo): number | null {
  if (!skill.repo) return null;
  return statsByRepo?.[skill.repo]?.stars ?? null;
}

/** Sort by stars (desc), then name — the catalog's canonical order. */
function byPopularity(statsByRepo?: StatsByRepo) {
  return (a: Skill, b: Skill): number => {
    const sa = starsOf(a, statsByRepo) ?? -1;
    const sb = starsOf(b, statsByRepo) ?? -1;
    if (sb !== sa) return sb - sa;
    return a.name.localeCompare(b.name);
  };
}

function toCatalogSkill(skill: Skill, statsByRepo?: StatsByRepo): CatalogSkill {
  return {
    slug: skill.slug,
    name: skill.name,
    tagline: skill.tagline,
    category: skill.category,
    categoryLabel: CATEGORY_LABELS[skill.category],
    tags: skill.tags,
    author: skill.author,
    repo: skill.repo,
    stars: starsOf(skill, statsByRepo),
    install: { method: skill.install.method, command: skill.install.command },
    whenToUse: skill.whenToUse,
    url: `/skills/${skill.slug}`,
    dateAdded: skill.dateAdded,
  };
}

/**
 * Machine-readable catalog for AI agents and external tools.
 * `generatedAt` defaults to "" so the output is deterministic in tests and
 * static builds; pass an ISO string when you want a real timestamp.
 */
export function toJsonCatalog(
  skills: Skill[],
  statsByRepo?: StatsByRepo,
  generatedAt = "",
): JsonCatalog {
  const ordered = [...skills].sort(byPopularity(statsByRepo));
  return {
    version: CATALOG_VERSION,
    generatedAt,
    count: ordered.length,
    skills: ordered.map((s) => toCatalogSkill(s, statsByRepo)),
  };
}

/** Group skills by category, preserving the CATEGORY_LABELS order. */
function groupByCategory(skills: Skill[]): [SkillCategory, Skill[]][] {
  const order = Object.keys(CATEGORY_LABELS) as SkillCategory[];
  return order
    .map((category): [SkillCategory, Skill[]] => [
      category,
      skills.filter((s) => s.category === category),
    ])
    .filter(([, list]) => list.length > 0);
}

/**
 * Full Markdown digest grouped by category — the "paste this into an LLM"
 * report. Covers both stated use cases: spotting workflow gaps (the category
 * structure makes thin areas obvious) and picking skills for a task (each
 * entry lists when to use it and how to install it).
 */
export function toMarkdownReport(skills: Skill[], statsByRepo?: StatsByRepo): string {
  const groups = groupByCategory(skills);
  const lines: string[] = [
    "# Claude Code Skills — Library Report",
    "",
    `${skills.length} skills across ${groups.length} categories.`,
    "",
    "Use this report to spot gaps in your workflow and to pick the right skill for a task.",
    "",
  ];

  for (const [category, list] of groups) {
    lines.push(`## ${CATEGORY_LABELS[category]} (${list.length})`, "");
    for (const skill of [...list].sort(byPopularity(statsByRepo))) {
      const stars = starsOf(skill, statsByRepo);
      const starNote = stars !== null ? ` — ${stars}★` : "";
      lines.push(`### ${skill.name}${starNote}`);
      lines.push(`${skill.tagline}`, "");
      lines.push(`- Install: \`${skill.install.command}\``);
      if (skill.tags.length > 0) lines.push(`- Tags: ${skill.tags.join(", ")}`);
      if (skill.whenToUse.length > 0) {
        lines.push("- When to use:");
        for (const use of skill.whenToUse) lines.push(`  - ${use}`);
      }
      lines.push(`- Author: ${skill.author}`, "");
    }
  }

  return lines.join("\n").trimEnd() + "\n";
}

/**
 * Compact Markdown for a single skill — the per-page "Copy for LLM" payload.
 * Mirrors the per-entry shape of toMarkdownReport so a one-skill copy and the
 * full report read the same. Optional sections are omitted when their field is
 * empty so a local skill (no repo) or an untagged skill stays clean.
 */
export function toSkillMarkdown(skill: Skill, stats?: RepoStats | null): string {
  const stars = skill.repo ? stats?.stars ?? null : null;
  const starNote = stars !== null ? ` — ${stars}★` : "";
  const lines: string[] = [
    `# ${skill.name}${starNote}`,
    skill.tagline,
    "",
    `- Category: ${CATEGORY_LABELS[skill.category]}`,
    `- Install: \`${skill.install.command}\``,
  ];
  if (skill.tags.length > 0) lines.push(`- Tags: ${skill.tags.join(", ")}`);
  if (skill.whenToUse.length > 0) {
    lines.push("- When to use:");
    for (const use of skill.whenToUse) lines.push(`  - ${use}`);
  }
  lines.push(`- Author: ${skill.author}`);
  if (skill.repo) lines.push(`- Source: https://github.com/${skill.repo}`);
  return lines.join("\n").trimEnd() + "\n";
}

/**
 * llms.txt format (https://llmstxt.org/): an H1, an optional blockquote,
 * then category sections of `- [name](url): description` links.
 */
export function toLlmsTxt(skills: Skill[]): string {
  const groups = groupByCategory(skills);
  const lines: string[] = [
    "# Claude Code Skills Library",
    "",
    "> A curated catalog of Claude Code skills: what each does, when to use it, and how to install it.",
    "",
  ];
  for (const [category, list] of groups) {
    lines.push(`## ${CATEGORY_LABELS[category]}`, "");
    for (const skill of list) {
      lines.push(`- [${skill.name}](/skills/${skill.slug}): ${skill.tagline}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd() + "\n";
}

/** Compact one-line-per-skill Markdown table — a printable cheat-sheet. */
export function toCheatSheet(skills: Skill[], statsByRepo?: StatsByRepo): string {
  const rows = [...skills].sort(byPopularity(statsByRepo)).map((skill) => {
    const when = skill.whenToUse[0] ?? "";
    const cmd = skill.install.command.replace(/\|/g, "\\|");
    return `| ${skill.name} | ${CATEGORY_LABELS[skill.category]} | \`${cmd}\` | ${when} |`;
  });
  return [
    "# Skills Cheat-Sheet",
    "",
    "| Skill | Category | Install | When to use |",
    "| --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}
