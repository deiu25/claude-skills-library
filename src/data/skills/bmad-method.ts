import type { Skill } from "../types";

export const skill: Skill = {
  slug: "bmad-method",
  name: "BMad Method",
  tagline: "AI-driven agile framework installing planning/dev agents and workflows into Claude Code via its own npx installer.",
  category: "workflow",
  tags: ["agile", "workflow", "agents", "planning", "methodology", "sdlc"],
  repo: "bmad-code-org/BMAD-METHOD",
  install: {
    method: "plugin",
    command: "npx bmad-method install --modules bmm --tools claude-code",
  },
  update: {
    command: "npx bmad-method install",
    note: "BMad ships its own npx installer, not a Claude plugin marketplace; re-running it fetches and reinstalls the latest version (scope with --modules bmm --tools claude-code).",
  },
  usage: [
    { command: "npx bmad-method install", description: "Interactive installer; run again to update an existing install." },
    { command: "npx bmad-method install --modules bmm --tools claude-code", description: "Install the core BMM module scoped to Claude Code." },
    { command: "bmad-help", description: "In-session skill that surfaces guidance on the generated agents and workflows." },
    { command: "Party Mode", description: "Brings multiple agent personas (PM, Architect, Developer, UX) into one session." },
    { command: "PM / Architect / Developer / UX agents", description: "Invoke the generated role agents and multi-stage workflows inside Claude Code." },
  ],
  whenToUse: [
    "You want a structured, scale-adaptive agile process (analysis, PM, architecture, implementation) driven by AI agents inside Claude Code",
    "Starting a greenfield project and want generated PRD, architecture, and task workflows rather than ad-hoc prompting",
    "You need named role agents (PM, Architect, Developer, UX) and ready-made multi-stage workflows",
    "You work across multiple AI IDEs (Claude Code, Cursor, Gemini, ChatGPT) and want one shared methodology",
  ],
  howToUse: `Install with the project's own CLI, targeting Claude Code as the tool:

\`\`\`bash
# interactive:
npx bmad-method install
# scoped to Claude Code + core module:
npx bmad-method install --modules bmm --tools claude-code
\`\`\`

Prerequisites: Node.js v20.12+, plus Python 3.10+ and \`uv\`. Follow the installer prompts, then open the project in Claude Code and invoke the generated agents/commands. The \`bmad-help\` skill provides in-session guidance, and "Party Mode" brings multiple agent personas into one session. The core BMM module ships 34+ workflows and 12+ domain-expert agents (PM, Architect, Developer, UX); optional modules add Test Architect, Game Dev Studio, and a Creative Intelligence Suite.`,
  whyUseful: `BMad Method packages a complete, opinionated agile SDLC as reusable AI agents and facilitated workflows that its installer drops directly into Claude Code (via \`--tools claude-code\`), turning vague "build me an app" sessions into structured analysis -> planning -> architecture -> implementation passes. Among the most popular AI agentic-development methodologies, its scale-adaptive workflows and named role agents give teams a shared, repeatable process across AI IDEs. Free and MIT-licensed.`,
  examplePrompt: "Use the BMad PM agent to draft a PRD for this feature, then hand off to the Architect workflow.",
  author: "bmad-code-org",
  dateAdded: "2026-06-14",
};
