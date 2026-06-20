import type { Skill } from "../types";

export const skill: Skill = {
  slug: "exa-mcp-server",
  name: "Exa MCP Server",
  tagline: "Exa's hosted MCP server: web search, page fetch, and advanced filtered search (code, people, companies, papers) for agents.",
  category: "mcp",
  tags: ["mcp-server", "web-search", "exa", "research", "code-search", "documentation"],
  repo: "exa-labs/exa-mcp-server",
  install: {
    method: "plugin",
    command: "claude mcp add --transport http exa https://mcp.exa.ai/mcp",
  },
  update: {
    command: "claude mcp add --transport http exa https://mcp.exa.ai/mcp",
    note: "Hosted HTTP MCP server — updates are server-side, nothing to pull. Re-run add only to change the endpoint (e.g. append ?tools=... to enable more tools). Self-hosted npm users get the latest on the next `npx -y exa-mcp-server`.",
  },
  usage: [
    { command: "web_search_exa", description: "Default tool: search the web on any topic and get clean, ready-to-use page content." },
    { command: "web_fetch_exa", description: "Default tool: fetch the full content of a specific webpage from a known URL." },
    { command: "web_search_advanced_exa", description: "Off by default: search with full control over domains, dates, categories, and content options." },
    { command: "?tools=web_search_exa,web_search_advanced_exa,web_fetch_exa", description: "Query-param appended to the MCP URL to enable additional/off-by-default tools." },
    { command: "category: \"company\" | \"people\" | \"research paper\" | \"financial report\" | \"news\" | \"personal site\"", description: "Scope advanced search to companies, LinkedIn profiles, papers, SEC filings, news, or personal sites." },
    { command: "claude mcp add --transport http exa \"https://mcp.exa.ai/mcp?tools=web_search_advanced_exa\"", description: "Register the hosted server with advanced search enabled (needed for the bundled research skills)." },
  ],
  whenToUse: [
    "You want a coding agent to pull live web results, docs, or real code snippets from GitHub/StackOverflow instead of relying on its training cutoff.",
    "You need filtered research — companies, LinkedIn people, arXiv papers, SEC filings — via Exa's category and date/domain filters.",
    "You want to fetch and clean the full text of a known URL for the agent to read.",
    "You want a hosted, no-key-needed search MCP (or a self-hosted npm one with your own EXA_API_KEY).",
  ],
  howToUse: `This is an **MCP server**, not a skill or plugin. Register the hosted endpoint once for Claude Code:

\`\`\`bash
claude mcp add --transport http exa https://mcp.exa.ai/mcp
\`\`\`

Two default tools are exposed immediately: \`web_search_exa\` and \`web_fetch_exa\`. To turn on advanced/off-by-default tools, append a \`tools\` query param to the URL:

\`\`\`bash
claude mcp add --transport http exa "https://mcp.exa.ai/mcp?tools=web_search_exa,web_search_advanced_exa,web_fetch_exa"
\`\`\`

The hosted endpoint needs no key by default; pass \`?exaApiKey=YOUR_KEY\` for higher rate limits. Prefer self-hosting with your own [Exa API key](https://dashboard.exa.ai/api-keys)? Run the npm package instead:

\`\`\`json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": { "EXA_API_KEY": "your_api_key" }
    }
  }
}
\`\`\`

The README also ships pasteable Claude Skills (company, code, people, financial report, research paper, personal site research) that wrap \`web_search_advanced_exa\` with token-isolation and category-filter guidance — paste one into Claude Code and it wires up the MCP and skill for you.`,
  whyUseful: `Official, first-party MCP server from Exa (the search-for-AI company), published as the \`exa-mcp-server\` npm package and listed across Cursor, VS Code, Claude, Codex, Gemini, and more. The hosted HTTP endpoint means zero local setup and no key to manage for the default search/fetch tools, while category filters (company, people, research paper, financial report, news, personal site) and date/domain controls give agents precise, current retrieval well beyond a generic web search. The bundled, copy-paste Claude Skills with built-in token-isolation patterns make it a strong default research backend for Claude Code.`,
  examplePrompt: "Using the Exa MCP, search for recent arXiv papers on transformer attention efficiency published since 2024 and summarize the three most-cited approaches.",
  author: "Exa Labs",
  dateAdded: "2026-06-20",
};
