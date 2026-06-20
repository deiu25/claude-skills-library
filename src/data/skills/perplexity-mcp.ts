import type { Skill } from "../types";

export const skill: Skill = {
  slug: "perplexity-mcp",
  name: "Perplexity MCP",
  tagline: "Official Perplexity MCP server: real-time web search, ask, deep research, and reasoning via Sonar models.",
  category: "mcp",
  tags: ["mcp-server", "perplexity", "web-search", "research", "sonar", "reasoning"],
  repo: "perplexityai/modelcontextprotocol",
  install: {
    method: "plugin",
    command: "claude mcp add perplexity --env PERPLEXITY_API_KEY=\"your_key_here\" -- npx -y @perplexity-ai/mcp-server",
  },
  update: {
    command: "claude mcp add perplexity --env PERPLEXITY_API_KEY=\"your_key_here\" -- npx -y @perplexity-ai/mcp-server",
    note: "npx-launched MCP server: re-running add (or restarting the client) pulls the newest @perplexity-ai/mcp-server. If installed via the plugin marketplace instead, update with /plugin marketplace update modelcontextprotocol.",
  },
  usage: [
    { command: "perplexity_search", description: "Direct web search via the Perplexity Search API; returns ranked results with metadata." },
    { command: "perplexity_ask", description: "Conversational AI with real-time web search using sonar-pro; quick everyday questions." },
    { command: "perplexity_research", description: "Deep, comprehensive research via sonar-deep-research for thorough analysis and reports." },
    { command: "perplexity_reason", description: "Advanced reasoning and problem-solving via sonar-reasoning-pro for complex analytical tasks." },
    { command: "strip_thinking", description: "Optional flag on reason/research to drop <think>...</think> tags and save context tokens." },
  ],
  whenToUse: [
    "You need the agent to pull current, citable web information mid-task instead of relying on training data.",
    "You want a deep multi-source research report generated with sonar-deep-research from inside Claude Code.",
    "You need complex reasoning grounded in live web search via sonar-reasoning-pro.",
    "You want ranked raw search results (with metadata) to feed into a downstream task.",
  ],
  howToUse: `This is an **MCP server**, not a skill/plugin. Register it once with your Perplexity API key (from the [API Portal](https://www.perplexity.ai/account/api/group)):

\`\`\`bash
claude mcp add perplexity --env PERPLEXITY_API_KEY="your_key_here" -- npx -y @perplexity-ai/mcp-server
\`\`\`

Or install via the plugin marketplace:

\`\`\`bash
export PERPLEXITY_API_KEY="your_key_here"
claude
# /plugin marketplace add perplexityai/modelcontextprotocol
# /plugin install perplexity
\`\`\`

Then call the four tools (\`perplexity_search\`, \`perplexity_ask\`, \`perplexity_research\`, \`perplexity_reason\`) by name. For long research queries raise \`PERPLEXITY_TIMEOUT_MS\`; behind a corporate proxy set \`PERPLEXITY_PROXY\`. For cloud/shared deployments run in HTTP mode via Docker or \`npm run start:http\` (exposes \`http://localhost:8080/mcp\`).`,
  whyUseful: `The official, first-party Perplexity MCP server (published as \`@perplexity-ai/mcp-server\` on npm), so it tracks the Sonar API directly rather than a community wrapper. It gives any agent four well-scoped capabilities — ranked search, quick ask, deep research, and advanced reasoning — each mapped to the right Sonar model, plus a \`strip_thinking\` flag to save tokens. One-line install, env-var config, optional proxy and HTTP/Docker deployment make it production-ready.`,
  examplePrompt: "Use perplexity_research to produce a cited report on the current state of MCP server security best practices.",
  author: "Perplexity",
  dateAdded: "2026-06-20",
};
