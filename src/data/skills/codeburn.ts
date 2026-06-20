import type { Skill } from "../types";

export const skill: Skill = {
  slug: "codeburn",
  name: "CodeBurn",
  tagline: "Local TUI dashboard tracking AI coding token spend across Claude Code, Cursor, Codex, and 25+ tools.",
  category: "productivity",
  tags: ["cost-tracking", "token-usage", "observability", "cli", "claude-code", "tui"],
  repo: "getagentseal/codeburn",
  install: {
    method: "manual-copy",
    command: "npm install -g codeburn",
  },
  update: {
    command: "npm install -g codeburn@latest",
    note: "Standalone npm CLI, not a copied skill dir; re-install globally to upgrade (or brew upgrade codeburn if installed via Homebrew).",
  },
  usage: [
    { command: "codeburn", description: "Open the interactive 7-day token/cost dashboard." },
    { command: "codeburn today", description: "Show today's usage summary." },
    { command: "codeburn month", description: "Show usage for the current month." },
    { command: "codeburn optimize", description: "Find spending waste and savings opportunities." },
    { command: "codeburn compare", description: "Side-by-side model cost and efficiency metrics." },
    { command: "codeburn yield", description: "Correlate sessions with git commits." },
    { command: "codeburn export", description: "Export usage data as CSV or JSON." },
  ],
  whenToUse: [
    "You want to see where your AI coding tokens and dollars are going across Claude Code, Cursor, Codex, and other tools",
    "You need to audit or reduce AI coding spend and find waste (retries, re-reads, unused MCP servers)",
    "You want per-project, per-model, or per-task-type cost breakdowns without proxies or API keys",
    "You want to compare models on cost and efficiency, or correlate spend with git commits",
  ],
  howToUse: `CodeBurn is a standalone command-line tool, not a Claude Code skill or plugin. It reads session data already on disk, so there is nothing to wire into Claude Code.

\`\`\`bash
npm install -g codeburn   # or: brew install codeburn, or: npx codeburn
codeburn                  # interactive 7-day dashboard
\`\`\`

Common commands:

\`\`\`bash
codeburn today      # today's usage summary
codeburn month      # current month
codeburn optimize   # find spending waste / savings
codeburn compare    # side-by-side model metrics
codeburn yield      # correlate sessions with git commits
codeburn export     # CSV/JSON export
\`\`\`

Requires Node.js 22+ and at least one supported AI coding tool with local session data.`,
  whyUseful: `CodeBurn gives developers and teams granular, local-first visibility into AI coding spend, breaking costs down by project, model, tool, provider, MCP server, and task type while pricing every call via cached LiteLLM data. It runs entirely on local session files with no proxy or API keys, and its \`optimize\`, \`compare\`, and \`yield\` commands surface concrete waste and productivity signals. Not a skill itself, but a strong companion utility for managing Claude Code costs.`,
  author: "getagentseal",
  dateAdded: "2026-06-14",
};
