import type { Skill } from "../types";

export const skill: Skill = {
  slug: "planning-with-files",
  name: "Planning with Files",
  tagline: "Persistent file-based planning skill: keeps task_plan.md, findings.md, progress.md on disk so agents survive /clear and crashes.",
  category: "workflow",
  tags: ["planning", "context-management", "session-recovery", "hooks", "agent-skills", "manus"],
  repo: "OthmanAdi/planning-with-files",
  install: {
    method: "npx-skills",
    command: "npx skills add OthmanAdi/planning-with-files --skill planning-with-files -g",
  },
  update: {
    command: "npx skills add OthmanAdi/planning-with-files --skill planning-with-files -g",
    note: "Re-run the same `npx skills add` command to pull the latest release into each agent's discovery path. Plugin users: `/plugin marketplace update planning-with-files`.",
  },
  usage: [
    { command: "npx skills add OthmanAdi/planning-with-files --skill planning-with-files -g", description: "Install globally across any Agent Skills-compatible agent (Claude Code, Cursor, Codex, Gemini CLI, 60+ others)." },
    { command: "/plugin marketplace add OthmanAdi/planning-with-files", description: "Claude Code plugin route that also ships /plan slash commands; then /plugin install planning-with-files@planning-with-files." },
    { command: "/planning-with-files:plan", description: "Start a planning session (type /plan in autocomplete); creates task_plan.md, findings.md, progress.md." },
    { command: "/planning-with-files:status", description: "Show planning progress at a glance (alias /plan:status) from the on-disk plan files." },
    { command: "init-session --autonomous", description: "Opt-in autonomous mode: drops per-tool-call plan re-injection for strong models, keeps turn-start injection." },
    { command: "init-session --gated", description: "Add a Stop-hook completion gate that blocks the agent from stopping until the plan is actually done." },
  ],
  whenToUse: [
    "Multi-step coding or research tasks (3+ steps) spanning many tool calls where the agent tends to forget the original goal",
    "You want the agent to recover its plan and progress automatically after /clear, a crash, or a context reset",
    "You want a Stop-hook completion gate that blocks the agent from stopping until every phase is checked off",
    "You run long autonomous agent sessions and need durable on-disk state instead of volatile TodoWrite/context",
  ],
  howToUse: `Install once, then drive it with slash commands or the auto-firing hooks.

\`\`\`bash
# Global install across any Agent Skills agent
npx skills add OthmanAdi/planning-with-files --skill planning-with-files -g
\`\`\`

\`\`\`text
# Claude Code plugin route (adds /plan slash commands)
/plugin marketplace add OthmanAdi/planning-with-files
/plugin install planning-with-files@planning-with-files
\`\`\`

In a session, run \`/plan\` to start (creates \`task_plan.md\`, \`findings.md\`, \`progress.md\`) and \`/plan:status\` to check progress. Hooks re-inject the active plan at turn start, remind you to flush progress after file writes, and verify completion on Stop. For long runs, opt into \`init-session --autonomous\` (skip per-tool-call re-injection on strong models) or \`init-session --gated\` (Stop-hook completion gate). Other languages: append \`--skill planning-with-files-ar|-de|-es|-zh|-zht\`.`,
  whyUseful: `Implements the Manus "filesystem as working memory" pattern (Manus was acquired by Meta for $2B in Dec 2025), turning context-window volatility into durable on-disk plan state. README cites a skill-creator eval at 96.7% pass rate (29/30) vs 6.7% (2/30) without it, and 3/3 blind A/B wins for 3-file-pattern fidelity. It is unusually broad and well-maintained: one-command install across 60+ agents via the SKILL.md/Agent Skills standard, 17+ platform integrations with dedicated hooks, MIT-licensed, and shipping frequent releases (v3.x adds autonomous and gated modes plus SHA-256 attestation via /plan-attest).`,
  examplePrompt: "/plan Build a REST API for a todo app with auth, persistence, and tests — track phases in task_plan.md and don't stop until every phase is checked off.",
  author: "Ahmad Othman Ammar Adi (OthmanAdi)",
  dateAdded: "2026-06-20",
};
