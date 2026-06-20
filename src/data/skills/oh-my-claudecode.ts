import type { Skill } from "../types";

export const skill: Skill = {
  slug: "oh-my-claudecode",
  name: "oh-my-claudecode",
  tagline: "Teams-first multi-agent orchestration framework with planning, QA, and autopilot modes.",
  category: "workflow",
  tags: ["orchestration", "multi-agent", "autopilot", "planning", "plugin-suite"],
  repo: "Yeachan-Heo/oh-my-claudecode",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add Yeachan-Heo/oh-my-claudecode",
  },
  update: {
    command: "/plugin marketplace update oh-my-claudecode",
    note: "Then run /reload-plugins. Official marketplaces auto-update at startup.",
  },
  usage: [
    { command: "/oh-my-claudecode:autopilot", description: "Autonomous end-to-end execution until done." },
    { command: "/oh-my-claudecode:ultrawork", description: "Parallel multi-agent implementation." },
    { command: "/oh-my-claudecode:plan", description: "Interview-based planning to gather requirements." },
    { command: "/oh-my-claudecode:ultraqa", description: "QA cycles that loop until tests pass." },
    { command: "/oh-my-claudecode:cancel", description: "Stop any active mode." },
  ],
  whenToUse: [
    "Large tasks that benefit from multiple specialized agents working in parallel",
    "Autonomous work sessions (autopilot, ralph) that run until done",
    "Structured planning with interview-style requirement gathering",
    "QA loops that keep testing until a feature actually works",
  ],
  howToUse: `Install the marketplace, then drive it through slash commands. The big ones:

\`\`\`
/oh-my-claudecode:autopilot   autonomous end-to-end execution
/oh-my-claudecode:ultrawork   parallel multi-agent implementation
/oh-my-claudecode:plan        interview-based planning
/oh-my-claudecode:ultraqa     QA cycles until tests pass
/oh-my-claudecode:cancel      stop any active mode
\`\`\`

Each mode spawns and coordinates specialized subagents (architect, executor, verifier, designer) with shared state.`,
  whyUseful: `Claude Code is single-threaded by default: one context, one agent. OMC turns it into a coordinated team with explicit roles, persistent session state, and verification gates between phases. The practical win is on tasks too big for one context window: the orchestrator decomposes, delegates, and verifies instead of running out of room halfway through.`,
  examplePrompt: "/oh-my-claudecode:autopilot implement the billing page from the spec in docs/billing.md",
  author: "Yeachan-Heo",
  featured: true,
  dateAdded: "2026-06-12",
};
