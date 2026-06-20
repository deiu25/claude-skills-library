import type { Skill } from "../types";

export const skill: Skill = {
  slug: "beads",
  name: "Beads MCP",
  tagline: "MCP server wrapping the bd issue tracker — gives agents a dependency-aware graph for persistent, long-horizon task memory.",
  category: "mcp",
  tags: ["mcp-server", "issue-tracker", "agent-memory", "dependency-graph", "dolt", "task-tracking"],
  repo: "gastownhall/beads",
  install: {
    method: "plugin",
    command: "uv tool install beads-mcp && claude mcp add beads -- beads-mcp",
  },
  update: {
    command: "uv tool upgrade beads-mcp",
    note: "Re-run after upgrading the package; also keep the bd CLI current (brew upgrade beads / npm i -g @beads/bd). The MCP server shells out to bd.",
  },
  usage: [
    { command: "ready", description: "List tasks whose blockers are all closed — the agent's work queue." },
    { command: "create", description: "Create an issue (bug/feature/task/epic/chore) with priority and dependencies." },
    { command: "show", description: "View a task's details, audit trail, and dependencies by id." },
    { command: "update", description: "Update fields or claim a task (set assignee + status)." },
    { command: "dep", description: "Add or inspect blocks / parent-child / relates-to links between issues." },
    { command: "blocked", description: "List tasks currently blocked by open dependencies." },
  ],
  whenToUse: [
    "You want a coding agent to track long-horizon work in a real dependency graph instead of drifting markdown TODO lists.",
    "You run multi-agent or multi-branch workflows and need hash-based IDs (bd-a1b2) that don't collide on merge.",
    "You want persistent project memory the agent can recall across sessions, with old closed tasks auto-summarized to save context.",
    "You need a Dolt-backed, version-controlled issue store that syncs across machines via Dolt remotes.",
  ],
  howToUse: `This is an **MCP server** that wraps the \`bd\` (beads) CLI, so install both. First install the CLI system-wide:

\`\`\`bash
brew install beads          # macOS / Linux
# or: npm install -g @beads/bd
\`\`\`

Then install and register the MCP server:

\`\`\`bash
uv tool install beads-mcp   # or: pip install beads-mcp
claude mcp add beads -- beads-mcp
\`\`\`

The README also documents an equivalent JSON config: \`{"mcpServers":{"beads":{"command":"beads-mcp"}}}\`.

Initialize beads inside a project (\`bd init\`, or the \`init\` MCP tool), then the agent calls \`ready\` to pull unblocked work, \`create\` / \`update\` to manage tasks, and \`dep\` / \`blocked\` to reason over dependencies. The \`beads://quickstart\` resource ships agent usage guidance.`,
  whyUseful: `From Steve Yegge, org-maintained under gastownhall and actively released (latest v1.0.5). It solves a real agent failure mode — losing context on long tasks — by giving agents a structured, dependency-aware issue graph instead of brittle markdown plans. The Dolt backend brings cell-level merge, native branching, and hash IDs that make multi-agent and multi-branch work conflict-free, plus semantic memory-decay that summarizes old closed tasks to keep the context window lean.`,
  examplePrompt: "Use beads to break this refactor into an epic with subtasks, then call ready and claim the first unblocked one.",
  author: "Steve Yegge / gastownhall",
  dateAdded: "2026-06-20",
};
