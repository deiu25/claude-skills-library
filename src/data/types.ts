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
  whenToUse: string[];
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
