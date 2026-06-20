import type { Skill } from "../types";

export const skill: Skill = {
  slug: "wshobson-agents",
  name: "wshobson/agents",
  tagline: "Plugin marketplace: 84 plugins, 192 subagents, 156 skills, 102 commands across architecture, languages, infra, security, ML.",
  category: "meta",
  tags: ["subagents", "marketplace", "skills", "slash-commands", "orchestration", "multi-harness"],
  repo: "wshobson/agents",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add wshobson/agents",
  },
  update: {
    command: "/plugin marketplace update agents",
    note: "Then run /reload-plugins (or restart Claude Code). Marketplaces re-sync at startup.",
  },
  usage: [
    { command: "/plugin marketplace add wshobson/agents", description: "Register the marketplace in Claude Code." },
    { command: "/plugin install python-development", description: "Install one of 84 single-purpose plugins (here: 3 Python agents + 16 skills)." },
    { command: "/plugin install plugin-eval", description: "Add the three-layer (static / LLM-judge / Monte Carlo) plugin quality evaluator." },
    { command: "uv run plugin-eval score path/to/skill --depth quick", description: "Score a skill's structural and semantic quality with plugin-eval." },
    { command: "npx codex-marketplace add wshobson/agents", description: "Install natively into Codex CLI (also Cursor/OpenCode/Gemini/Copilot supported)." },
  ],
  whenToUse: [
    "You want a broad, curated library of production-ready subagents (language pros, security, infra, ML, SEO) instead of writing them yourself.",
    "You need composable per-domain plugins where installing one loads only its agents/skills/commands into context.",
    "You want multi-agent orchestrators for full-stack, security review, ML, or incident-response workflows.",
    "You run the same agent definitions across Claude Code plus Codex, Cursor, OpenCode, Gemini, or Copilot from one source.",
  ],
  howToUse: `Add the marketplace, then install only the plugins you need (each is isolated and composable):

\`\`\`bash
/plugin marketplace add wshobson/agents
/plugin install python-development      # one of 84 plugins
\`\`\`

Browse the catalog with [docs/plugins.md](https://github.com/wshobson/agents/blob/main/docs/plugins.md), [docs/agents.md](https://github.com/wshobson/agents/blob/main/docs/agents.md), and [docs/agent-skills.md](https://github.com/wshobson/agents/blob/main/docs/agent-skills.md). Agents use a tiered model strategy (Opus for architecture/security, Sonnet for docs/testing, Haiku for fast ops). Evaluate plugin/skill quality with the bundled \`plugin-eval\`:

\`\`\`bash
uv run plugin-eval certify path/to/skill
\`\`\`

Non-Claude harnesses install via \`npx codex-marketplace add wshobson/agents\` (Codex/Cursor) or clone + \`make generate HARNESS=<name>\` (Gemini/OpenCode).`,
  whyUseful: `One of the most-starred Claude Code agent collections, by Seth Hobson (wshobson) — 192 domain-expert subagents, 156 skills, and 102 commands packaged as 84 granular, single-purpose plugins so you load only what you need. It ships a real tiered model strategy (Opus/Sonnet/Haiku per task), 16 multi-agent orchestrators, and a \`plugin-eval\` quality framework. The same Markdown source emits harness-native artifacts for Codex, Cursor, OpenCode, Gemini, and Copilot, so the library is portable beyond Claude Code.`,
  examplePrompt: "Install the python-development and security plugins, then use the orchestrator to review this FastAPI service for vulnerabilities and missing tests.",
  author: "Seth Hobson (wshobson)",
  dateAdded: "2026-06-20",
};
