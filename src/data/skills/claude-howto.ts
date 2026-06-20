import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-howto",
  name: "Claude How To",
  tagline: "Tutorial guide with copy-paste templates for every Claude Code feature: commands, memory, skills, subagents, MCP, hooks.",
  category: "meta",
  tags: ["tutorial", "templates", "learning", "slash-commands", "subagents", "skills"],
  repo: "luongnv89/claude-howto",
  repoPath: "03-skills",
  install: {
    method: "manual-copy",
    command: "Clone luongnv89/claude-howto, then copy a skill from 03-skills/ into ~/.claude/skills/",
  },
  update: {
    command: "git -C ~/.claude/skills/<skill> pull",
    note: "These skills are copied out of the luongnv89/claude-howto repo, not git checkouts; re-clone the repo and re-copy the skill from 03-skills/ to get the latest version.",
  },
  usage: [
    { command: "git clone https://github.com/luongnv89/claude-howto.git", description: "Clone the full tutorial + template repository." },
    { command: "cp 01-slash-commands/optimize.md /path/to/project/.claude/commands/", description: "Copy a slash command template into a project." },
    { command: "cp -r 03-skills/code-review-specialist ~/.claude/skills/", description: "Copy a ready-made skill into your global skills dir." },
    { command: "ls 03-skills/", description: "Browse shipped skills: code-review-specialist, doc-generator, brand-voice, refactor, blog-draft, claude-md." },
    { command: "open LEARNING-ROADMAP", description: "Follow the structured 10-module learning path (01-slash-commands through 10-cli)." },
  ],
  whenToUse: [
    "You are new to Claude Code and want a structured, hands-on learning path covering every feature",
    "You want ready-made templates for slash commands, CLAUDE.md memory, skills, subagents, hooks, or plugins to drop into a project",
    "You are teaching or onboarding a team onto Claude Code and need a curated curriculum",
    "You want example skills like code-review-specialist, doc-generator, brand-voice, or refactor to copy and adapt",
  ],
  howToUse: `This is a tutorial repository plus a template library, not a one-command install. You clone it and selectively copy what you need.

\`\`\`bash
git clone https://github.com/luongnv89/claude-howto.git
cd claude-howto

# Copy a slash command into your project
cp 01-slash-commands/optimize.md /path/to/project/.claude/commands/
# Copy a skill into your global skills dir
cp -r 03-skills/code-review-specialist ~/.claude/skills/
\`\`\`

The repo is 10 numbered modules (\`01-slash-commands\` through \`10-cli\`) plus docs, prompts, slides, and a LEARNING-ROADMAP. The \`03-skills/\` folder ships real SKILL.md skills (code-review-specialist, doc-generator, brand-voice, refactor, blog-draft, claude-md) you copy into \`~/.claude/skills/\`.`,
  whyUseful: `One of the most popular Claude Code learning resources, and it doubles as a template library: every concept comes with production-ready, copy-paste files for slash commands, CLAUDE.md memory, skills, subagents, MCP configs, hooks, and plugin bundles. Rather than reading abstract docs you copy a working artifact straight into \`.claude/\` and adapt it.`,
  examplePrompt: "Copy the code-review-specialist skill into ~/.claude/skills/ and use it to review my latest diff.",
  author: "luongnv89",
  dateAdded: "2026-06-14",
};
