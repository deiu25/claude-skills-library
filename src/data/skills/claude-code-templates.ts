import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-code-templates",
  name: "Claude Code Templates",
  tagline: "CLI and web catalog to browse and install 100+ Claude Code agents, commands, MCPs, settings, hooks, and skills.",
  category: "meta",
  tags: ["catalog", "installer", "agents", "mcp", "analytics", "npx"],
  repo: "davila7/claude-code-templates",
  install: {
    method: "npx-skills",
    command: "npx claude-code-templates@latest",
  },
  update: {
    command: "npx claude-code-templates@latest",
    note: "npx @latest always pulls the newest catalog and components; no global install to upgrade.",
  },
  usage: [
    { command: "npx claude-code-templates@latest", description: "Launch the interactive picker to browse and install components." },
    { command: "--agent development-tools/code-reviewer --yes", description: "Install a specific agent from the catalog non-interactively." },
    { command: "--command performance/optimize-bundle --yes", description: "Install a custom slash command (e.g. /optimize-bundle)." },
    { command: "--mcp database/postgresql-integration --yes", description: "Add an external MCP integration (GitHub, Postgres, Stripe, AWS, etc.)." },
    { command: "--analytics", description: "Open the real-time Claude Code session analytics dashboard." },
    { command: "--health-check", description: "Run diagnostics on your Claude Code installation." },
  ],
  whenToUse: [
    "You want a curated, installable library of Claude Code agents, commands, MCPs, hooks, and settings instead of hand-writing each one.",
    "You need to drop a complete dev stack (agent + command + MCP) into a project in one command.",
    "You want to monitor Claude Code sessions in real time or run an install health check.",
    "You're assembling a team config and want to pull battle-tested community components by path.",
  ],
  howToUse: `No install step — run via \`npx\`. Browse the catalog interactively or install components by path.

\`\`\`bash
# Interactive browse + install
npx claude-code-templates@latest

# Install a full stack non-interactively
npx claude-code-templates@latest \\
  --agent development-team/frontend-developer \\
  --command testing/generate-tests \\
  --mcp development/github-integration --yes

# Single components
npx claude-code-templates@latest --agent development-tools/code-reviewer --yes
npx claude-code-templates@latest --hook git/pre-commit-validation --yes
\`\`\`

Extra tooling: \`--analytics\` (session dashboard), \`--chats\` / \`--chats --tunnel\` (conversation monitor), \`--health-check\`, and \`--plugins\` (plugin/marketplace dashboard). Full catalog at [aitmpl.com](https://aitmpl.com), docs at [docs.aitmpl.com](https://docs.aitmpl.com).`,
  whyUseful: `One of the largest and most popular Claude Code component hubs (Trendshift-featured, thousands of GitHub stars, backed by the Vercel, Neon, and Claude for Open Source programs). It aggregates 100+ agents, commands, MCPs, settings, hooks, and skills — including official Anthropic skills (anthropics/skills, anthropics/claude-code) and well-known community sources (wshobson/agents, obra/superpowers, awesome-claude-code) — behind a single \`npx\` installer and a searchable web UI. The bundled analytics, conversation monitor, and health-check tools make it a control panel for your whole Claude Code setup, not just a template dump.`,
  examplePrompt: "Use claude-code-templates to install the code-reviewer agent and the github-integration MCP into this project.",
  author: "Daniel Avila (davila7)",
  dateAdded: "2026-06-20",
};
