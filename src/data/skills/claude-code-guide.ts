import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-code-guide",
  name: "Claude Code Guide",
  tagline: "Beginner-to-power-user reference for Claude Code: setup, env vars, slash commands, flags, agents, skills, and MCP.",
  category: "resource",
  tags: ["reference", "guide", "documentation", "cheatsheet", "cli", "configuration"],
  repo: "zebbern/claude-code-guide",
  install: {
    method: "manual-copy",
    command: "Browse at github.com/zebbern/claude-code-guide",
  },
  update: {
    command: "git pull / re-visit the repo",
    note: "Reference guide — nothing to install. Bookmark the README and revisit; the repo is actively updated (460+ commits).",
  },
  usage: [
    { command: "git clone https://github.com/zebbern/claude-code-guide", description: "Clone to read the README and example agents/ and skills/ directories locally." },
    { command: "README.md", description: "Single-page guide: install paths, config, env vars, commands, advanced features, MCP, and plugins." },
    { command: "agents/", description: "Example subagent definitions referenced by the guide." },
    { command: "skills/", description: "Example SKILL.md custom-command files to model your own after." },
    { command: "CHANGELOG.md", description: "Track what the guide has added or revised over time." },
  ],
  whenToUse: [
    "You are new to Claude Code and want one page covering install, config, and the command surface.",
    "You need a quick lookup for a slash command, CLI flag, env var, or keyboard shortcut.",
    "You want to understand thinking modes, plan/auto mode, subagents, skills, or MCP setup before using them.",
    "You are onboarding a teammate and want a vetted, single-link primer instead of scattered docs.",
  ],
  howToUse: `This is a **reference guide**, not a skill or plugin — there is nothing to install. Read it on GitHub or clone it for offline use.

\`\`\`bash
git clone https://github.com/zebbern/claude-code-guide
\`\`\`

The README is the deliverable: a single page covering installation paths (native installer, npm \`@anthropic-ai/claude-code\`, Docker), environment variables, the memory hierarchy, slash commands, CLI flags, thinking/effort modes, plan/auto mode, subagents, skills, worktrees, and MCP/plugin setup. The \`agents/\` and \`skills/\` directories hold example definitions you can copy as starting templates; \`CHANGELOG.md\` tracks revisions.

Note: the curl/npm install commands inside the README install Claude Code itself (the subject of the guide), not this repository.`,
  whyUseful: `One of the most-starred (~4.3k) community references for Claude Code, kept current (460+ commits, MIT) by zebbern. It consolidates the full command and configuration surface — env vars, slash commands, flags, shortcuts, agents, skills, MCP — into a single scannable page, which is faster than hunting across official docs for a flag or keyword. Useful as both a learning path (beginner to power user) and a day-to-day cheatsheet.`,
  examplePrompt: "Using zebbern/claude-code-guide, summarize the thinking modes and effort levels and when to use each.",
  author: "zebbern",
  dateAdded: "2026-06-20",
};
