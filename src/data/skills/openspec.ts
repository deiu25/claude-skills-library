import type { Skill } from "../types";

export const skill: Skill = {
  slug: "openspec",
  name: "OpenSpec",
  tagline: "Spec-driven development CLI: agree on proposals and specs with AI before code is written, via slash commands.",
  category: "workflow",
  tags: ["spec-driven-development", "workflow", "slash-commands", "cli", "planning", "ai-agents"],
  repo: "Fission-AI/OpenSpec",
  install: {
    method: "plugin",
    command: "npm install -g @fission-ai/openspec@latest && openspec init",
  },
  update: {
    command: "npm install -g @fission-ai/openspec@latest && openspec init",
    note: "Re-running the global install with @latest upgrades the CLI; re-run openspec init to refresh the scaffolded /opsx: commands.",
  },
  usage: [
    { command: "openspec init", description: "Scaffold the openspec/ directory and generate the /opsx: slash commands." },
    { command: "/opsx:propose <what-to-build>", description: "Draft a proposal with requirements/scenarios, design, and tasks." },
    { command: "/opsx:apply", description: "Implement the tasks from the proposal." },
    { command: "/opsx:archive", description: "Archive completed changes." },
  ],
  whenToUse: [
    "You want AI coding assistants to agree on a spec before writing code, instead of relying on chat history",
    "Starting a new feature and want a structured proposal, requirements, design, and task checklist",
    "You need a lightweight spec layer that works across Claude Code and 20+ other AI tools, not a heavyweight process",
    "You want each change tracked in its own folder with delta specs showing what is changing",
  ],
  howToUse: `OpenSpec is an npm-installed CLI that wires slash commands plus agent instructions into your project for Claude Code and 20+ other AI assistants.

\`\`\`bash
npm install -g @fission-ai/openspec@latest
cd your-project
openspec init
\`\`\`

\`openspec init\` scaffolds an \`openspec/\` directory and generates \`/opsx:\` slash commands. Drive the workflow from inside Claude Code:

\`\`\`
/opsx:propose <what-to-build>   # proposal, requirements/scenarios, design, tasks
/opsx:apply                     # implement the tasks
/opsx:archive                   # archive completed changes
\`\`\`

Each change gets its own folder (\`openspec/changes/<feature>/\`) with \`proposal.md\`, \`specs/\`, \`design.md\`, and \`tasks.md\`. Requires Node.js 20.19.0+.`,
  whyUseful: `OpenSpec puts a lightweight, reviewable spec layer between intent and code so AI assistants stop improvising from chat history. Its delta-spec model shows exactly what a change adds or modifies relative to current specs, each change is isolated in its own folder, and the same \`/opsx:\` workflow works across Claude Code and 20+ other AI tools, making it a portable team convention.`,
  examplePrompt: "/opsx:propose add rate limiting to the public API endpoints",
  author: "Fission-AI",
  dateAdded: "2026-06-14",
};
