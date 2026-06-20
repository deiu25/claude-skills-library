import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-sdlc-wizard",
  name: "Claude Code SDLC Wizard",
  tagline: "Self-evolving SDLC enforcement for Claude Code: plan-before-code, TDD hooks, self-review, and CI compliance scoring.",
  category: "workflow",
  tags: ["sdlc", "tdd", "hooks", "ci", "code-quality", "workflow"],
  repo: "BaseInfinity/claude-sdlc-wizard",
  install: {
    method: "manual-copy",
    command: "npx -y agentic-sdlc-wizard@latest init",
  },
  update: {
    command: "npx agentic-sdlc-wizard@latest init",
    note: "Re-run init to pull the newest CLI (the @latest pin defeats npx cache). For in-session content drift, run the generated `/update` skill — Claude reads CHANGELOG.md and offers to apply changes — or `npx agentic-sdlc-wizard check` to report MATCH/DRIFT per file.",
  },
  usage: [
    { command: "npx -y agentic-sdlc-wizard@latest init", description: "Scaffold hooks, skills, settings, and bespoke CLAUDE.md/SDLC.md/TESTING.md/ARCHITECTURE.md into your repo." },
    { command: "npx agentic-sdlc-wizard check --json", description: "Report MATCH/CUSTOMIZED/MISSING/DRIFT per installed file; exits non-zero on drift for CI." },
    { command: "/sdlc", description: "Generated skill that runs the plan-then-TDD-then-self-review SDLC compliance flow for a task." },
    { command: "/update", description: "In-session update check: Claude reads CHANGELOG.md and offers to apply newer wizard changes." },
    { command: "/feedback", description: "File a bug/feature/question from inside a session; auto-fills context and redacts secrets." },
    { command: "/setup", description: "Re-run or extend wizard setup to regenerate hooks and SDLC docs for the current stack." },
  ],
  whenToUse: [
    "You want Claude Code to plan before coding, write tests first, and self-review automatically without manual reminders.",
    "You need every PR to get an automated 0-10 SDLC compliance score in CI, with before/after A/B testing.",
    "You want a TDD-enforcing PreToolUse hook that nudges Claude to write the failing test before editing source.",
    "You want an SDLC config that evolves over time and tracks whether it is actually making the agent better.",
  ],
  howToUse: `Install scaffolds the system into your repo, then restart Claude Code so hooks load:

\`\`\`bash
npx -y agentic-sdlc-wizard@latest init
# then in Claude Code: /exit, then \`claude\` to reload hooks
\`\`\`

First prompt auto-invokes setup — Claude scans your stack (package.json, test framework, deploy targets) and generates \`.claude/hooks/*.sh\`, \`.claude/skills/*/SKILL.md\`, \`.claude/settings.json\`, and bespoke \`CLAUDE.md\`, \`SDLC.md\`, \`TESTING.md\`, \`ARCHITECTURE.md\`. No manual commands needed.

Verify the install (CI-friendly):

\`\`\`bash
npx agentic-sdlc-wizard check --json   # non-zero exit on MISSING/DRIFT
\`\`\`

Day-to-day, drive work with the generated \`/sdlc\` skill, check for newer wizard versions with \`/update\`, and file issues with \`/feedback\`. For high-stakes changes the README documents a required Codex cross-model review loop (a different model from a different vendor grades Claude's output). Alternative installs (curl, Homebrew, \`gh extension install\`, \`npx github:\`, global npm) are in the README.`,
  whyUseful: `Most Claude Code SDLC tooling is either a passive doc or a one-shot prompt; this is the rare one that *measures itself* — E2E compliance scoring (0-10) in CI with 95% confidence intervals (5 trials, t-distribution), before/after A/B comparing main vs the PR wizard, and CUSUM drift detection borrowed from manufacturing QC to separate "the model had a bad day" from "our SDLC broke." It is opinionated and self-evolving (weekly Claude Code release + community scans, monthly deep research, all opening PRs), with a required Codex cross-model review for high-stakes changes. One npx command installs hooks + skills + bespoke SDLC docs tuned to your actual stack; 31 stars and 66 releases show active iteration.`,
  examplePrompt: "Run /sdlc to add rate limiting to the login endpoint — plan first, write the failing test, then implement and self-review.",
  author: "BaseInfinity",
  dateAdded: "2026-06-20",
};
