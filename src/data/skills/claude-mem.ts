import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-mem",
  name: "claude-mem",
  tagline: "Persistent cross-session memory: observations captured automatically, searchable forever.",
  category: "productivity",
  tags: ["memory", "persistence", "search", "sessions"],
  repo: "thedotmack/claude-mem",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add thedotmack/claude-mem",
  },
  update: {
    command: "/plugin marketplace update claude-mem",
    note: "Then run /reload-plugins. Official marketplaces auto-update at startup.",
  },
  usage: [
    { command: "/claude-mem:mem-search", description: "Search past sessions in the memory database." },
    { command: "/claude-mem:make-plan", description: "Create phased plans with automatic doc discovery." },
    { command: "/claude-mem:do", description: "Execute a phased plan with subagents." },
    { command: "/claude-mem:timeline-report", description: "Generate a narrative project history report." },
  ],
  whenToUse: [
    "Long-running projects where context from past sessions keeps getting lost",
    "Answering questions like: did we already solve this? how did we do X last time?",
    "Generating project history reports and week-by-week development narratives",
  ],
  howToUse: `Once installed, it captures observations from every session automatically and injects relevant memory when topics recur. Query it directly:

\`\`\`
/claude-mem:mem-search   search past sessions
/claude-mem:make-plan    phased plans with doc discovery
/claude-mem:do           execute a phased plan with subagents
/claude-mem:timeline-report   narrative project history
\`\`\``,
  whyUseful: `Claude Code forgets everything between sessions by default. claude-mem turns past work into a searchable database, so decisions, fixes, and dead ends from last month are one query away instead of being re-derived from scratch. The make-plan/do pair is a capable planning-execution workflow on its own.`,
  examplePrompt: "/claude-mem:mem-search how did we fix the webhook race condition?",
  author: "thedotmack",
  dateAdded: "2026-06-12",
};
