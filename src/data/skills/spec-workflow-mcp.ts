import type { Skill } from "../types";

export const skill: Skill = {
  slug: "spec-workflow-mcp",
  name: "Spec Workflow MCP",
  tagline: "MCP server for spec-driven development: sequential Requirements to Design to Tasks flow with a live dashboard and approval gates.",
  category: "mcp",
  tags: ["mcp-server", "spec-driven", "workflow", "dashboard", "approvals", "vscode"],
  repo: "Pimzino/spec-workflow-mcp",
  install: {
    method: "plugin",
    command: "claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project",
  },
  update: {
    command: "claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project",
    note: "npx-launched MCP server pinned to @latest: re-running add (or restarting the client) fetches the newest published version.",
  },
  usage: [
    { command: "\"Create a spec for user authentication\"", description: "Generates the full Requirements to Design to Tasks spec workflow for a feature." },
    { command: "\"List my specs\"", description: "Shows all specs in the project with their current status." },
    { command: "\"Execute task 1.2 in spec user-auth\"", description: "Runs a specific numbered task from a spec and logs the implementation." },
    { command: "npx -y @pimzino/spec-workflow-mcp@latest --dashboard", description: "Starts the real-time web dashboard on http://localhost:5000 (required for CLI users)." },
    { command: "SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp", description: "Redirects global state to a writable path for sandboxed environments with a read-only $HOME." },
  ],
  whenToUse: [
    "You want the agent to follow a structured spec-driven process (Requirements then Design then Tasks) instead of jumping straight to code.",
    "You need a human approval gate with revisions before the agent implements a spec.",
    "You want a live dashboard to monitor specs, task progress, and implementation logs across projects.",
    "You work in VSCode and want an integrated sidebar instead of a separate browser dashboard.",
  ],
  howToUse: `This is an **MCP server**, not a skill/plugin. Register it once with the Claude Code CLI, pointing it at your project directory:

\`\`\`bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
\`\`\`

The \`--\` separator ensures the path is passed to the server, not to npx. CLI users must also run the dashboard in a separate terminal (it is required for CLI usage):

\`\`\`bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
\`\`\`

Then drive it conversationally: "Create a spec for user authentication", "List my specs", "Execute task 1.2 in spec user-auth". Specs land under \`.spec-workflow/\` (specs, approvals, steering, templates, archive). VSCode users can instead install the companion marketplace extension (\`Pimzino.spec-workflow-mcp\`) for an in-editor dashboard.`,
  whyUseful: `Forces a sequential, document-driven workflow — Requirements then Design then Tasks — with explicit human approval gates and revisions, so the agent plans and gets sign-off before it codes. The real-time dashboard, searchable implementation logs, steering documents, 11-language UI, and hardening controls (localhost binding, 120 req/min rate limiting, structured JSON audit logs, non-root read-only Docker) push it past a toy. Actively maintained by Pimzino with both an npm package (\`@pimzino/spec-workflow-mcp\`, GPL-3.0) and a VSCode marketplace extension.`,
  examplePrompt: "Create a spec for a rate-limited password reset flow, then walk me through approving the requirements before we start tasks.",
  author: "Pimzino",
  dateAdded: "2026-06-20",
};
