import type { Skill } from "../types";

export const skill: Skill = {
  slug: "awesome-mcp-servers",
  name: "Awesome MCP Servers (appcypher)",
  tagline: "Curated catalog of 200+ Model Context Protocol servers across 25+ categories: filesystems, databases, search, cloud, security.",
  category: "resource",
  tags: ["mcp-server", "awesome-list", "directory", "integrations", "reference", "catalog"],
  repo: "appcypher/awesome-mcp-servers",
  install: {
    method: "manual-copy",
    command: "Browse at github.com/appcypher/awesome-mcp-servers",
  },
  update: {
    command: "git pull / re-visit the repo",
    note: "Curated list — no install; bookmark and revisit. CC0 1.0 Universal (public domain).",
  },
  usage: [
    { command: "Browse the README on GitHub", description: "Scan 25+ emoji-prefixed category sections (File Systems, Databases, Search & Web, Security, Finance, AI Services...) for the server you need." },
    { command: "git clone https://github.com/appcypher/awesome-mcp-servers", description: "Clone to grep the full catalog locally for keywords (e.g. 'postgres', 'slack', 'github')." },
    { command: "⭐ legend", description: "Star marks official protocol implementations; superscript numerals (1 2 3 n) distinguish multiple implementations of the same service." },
    { command: "CONTRIBUTING.md", description: "Follow the contribution guidelines to submit a new server to the list." },
  ],
  whenToUse: [
    "You need to find an existing MCP server for a specific integration (Postgres, Slack, GitHub, S3, Stripe) instead of writing one.",
    "You are choosing between multiple MCP server implementations and want to compare official vs community options.",
    "You want a broad survey of what the MCP ecosystem covers before designing your own server.",
    "You are assembling an MCP toolchain for an agent and need vetted, categorized options.",
  ],
  howToUse: `This is a **curated awesome-list**, not an installable package. Browse or clone it as a reference:

\`\`\`bash
git clone https://github.com/appcypher/awesome-mcp-servers
grep -i postgres awesome-mcp-servers/README.md
\`\`\`

Servers are grouped under 25+ emoji-prefixed categories (📂 File Systems, 🗄️ Databases, 🔍 Search & Web, 🔒 Security, 💹 Finance, 🤝 AI Services, 💻 Development Tools, and more). The ⭐ icon flags official protocol implementations; superscript numerals (¹ ² ³ ⁿ) distinguish multiple implementations of the same service. Pick a server, follow its own repo's install instructions, then register it with \`claude mcp add\`.`,
  whyUseful: `A canonical discovery index for the MCP ecosystem, maintained by Stephen Akinyemi (appcypher) and released CC0 1.0 (public domain). It saves you from hand-rolling integrations: 200+ servers spanning databases, cloud storage, version control, search, security, and finance are sorted into 25+ categories with clear markers for official vs community implementations. When wiring tools into a Claude Code agent, it is the fastest way to check whether a server already exists before building one.`,
  examplePrompt: "Search appcypher/awesome-mcp-servers for an existing Postgres MCP server and tell me how to register it with claude mcp add.",
  author: "Stephen Akinyemi (appcypher)",
  dateAdded: "2026-06-20",
};
