import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-task-master",
  name: "Task Master AI",
  tagline: "MCP server that parses PRDs into dependency-aware tasks, then drives the build through Claude Code.",
  category: "workflow",
  tags: ["task-management", "mcp-server", "prd", "workflow", "planning", "claude-code"],
  repo: "eyaltoledano/claude-task-master",
  install: {
    method: "plugin",
    command: "claude mcp add taskmaster-ai -- npx -y task-master-ai",
  },
  update: {
    command: "claude mcp add taskmaster-ai -- npx -y task-master-ai",
    note: "npx-launched MCP server: re-running add (or restarting the client) fetches the newest task-master-ai release. For the global CLI, run npm install -g task-master-ai.",
  },
  usage: [
    { command: "claude mcp add taskmaster-ai -- npx -y task-master-ai", description: "Register Taskmaster as an MCP server in Claude Code." },
    { command: "task-master init", description: "Initialize Taskmaster in a project (creates .taskmaster structure and config)." },
    { command: "task-master parse-prd <file>", description: "Convert a requirements doc (PRD) into structured, dependency-aware tasks." },
    { command: "task-master next", description: "Surface the next task to work on based on status and dependencies." },
    { command: "task-master research", description: "Run AI-powered research with full project context." },
    { command: "--env TASK_MASTER_TOOLS='core'", description: "Load a leaner MCP toolset (core/standard/all) to control context cost." },
  ],
  whenToUse: [
    "You have a PRD or spec and want it broken into ordered, dependency-aware tasks instead of an unstructured backlog.",
    "You want Claude Code to track task status, pick the next task, and expand subtasks across a multi-step build.",
    "You want AI-driven development without provider API keys, using the claude-code/opus or claude-code/sonnet models.",
    "You need a shared task system that works across Cursor, Windsurf, VS Code, and Claude Code via MCP.",
  ],
  howToUse: `This is an **MCP server**, not a skill or plugin. Register it once with Claude Code:

\`\`\`bash
claude mcp add taskmaster-ai -- npx -y task-master-ai
\`\`\`

Then initialize a project and parse a PRD:

\`\`\`bash
task-master init
task-master parse-prd .taskmaster/docs/prd.txt
task-master next
\`\`\`

Configure models with \`task-master models\`. The \`claude-code/opus\` and \`claude-code/sonnet\` models require no provider API key — just the Claude Code CLI. To trim context cost, register with a smaller toolset via the env flag:

\`\`\`bash
claude mcp add taskmaster-ai --env TASK_MASTER_TOOLS='core' -- npx -y task-master-ai
\`\`\`

\`TASK_MASTER_TOOLS\` accepts \`all\`, \`standard\`, \`core\` (alias \`lean\`), or a custom comma-separated tool list.`,
  whyUseful: `One of the most popular AI-development task managers, by @eyaltoledano and @RalphEcom, with tens of thousands of GitHub stars. It turns a PRD into a concrete, dependency-ordered task graph and feeds tasks to the agent one at a time, which keeps long builds focused instead of letting the agent wander. Selective MCP tool loading lets you trade capability for context budget, and it runs key-free on Claude Code models.`,
  examplePrompt: "Parse my PRD at .taskmaster/docs/prd.txt into tasks, then show me the next one to implement.",
  author: "Eyal Toledano & Ralph (@RalphEcom)",
  dateAdded: "2026-06-20",
};
