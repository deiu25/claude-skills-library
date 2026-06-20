import type { Skill } from "../types";

export const skill: Skill = {
  slug: "superclaude",
  name: "SuperClaude Framework",
  tagline: "Meta-framework adding 30 /sc: slash commands, 20 agents, and 7 behavioral modes to Claude Code via a pipx installer.",
  category: "workflow",
  tags: ["slash-commands", "agents", "workflow", "behavioral-modes", "mcp", "deep-research"],
  repo: "SuperClaude-Org/SuperClaude_Framework",
  install: {
    method: "manual-copy",
    command: "pipx install superclaude && superclaude install",
  },
  update: {
    command: "pipx upgrade superclaude && superclaude install",
    note: "Installed via pipx from PyPI. Re-run `superclaude install` after upgrading to refresh the /sc: commands; `superclaude doctor` verifies the setup. (v5.0 /plugin marketplace install is planned but not yet available.)",
  },
  usage: [
    { command: "superclaude install", description: "Install all 30 /sc: slash commands into Claude Code (run after pipx install)." },
    { command: "superclaude mcp --servers tavily --servers context7", description: "Install specific MCP servers (Tavily, Context7, etc.) for enhanced capabilities." },
    { command: "/sc:research \"latest AI developments 2024\"", description: "Autonomous multi-hop deep web research (Tavily MCP), depth quick to exhaustive." },
    { command: "/sc:brainstorm", description: "Structured brainstorming mode that asks clarifying questions before building." },
    { command: "/sc:implement", description: "Guided code implementation routed to the relevant specialized agent." },
    { command: "superclaude doctor", description: "Diagnose the installation and verify commands/MCP servers are wired up." },
  ],
  whenToUse: [
    "You want a ready-made set of lifecycle slash commands (/sc:brainstorm, /sc:implement, /sc:test, /sc:git, /sc:pm) instead of crafting prompts each time.",
    "You need autonomous, multi-hop deep web research from inside Claude Code with confidence scoring and source validation.",
    "You want 20 domain agents (security engineer, frontend architect, PM) and 7 behavioral modes that auto-coordinate based on context.",
    "You want token-efficiency and orchestration modes plus optional MCP servers (Serena, Sequential, Tavily) wired in via one CLI.",
  ],
  howToUse: `SuperClaude is a Python-packaged installer, not a marketplace plugin (the \`/plugin marketplace\` path is planned for v5.0 but not yet shipped).

Install via pipx, then register the commands:

\`\`\`bash
pipx install superclaude
superclaude install          # installs all 30 /sc: slash commands
superclaude mcp --list       # optional: list MCP servers
superclaude mcp              # optional: interactive MCP install
superclaude doctor           # verify
\`\`\`

Restart Claude Code, then use the commands:

\`\`\`text
/sc                 # list all 30 commands
/sc:brainstorm
/sc:research "quantum computing breakthroughs"
/sc:implement
\`\`\`

An npm wrapper (\`@bifrost_inc/superclaude\`) and a direct \`git clone\` + \`./install.sh\` are also documented.`,
  whyUseful: `One of the most popular community frameworks for Claude Code (PyPI package with heavy download counts, mentioned in Awesome Claude Code, with sibling SuperGemini/SuperQwen projects). It bundles 30 lifecycle slash commands, 20 specialized agents, 7 behavioral modes, and 8 optional MCP integrations behind a single CLI — turning Claude Code into a structured dev platform without hand-writing prompts. Its Deep Research mode (up to 5-hop search, 0.0-1.0 quality scoring, case-based cross-session learning) is a standout unique capability.`,
  examplePrompt: "/sc:research \"current state of WebGPU support across browsers\" and summarize findings with sources",
  author: "SuperClaude-Org",
  dateAdded: "2026-06-20",
};
