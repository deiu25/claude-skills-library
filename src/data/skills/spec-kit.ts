import type { Skill } from "../types";

export const skill: Skill = {
  slug: "spec-kit",
  name: "Spec Kit",
  tagline: "GitHub's CLI for Spec-Driven Development: scaffolds /speckit.* slash commands into Claude Code and 30+ agents.",
  category: "workflow",
  tags: ["spec-driven-development", "workflow", "cli", "slash-commands", "planning", "methodology"],
  repo: "github/spec-kit",
  install: {
    method: "plugin",
    command: "uv tool install specify-cli --from git+https://github.com/github/spec-kit.git",
  },
  update: {
    command: "uv tool install specify-cli --force --from git+https://github.com/github/spec-kit.git",
    note: "Re-running with --force upgrades the specify-cli tool to the latest commit; then re-run specify init in your project to refresh the scaffolded /speckit.* commands.",
  },
  usage: [
    { command: "specify init my-project --integration claude", description: "Scaffold a new Spec-Driven Development project for Claude Code." },
    { command: 'specify init --integration-options="--skills"', description: "Scaffold the workflow as agent skills instead of slash-command files." },
    { command: "/speckit.constitution", description: "Establish project principles before specifying." },
    { command: "/speckit.specify", description: "Describe WHAT to build (the spec)." },
    { command: "/speckit.clarify", description: "Resolve ambiguities in the spec." },
    { command: "/speckit.plan", description: "Define the technical approach for the spec." },
    { command: "/speckit.tasks", description: "Break the plan into discrete tasks." },
    { command: "/speckit.analyze", description: "Cross-artifact consistency check before implementing." },
    { command: "/speckit.implement", description: "Execute the generated tasks." },
  ],
  whenToUse: [
    "Starting a new feature or project and you want to define the spec, plan, and tasks before any code is generated",
    "You want a repeatable workflow (constitution to spec to plan to tasks to implement) driving Claude Code rather than ad-hoc prompting",
    "You need cross-artifact consistency checks (/speckit.analyze) and a clarification pass before implementation",
    "You work across multiple AI agents and want a consistent spec-driven process",
  ],
  howToUse: `Spec Kit is a Python CLI (\`specify-cli\`) installed with \`uv\` (or pipx) that scaffolds the SDD workflow into your repo, writing \`/speckit.*\` slash-command files into \`.claude/commands/\` (or, with \`--integration-options="--skills"\`, agent skills).

\`\`\`bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init my-project --integration claude
cd my-project
\`\`\`

Run the workflow as slash commands inside Claude Code:

1. \`/speckit.constitution\` — establish project principles
2. \`/speckit.specify\` — describe WHAT to build
3. \`/speckit.clarify\` — resolve ambiguities
4. \`/speckit.plan\` — define the technical approach
5. \`/speckit.tasks\` — break the plan into tasks
6. \`/speckit.analyze\` — cross-artifact consistency check
7. \`/speckit.implement\` — execute the tasks`,
  whyUseful: `GitHub's official, very widely adopted toolkit for Spec-Driven Development, turning Claude Code from ad-hoc prompting into a disciplined constitution-to-spec-to-plan-to-tasks-to-implement pipeline. It ships reusable \`/speckit.*\` slash commands so the methodology is enforced directly in the editor rather than living in a doc, and is agent-agnostic (30+ agents) with Claude Code as a first-class integration.`,
  examplePrompt: "/speckit.specify Build a URL shortener with click analytics and per-link expiry",
  author: "GitHub",
  dateAdded: "2026-06-14",
};
