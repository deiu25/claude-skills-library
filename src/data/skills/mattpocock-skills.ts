import type { Skill } from "../types";

export const skill: Skill = {
  slug: "mattpocock-skills",
  name: "Skills For Real Engineers",
  tagline: "Matt Pocock's composable Claude Code skills for TDD, requirement grilling, diagnosis, and architecture improvement.",
  category: "workflow",
  tags: ["workflow", "tdd", "architecture", "code-quality", "skill-collection", "agentic-engineering"],
  repo: "mattpocock/skills",
  install: {
    method: "npx-skills",
    command: "npx skills@latest add mattpocock/skills",
  },
  update: {
    command: "npx skills@latest add mattpocock/skills",
    note: "Re-running the installer fetches the latest version; re-select the skills/agents you want.",
  },
  usage: [
    { command: "/setup-matt-pocock-skills", description: "One-time per-repo setup to configure issue tracker and docs paths." },
    { command: "/grill-me", description: "Interview you to reach shared understanding before coding." },
    { command: "/tdd", description: "Enforce a real red-green-refactor TDD loop." },
    { command: "/diagnose", description: "Run a disciplined debugging loop for a hard bug or perf regression." },
    { command: "/improve-codebase-architecture", description: "Guided architectural deepening for a ball-of-mud codebase." },
    { command: "/to-prd, /to-issues, /triage, /zoom-out, /prototype, /handoff", description: "Productivity and misc slash commands from the collection." },
  ],
  whenToUse: [
    "You want Claude to interview you and reach shared understanding before writing code (grill-me / grill-with-docs)",
    "You want to enforce a real TDD red-green-refactor loop instead of one-shot code generation (tdd)",
    "You need a disciplined debugging loop for a hard bug or performance regression (diagnose)",
    "You're fighting a 'ball of mud' codebase and want guided architectural deepening (improve-codebase-architecture)",
  ],
  howToUse: `Install with the skills.sh installer, select the skills and agents you want, then run the one-time setup once per repo to configure your issue tracker and docs paths.

\`\`\`bash
npx skills@latest add mattpocock/skills
\`\`\`

Then in Claude Code:

\`\`\`
/setup-matt-pocock-skills
\`\`\`

Invoke individual skills as slash commands: \`/grill-me\`, \`/grill-with-docs\`, \`/tdd\`, \`/diagnose\`, \`/improve-codebase-architecture\`, \`/to-prd\`, \`/to-issues\`, \`/triage\`, \`/zoom-out\`, \`/prototype\`, \`/handoff\`. The collection (19 skills) is grouped into Engineering, Productivity, and Misc — including \`git-guardrails-claude-code\` to block dangerous git commands and \`write-a-skill\`.`,
  whyUseful: `A widely-used collection maintained directly from Matt Pocock's own \`.claude\` directory, so it reflects real day-to-day engineering rather than a demo. Instead of one prescriptive framework, it offers small, composable, model-agnostic skills that target specific AI-coding failure modes — misalignment, verbosity, broken code, and architectural decay — turning the agent into a disciplined engineering participant.`,
  examplePrompt: "/grill-me then /tdd to build the new auth flow",
  author: "mattpocock (Matt Pocock)",
  dateAdded: "2026-06-14",
};
