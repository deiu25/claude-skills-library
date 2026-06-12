import type { Skill, SkillCategory } from "../types";
import { skill as designTasteFrontend } from "./design-taste-frontend";
import { skill as uiUxProMax } from "./ui-ux-pro-max";
import { skill as ohMyClaudecode } from "./oh-my-claudecode";
import { skill as caveman } from "./caveman";
import { skill as superpowers } from "./superpowers";
import { skill as humanizer } from "./humanizer";
import { skill as skillCreator } from "./skill-creator";
import { skill as everythingClaudeCode } from "./everything-claude-code";
import { skill as karpathyGuidelines } from "./karpathy-guidelines";
import { skill as claudeMem } from "./claude-mem";
import { skill as grillMe } from "./grill-me";
import { skill as tailwindGlobalsPatterns } from "./tailwind-globals-patterns";

export const skills: Skill[] = [
  designTasteFrontend,
  uiUxProMax,
  ohMyClaudecode,
  superpowers,
  caveman,
  everythingClaudeCode,
  claudeMem,
  humanizer,
  skillCreator,
  karpathyGuidelines,
  grillMe,
  tailwindGlobalsPatterns,
];

export function getSkill(slug: string): Skill | undefined {
  return skills.find((s) => s.slug === slug);
}

export function getFeaturedSkills(): Skill[] {
  return skills.filter((s) => s.featured);
}

export function getCategoriesWithCounts(): { category: SkillCategory; count: number }[] {
  const counts = new Map<SkillCategory, number>();
  for (const s of skills) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function getUniqueRepos(): string[] {
  return [...new Set(skills.flatMap((s) => (s.repo ? [s.repo] : [])))];
}
