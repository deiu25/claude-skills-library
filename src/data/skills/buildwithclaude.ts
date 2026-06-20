import type { Skill } from "../types";

export const skill: Skill = {
  slug: "buildwithclaude",
  name: "Build with Claude",
  tagline: "Plugin marketplace and discovery platform indexing 20k+ community plugins, 4,500+ MCP servers, and curated agents/commands/hooks.",
  category: "resource",
  tags: ["marketplace", "discovery", "plugins", "agents", "commands", "mcp-servers"],
  repo: "davepoon/buildwithclaude",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add davepoon/buildwithclaude",
  },
  update: {
    command: "/plugin marketplace update buildwithclaude",
    note: "Marketplace metadata refreshes on update; browse buildwithclaude.com for the always-current community index. (Update command follows the standard slug convention; README documents only the add command.)",
  },
  usage: [
    { command: "/plugin marketplace add davepoon/buildwithclaude", description: "Register the Build with Claude marketplace." },
    { command: "/plugin search @buildwithclaude", description: "Browse the curated plugins in the marketplace." },
    { command: "/plugin install agents-python-expert@buildwithclaude", description: "Install a specific bundled plugin (e.g. the Python expert agent)." },
    { command: "/plugin install all-agents@buildwithclaude", description: "Install the full curated agent collection (117 agents) at once." },
    { command: "Browse buildwithclaude.com", description: "Search the web UI across 20k+ community plugins, MCP servers, and marketplaces." },
  ],
  whenToUse: [
    "You want a one-click marketplace of curated agents, commands, and hooks (117 agents, 175 commands, 28 hooks) inside Claude Code.",
    "You're hunting for a community plugin, MCP server, or marketplace and want a searchable index of 20k+ entries.",
    "You want to install bundled plugin packs by category (language experts, DevOps, git) instead of copying files manually.",
    "You're evaluating what already exists in the Claude Code ecosystem before building something yourself.",
  ],
  howToUse: `Register the marketplace once, then search and install plugins by name.

\`\`\`bash
# Add the marketplace
/plugin marketplace add davepoon/buildwithclaude

# Browse what's available
/plugin search @buildwithclaude

# Install a specific plugin or a whole pack
/plugin install commands-version-control-git@buildwithclaude
/plugin install all-agents@buildwithclaude
\`\`\`

Prefer manual install? Clone and copy the \`.md\` files:

\`\`\`bash
git clone https://github.com/davepoon/buildwithclaude.git
find plugins/agents-*/agents -name "*.md" -exec cp {} ~/.claude/agents/ \\;
\`\`\`

For ecosystem discovery beyond the in-repo collections, browse the web UI at buildwithclaude.com to search across community plugins, MCP servers, and other marketplaces.`,
  whyUseful: `Doubles as both an installable marketplace and the largest discovery surface for the Claude Code ecosystem — the web UI indexes 20,000+ community plugins, 4,500+ MCP servers, and 1,100+ marketplaces, while the repo itself ships 117 agents, 175 commands, 28 hooks, 26 skills, and 51 bundled plugins. One \`/plugin marketplace add\` gives you curated, install-ready packs; the catalog answers "does a tool for X already exist?" before you build it. MIT-licensed and actively maintained by Dave Poon.`,
  examplePrompt: "/plugin marketplace add davepoon/buildwithclaude then /plugin install all-agents@buildwithclaude",
  author: "Dave Poon",
  dateAdded: "2026-06-20",
};
