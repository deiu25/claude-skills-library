import type { Skill } from "../types";

export const skill: Skill = {
  slug: "next-devtools-mcp",
  name: "Next.js DevTools MCP",
  tagline: "Vercel MCP server giving coding agents Next.js runtime diagnostics, docs search, codemod upgrades, and browser eval.",
  category: "domain",
  tags: ["mcp-server", "nextjs", "vercel", "diagnostics", "documentation", "codemods"],
  repo: "vercel/next-devtools-mcp",
  install: {
    method: "plugin",
    command: "claude mcp add next-devtools npx next-devtools-mcp@latest",
  },
  whenToUse: [
    "Debugging a running Next.js 16+ app where you need live runtime errors, route info, logs, and Server Action diagnostics surfaced to the agent",
    "Upgrading a project to Next.js 16 using the official codemods via the upgrade_nextjs_16 tool",
    "Looking up authoritative Next.js documentation (including Cache Components) from inside the agent instead of guessing APIs",
    "Running Playwright-based browser checks against a Next.js dev server through browser_eval",
  ],
  howToUse: `This is an **MCP server**, not a Claude Code skill or plugin. You register it once with your client, then the agent gains a set of \`next-devtools\` tools.

\`\`\`bash
claude mcp add next-devtools npx next-devtools-mcp@latest
\`\`\`

Or configure manually / across all detected agents:

\`\`\`bash
npx add-mcp next-devtools-mcp@latest
\`\`\`

Once connected, the agent can call \`init\` (context setup), \`nextjs_docs\` (official docs search), \`nextjs_index\` / \`nextjs_call\` (diagnostics on a live dev server), \`browser_eval\` (Playwright), \`upgrade_nextjs_16\`, and \`enable_cache_components\`. Runtime diagnostics require Next.js 16+. The README recommends calling \`init\` at the start of every Next.js session.`,
  whyUseful: `Built and maintained by Vercel (makers of Next.js), so its docs lookups, codemods, and Cache Components guidance reflect current, authoritative behavior rather than stale training data. The runtime diagnostics let the agent see real errors, routes, logs, and Server Action failures from a running dev server, tightening the debug loop for Next.js 16+ projects. Works across many clients (Claude Code, Cursor, Codex, VS Code/Copilot, Gemini, and more).`,
  examplePrompt: "Add the next-devtools MCP, then diagnose the runtime errors in my running Next.js 16 dev server and upgrade the project.",
  author: "Vercel",
  dateAdded: "2026-06-14",
};
