import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-plugins-community",
  name: "Claude Plugins — Community",
  tagline: "Anthropic's official marketplace of security-scanned, community-submitted plugins for Claude Code and Claude Cowork.",
  category: "meta",
  tags: ["marketplace", "plugins", "anthropic", "community", "directory", "official"],
  repo: "anthropics/claude-plugins-community",
  install: {
    method: "marketplace",
    command: "claude plugin marketplace add anthropics/claude-plugins-community",
  },
  update: {
    command: "claude plugin marketplace update claude-community",
    note: "Read-only mirror synced nightly from Anthropic's internal review pipeline; the marketplace slug is `claude-community` (verified in .claude-plugin/marketplace.json). Re-running marketplace add or restarting Claude Code refreshes the plugin list.",
  },
  usage: [
    { command: "claude plugin marketplace add anthropics/claude-plugins-community", description: "Register the community marketplace in Claude Code." },
    { command: "claude plugin install <plugin-name>@claude-community", description: "Install any approved community plugin by name from this marketplace." },
    { command: "claude plugin marketplace update claude-community", description: "Refresh the local copy of the nightly-synced plugin list." },
    { command: "Browse claude.com/plugins/", description: "Discover and install the same plugins from Claude Cowork's web UI." },
    { command: "Submit via clau.de/plugin-directory-submission", description: "Propose a new plugin — direct PRs to the repo are auto-closed." },
  ],
  whenToUse: [
    "You want to install third-party Claude Code plugins that Anthropic has security-scanned and approved.",
    "You need a single trusted marketplace slug (`claude-community`) to pull community plugins from.",
    "You are deciding between official and community plugin sources and want the vetted community catalog.",
    "You built a plugin and want to distribute it through Anthropic's reviewed directory.",
  ],
  howToUse: `Register the marketplace once, then install any plugin it lists:

\`\`\`bash
claude plugin marketplace add anthropics/claude-plugins-community
claude plugin install <plugin-name>@claude-community
\`\`\`

The repo is a **read-only mirror** of \`.claude-plugin/marketplace.json\`, synced nightly from Anthropic's internal review pipeline. The marketplace slug is \`claude-community\` (the \`@claude-community\` suffix on plugin installs). Refresh the local list with:

\`\`\`bash
claude plugin marketplace update claude-community
\`\`\`

From Claude Cowork, install the same plugins via [claude.com/plugins](https://claude.com/plugins/). To publish your own plugin, submit through [clau.de/plugin-directory-submission](https://clau.de/plugin-directory-submission) — pull requests opened directly against the repo are closed automatically.`,
  whyUseful: `This is Anthropic's own marketplace for community plugins — the authoritative, trusted source rather than a random third-party list. Every listed plugin is submitted through the official directory, passes automated security scanning, and is approved before distribution, so it is the safest single place to discover and install community Claude Code plugins. It sits alongside the official \`claude-plugins-official\` and \`knowledge-work-plugins\` repos as the canonical plugin ecosystem.`,
  examplePrompt: "Add the anthropics/claude-plugins-community marketplace and install the commit-helper plugin from it.",
  author: "Anthropic",
  dateAdded: "2026-06-20",
};
