import type { Skill } from "../types";

export const skill: Skill = {
  slug: "taches-cc-resources",
  name: "TÂCHES CC Resources",
  tagline: "27 slash commands, 9 skills, 3 auditor agents for planning, meta-prompting, thinking models, and Ralph autonomous coding.",
  category: "meta",
  tags: ["slash-commands", "skills", "meta-prompting", "planning", "thinking-models", "agents"],
  repo: "glittercowboy/taches-cc-resources",
  install: {
    method: "marketplace",
    command: "claude plugin marketplace add glittercowboy/taches-cc-resources",
  },
  update: {
    command: "claude plugin marketplace add glittercowboy/taches-cc-resources",
    note: "README documents no dedicated update command. Re-run the marketplace add to refresh, then /reload-plugins (or restart Claude Code). Manual installs update via `git pull` then re-copy into ~/.claude/.",
  },
  usage: [
    { command: "claude plugin install taches-cc-resources", description: "Install the bundle after adding the marketplace." },
    { command: "/create-plan", description: "Invoke the Create Plans skill for hierarchical project planning; pair with /run-plan <path> to execute PLAN.md phases." },
    { command: "/create-agent-skill", description: "Scaffold a new SKILL.md from a workflow description (also /create-slash-command, /create-subagent, /create-hook, /create-mcp-server)." },
    { command: "/consider:first-principles", description: "Apply a thinking-model lens (also pareto, inversion, second-order, 5-whys, occams-razor, swot, eisenhower-matrix, via-negativa, and more)." },
    { command: "/debug", description: "Deep-analysis debugging command backed by the Debug Like Expert skill." },
    { command: "/audit-skill", description: "Run the skill-auditor agent to check a skill against best practices (also /audit-slash-command, /audit-subagent)." },
  ],
  whenToUse: [
    "You want a ready-made set of authoring commands to scaffold and audit your own skills, slash commands, subagents, hooks, and MCP servers.",
    "You plan multi-step projects and want /create-plan + /run-plan for hierarchical planning and segmented execution.",
    "You want structured thinking-model prompts (Pareto, first principles, inversion, SWOT, Eisenhower) as one-line commands.",
    "You want to set up Geoffrey Huntley's Ralph autonomous-coding loop via the Setup Ralph skill.",
  ],
  howToUse: `Install via the plugin marketplace:

\`\`\`bash
claude plugin marketplace add glittercowboy/taches-cc-resources
claude plugin install taches-cc-resources
\`\`\`

Or install manually:

\`\`\`bash
git clone https://github.com/glittercowboy/taches-cc-resources.git
cd taches-cc-resources
cp -r commands/* ~/.claude/commands/
cp -r skills/* ~/.claude/skills/
\`\`\`

Then drive a project with \`/create-plan\` to invoke the Create Plans skill and \`/run-plan <path-to-PLAN.md>\` to execute phases with intelligent segmentation. Use the \`/create-*\` commands (agent-skill, subagent, slash-command, hook, meta-prompt, mcp-server) to author new extensions and the \`/audit-*\` commands plus the \`/heal-skill\` command to validate and self-improve them.`,
  whyUseful: `A single bundle covering the full extension-authoring loop — create, audit, and self-heal skills, slash commands, subagents, hooks, and MCP servers — plus practical planning (/create-plan, /run-plan), 12 thinking-model commands, and a Ralph autonomous-coding setup. It earns a place as one of the more complete "meta" CC toolkits: instead of one skill it ships 27 commands, 9 skills, and 3 dedicated auditor agents that enforce best practices on your own resources, with a documented one-line marketplace install and a community OpenCode port. Author TÂCHES maintains it as an actively published, opinionated workflow kit.`,
  examplePrompt: "/create-plan build a REST API for a task tracker with auth, then /run-plan PLAN.md",
  author: "TÂCHES",
  dateAdded: "2026-06-20",
};
