import type { Skill } from "../types";

export const skill: Skill = {
  slug: "addyosmani-agent-skills",
  name: "Agent Skills",
  tagline: "Addy Osmani's 24-skill development-lifecycle pack: spec, plan, build, test, review, ship with enforced quality gates.",
  category: "workflow",
  tags: ["workflow", "development-lifecycle", "code-quality", "testing", "tdd", "slash-commands"],
  repo: "addyosmani/agent-skills",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add addyosmani/agent-skills",
  },
  update: {
    command: "/plugin marketplace update addy-agent-skills",
    note: "README documents no explicit update command; this follows the marketplace slug `addy-agent-skills`. After updating, run /reload-plugins (or restart Claude Code) to pick up new skill versions.",
  },
  usage: [
    { command: "/plugin install agent-skills@addy-agent-skills", description: "Install the pack from the marketplace after adding it." },
    { command: "/spec", description: "Write a PRD covering objectives, structure, code style, testing, and boundaries before any code." },
    { command: "/plan", description: "Decompose the spec into small, verifiable, dependency-ordered tasks with acceptance criteria." },
    { command: "/build auto", description: "Approve the plan once, then implement every task test-driven and committed individually, autonomously." },
    { command: "/review", description: "Five-axis code review with severity labels and ~100-line change sizing before merge." },
    { command: "/ship", description: "Run pre-launch checklists, staged rollouts, feature-flag lifecycle, and rollback procedures." },
  ],
  whenToUse: [
    "You want an AI agent to follow senior-engineer discipline across the whole lifecycle instead of taking the shortest path.",
    "Starting a new project or feature and want a spec and task breakdown enforced before code is written.",
    "You want test-driven, incrementally committed implementation with verification gates rather than a single large diff.",
    "Preparing to ship and need pre-launch checklists, staged rollout, and rollback procedures baked into the workflow.",
  ],
  howToUse: `Install in Claude Code via the marketplace, then install the plugin:

\`\`\`
/plugin marketplace add addyosmani/agent-skills
/plugin install agent-skills@addy-agent-skills
\`\`\`

Drive the lifecycle with the 7 slash commands (\`/spec\`, \`/plan\`, \`/build\`, \`/test\`, \`/review\`, \`/code-simplify\`, \`/ship\`). Skills also auto-activate by task — building UI triggers \`frontend-ui-engineering\`, designing an API triggers \`api-and-interface-design\`. Use \`/build auto\` to approve a plan once and run every task autonomously (still test-driven and committed per task, pausing on failures).

Local/dev install without the marketplace:

\`\`\`bash
git clone https://github.com/addyosmani/agent-skills.git
claude --plugin-dir /path/to/agent-skills
\`\`\`

If the marketplace clone fails over SSH, use the HTTPS URL form: \`/plugin marketplace add https://github.com/addyosmani/agent-skills.git\`. Setup guides for Cursor, Gemini CLI, Antigravity, Windsurf, Copilot, Kiro, and OpenCode live under \`docs/\`.`,
  whyUseful: `From Addy Osmani (Google Chrome engineering lead, prolific web-performance author), so the practices carry real weight: skills bake in concepts from *Software Engineering at Google* and Google's eng-practices guide — Hyrum's Law, the test pyramid and Beyonce Rule, Chesterton's Fence, trunk-based development, Shift Left. It's not generic prompts but 24 process-driven workflows with anti-rationalization tables (excuses agents use to skip steps, plus counter-arguments) and non-negotiable verification gates. The 4 specialist review personas and 5 reference checklists compose with the slash commands for targeted quality passes.`,
  examplePrompt: "/spec a rate-limiting middleware for our Express API, then /plan and /build it",
  author: "Addy Osmani",
  dateAdded: "2026-06-20",
};
