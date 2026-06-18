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
import { skill as claudeHowto } from "./claude-howto";
import { skill as ruflo } from "./ruflo";
import { skill as awesomeDesignMd } from "./awesome-design-md";
import { skill as codeburn } from "./codeburn";
import { skill as designExtract } from "./design-extract";
import { skill as stitchSkills } from "./stitch-skills";
import { skill as claudeCodeBestPractice } from "./claude-code-best-practice";
import { skill as specKit } from "./spec-kit";
import { skill as gstack } from "./gstack";
import { skill as mattpocockSkills } from "./mattpocock-skills";
import { skill as openspec } from "./openspec";
import { skill as bmadMethod } from "./bmad-method";
import { skill as nextDevtoolsMcp } from "./next-devtools-mcp";
import { skill as raptor } from "./raptor";
import { skill as claudeRed } from "./claude-red";
import { skill as marketingskills } from "./marketingskills";
import { skill as claudePluginsOfficial } from "./claude-plugins-official";
import { skill as vercelAgentSkills } from "./vercel-agent-skills";
import { skill as scientificAgentSkills } from "./scientific-agent-skills";
import { skill as openaiSkills } from "./openai-skills";
import { skill as claudeSkillsEnterprise } from "./claude-skills-enterprise";
import { skill as gsdCore } from "./gsd-core";
import { skill as impeccable } from "./impeccable";

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
  claudeHowto,
  ruflo,
  awesomeDesignMd,
  codeburn,
  designExtract,
  stitchSkills,
  claudeCodeBestPractice,
  specKit,
  gstack,
  mattpocockSkills,
  openspec,
  bmadMethod,
  nextDevtoolsMcp,
  raptor,
  claudeRed,
  marketingskills,
  claudePluginsOfficial,
  vercelAgentSkills,
  scientificAgentSkills,
  openaiSkills,
  claudeSkillsEnterprise,
  gsdCore,
  impeccable,
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
