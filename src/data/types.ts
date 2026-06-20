export type SkillCategory =
  | "design"
  | "code-quality"
  | "testing"
  | "workflow"
  | "research"
  | "productivity"
  | "domain"
  | "meta";

export type InstallMethod = "manual-copy" | "npx-skills" | "plugin" | "marketplace";

export interface SkillInstall {
  method: InstallMethod;
  /** Exact command to run, or a short instruction when no single command exists. */
  command: string;
}

export interface SkillUpdate {
  /** Exact command to pull the latest version, or a short instruction when no single command exists. */
  command: string;
  /** Optional one-line note, e.g. "auto-updates at startup" or "run /reload-plugins after". */
  note?: string;
}

export interface SkillUsageItem {
  /** A command / invocation / flag, rendered in mono. */
  command: string;
  /** What it does, one line. */
  description: string;
}

export interface Skill {
  /** kebab-case id, used as the route param. */
  slug: string;
  name: string;
  /** One-line description, 20 words max. */
  tagline: string;
  category: SkillCategory;
  tags: string[];
  /** "owner/repo" on GitHub, or null for local/private skills (stats hidden). */
  repo: string | null;
  /** Subpath inside a monorepo, used for the source link. */
  repoPath?: string;
  install: SkillInstall;
  /** How to update an already-installed copy to the latest version. */
  update: SkillUpdate;
  whenToUse: string[];
  /** Structured quick-reference: concrete commands / flags and what each does. */
  usage: SkillUsageItem[];
  /** Markdown: invocation and workflow. */
  howToUse: string;
  /** Markdown: why this skill earns its place. */
  whyUseful: string;
  /** Sample invocation rendered in a terminal block. */
  examplePrompt?: string;
  author: string;
  featured?: boolean;
  /** ISO date the entry was added to the library. */
  dateAdded: string;
}

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  design: "Design",
  "code-quality": "Code quality",
  testing: "Testing",
  workflow: "Workflow",
  research: "Research",
  productivity: "Productivity",
  domain: "Domain",
  meta: "Meta",
};
