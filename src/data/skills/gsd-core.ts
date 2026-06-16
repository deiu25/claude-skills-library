import type { Skill } from "../types";

export const skill: Skill = {
  slug: "gsd-core",
  name: "GSD Core",
  tagline:
    "Git. Ship. Done — a spec-driven framework that drives AI coding agents through a five-phase Discuss → Plan → Execute → Verify → Ship loop.",
  category: "workflow",
  tags: ["workflow", "spec-driven", "context-engineering", "agents", "planning"],
  repo: "open-gsd/gsd-core",
  install: {
    method: "npx-skills",
    command: "npx @opengsd/gsd-core@latest",
  },
  whenToUse: [
    "You want a disciplined, repeatable phase loop (Discuss, Plan, Execute, Verify, Ship) instead of ad-hoc prompting",
    "Your agent sessions degrade from 'context rot' on long tasks and you want heavy work pushed into fresh-context subagents",
    "You need structured artifacts (STATE.md, CONTEXT.md) so work survives across sessions and agent handoffs",
    "You run more than one AI runtime (Claude Code, Codex, Cursor, Gemini CLI, Copilot, Windsurf…) and want one shared workflow across all of them",
  ],
  howToUse: `Install with the npx command, then start a project with the \`/gsd-new-project\` slash command and let GSD walk you through the phase loop.

\`\`\`bash
npx @opengsd/gsd-core@latest
\`\`\`

The installer detects your runtime and lays down the GSD skills/commands. Inside the agent, run \`/gsd-new-project\` to scaffold, then iterate through the five phases: **Discuss** (lock scope and intent) → **Plan** (break work into waves) → **Execute** (run waves in parallel fresh-context subagents) → **Verify** (built-in checks before shipping) → **Ship**. The main session stays lean while each wave gets its own ~200k-token context, and progress is persisted to structured artifacts like \`STATE.md\` and \`CONTEXT.md\`.`,
  whyUseful: `GSD Core turns context engineering into an enforced process: instead of one long, rotting conversation, it splits work into parallel waves that each run in a clean subagent context and report back through durable artifacts. The five-phase loop puts a verification gate before every ship, and the same workflow installs across nine+ AI runtimes, so the discipline travels with you rather than being locked to one tool. MIT-licensed, ~4k stars, by the open-gsd org.`,
  examplePrompt: "/gsd-new-project a CLI that summarizes my unread email each morning",
  author: "open-gsd",
  dateAdded: "2026-06-16",
};
