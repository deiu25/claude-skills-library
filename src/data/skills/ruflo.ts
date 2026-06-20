import type { Skill } from "../types";

export const skill: Skill = {
  slug: "ruflo",
  name: "Ruflo",
  tagline: "Multi-agent harness for Claude Code: 33 plugins for swarms, vector memory, self-learning, and federation.",
  category: "workflow",
  tags: ["multi-agent", "orchestration", "swarm", "mcp-server", "memory", "automation"],
  repo: "ruvnet/ruflo",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add ruvnet/ruflo",
  },
  update: {
    command: "/plugin marketplace update ruflo",
    note: "Then run /reload-plugins. Official marketplaces auto-update at startup.",
  },
  usage: [
    { command: "/plugin install ruflo-core@ruflo", description: "Install the core orchestration plugin from the marketplace." },
    { command: "/plugin install ruflo-swarm@ruflo", description: "Add the swarm plugin for self-organizing multi-agent runs." },
    { command: "/plugin install ruflo-rag-memory@ruflo", description: "Add the HNSW-indexed vector memory (AgentDB) plugin." },
    { command: "npx ruflo@latest init wizard", description: "CLI path: scaffold the full loop (98 agents, hooks, daemon)." },
    { command: "claude mcp add ruflo -- npx ruflo@latest mcp start", description: "Register the Ruflo MCP server for the full orchestration toolset." },
  ],
  whenToUse: [
    "You want to orchestrate many specialized AI agents (swarms) inside Claude Code instead of running one agent at a time",
    "You need persistent, retrievable agent memory across sessions (HNSW-indexed vector store / AgentDB)",
    "You want background workers that auto-trigger tasks like audits, optimizations, and test generation",
    "You need agents to collaborate across machines or trust boundaries (federation with zero-trust auth and PII filtering)",
  ],
  howToUse: `Add the marketplace, then install the plugins you want:

\`\`\`bash
/plugin marketplace add ruvnet/ruflo
/plugin install ruflo-core@ruflo
/plugin install ruflo-swarm@ruflo
/plugin install ruflo-rag-memory@ruflo
\`\`\`

There are 33 plugins across orchestration, memory/knowledge, intelligence/learning, code-quality/testing, security, methodology, and DevOps. The README labels this marketplace path as "lite" (slash commands only, no MCP server). For the full loop (98 agents, MCP server, hooks, daemon) use the CLI path and register the MCP server:

\`\`\`bash
npx ruflo@latest init wizard
claude mcp add ruflo -- npx ruflo@latest mcp start
\`\`\``,
  whyUseful: `Ruflo turns Claude Code from a single-agent assistant into a multi-agent harness: self-organizing swarms, an HNSW-indexed vector memory (AgentDB) that persists across sessions, self-learning via neural patterns/ReasoningBank, and background workers that auto-run audits, optimizations, and test generation. It ships as a real plugin marketplace (33 plugins) plus an optional MCP server exposing hundreds of orchestration tools, so you adopt only the pieces you need.`,
  examplePrompt: "Initialize a Ruflo swarm to refactor this module: spawn a planner, two coders, and a reviewer with shared memory.",
  author: "ruvnet",
  dateAdded: "2026-06-14",
};
