import type { Skill } from "../types";

export const skill: Skill = {
  slug: "skill-creator",
  name: "Skill Creator",
  tagline: "Anthropic's official skill for creating new skills: packages workflows into SKILL.md files.",
  category: "meta",
  tags: ["skills", "authoring", "official", "anthropic"],
  repo: "anthropics/skills",
  repoPath: "skill-creator",
  install: {
    method: "manual-copy",
    command: "Copy the skill-creator folder from anthropics/skills into ~/.claude/skills/",
  },
  update: {
    command: "git -C ~/.claude/skills/skill-creator pull",
    note: "Or re-clone/re-copy from the repo if it is not a git checkout.",
  },
  usage: [
    { command: "create a skill", description: "Walks through the canonical SKILL.md structure for a new skill." },
    { command: "turn this into a skill", description: "Crystallizes the current workflow into a reusable skill." },
    { command: "Create a skill that packages our release checklist", description: "Describe the workflow to scaffold a self-contained skill folder." },
    { command: "Update an existing skill", description: "Add new scripts, reference files, or assets to a skill." },
  ],
  whenToUse: [
    "You repeated the same workflow three times and want to crystallize it",
    "Turning a one-off prompt recipe into a reusable, shareable skill",
    "Updating an existing skill with new scripts, references, or assets",
  ],
  howToUse: `Say "create a skill" or "turn this into a skill" and describe the workflow. The skill walks through the canonical structure: SKILL.md with name and description frontmatter, optional scripts, reference files, and assets, all self-contained in one folder.

\`\`\`
Create a skill that packages our release checklist
\`\`\``,
  whyUseful: `Skills are the highest-leverage Claude Code feature: knowledge written once, applied every session. This is the official Anthropic template for authoring them correctly, including the frontmatter conventions that control when a skill auto-activates. Meta but essential: it is the skill that makes all other skills.`,
  examplePrompt: "Create a skill from the deployment workflow we just did",
  author: "Anthropic",
  dateAdded: "2026-06-12",
};
