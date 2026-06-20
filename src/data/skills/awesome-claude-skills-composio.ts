import type { Skill } from "../types";

export const skill: Skill = {
  slug: "awesome-claude-skills-composio",
  name: "Awesome Claude Skills",
  tagline: "Curated catalog of 1000+ Claude Skills and Plugins, plus ~78 in-repo Composio app-automation skills.",
  category: "resource",
  tags: ["awesome-list", "skills", "composio", "app-automation", "catalog", "plugins"],
  repo: "ComposioHQ/awesome-claude-skills",
  install: {
    method: "manual-copy",
    command: "Browse at github.com/ComposioHQ/awesome-claude-skills",
  },
  update: {
    command: "git pull / re-visit the repo",
    note: "Curated list — no install; bookmark and revisit. The connect-apps plugin and the ~78 Composio automation skills live in subfolders you copy or load per skill.",
  },
  usage: [
    { command: "git clone https://github.com/ComposioHQ/awesome-claude-skills", description: "Clone to browse the full catalog and the ~78 Composio app-automation skill folders locally." },
    { command: "claude --plugin-dir ./connect-apps-plugin", description: "Load the featured connect-apps plugin so Claude can take actions across 500+ apps via Composio." },
    { command: "/connect-apps:setup", description: "Run connect-apps setup and paste a Composio API key from dashboard.composio.dev." },
    { command: "cp -r slack-automation ~/.config/claude-code/skills/", description: "Copy any in-repo automation skill (Slack, Gmail, Jira, Stripe, etc.) into your Claude Code skills dir." },
    { command: "npx skills add chrome-relay", description: "Install a linked third-party skill via the npx skills installer, as some entries document." },
  ],
  whenToUse: [
    "You want to discover existing Claude Skills instead of building from scratch — across document, dev, data, marketing, and security categories.",
    "You need a pre-built workflow skill for a specific SaaS app (Slack, Jira, Stripe, Notion, Salesforce, etc.) via Composio.",
    "You want Claude to take real actions across apps (send email, create issue, post message) and need the connect-apps plugin.",
    "You're researching the Skills format and want canonical examples plus official docs links in one place.",
  ],
  howToUse: `This is an **awesome-list / catalog**, not a single installable skill. Browse it to find a skill, then install that skill by its own instructions.

\`\`\`bash
git clone https://github.com/ComposioHQ/awesome-claude-skills
\`\`\`

For the featured app-automation plugin (Composio-backed, 500+ apps):

\`\`\`bash
claude --plugin-dir ./connect-apps-plugin
# inside Claude:
/connect-apps:setup   # paste a key from dashboard.composio.dev, then restart claude
\`\`\`

To use any of the ~78 in-repo automation skills (Gmail, Slack, Jira, Linear, Stripe, Shopify, GitHub, etc.), copy its folder into your skills directory:

\`\`\`bash
mkdir -p ~/.config/claude-code/skills/
cp -r slack-automation ~/.config/claude-code/skills/
\`\`\`

Many third-party entries in the list link out to their own repos with their own install steps (some use \`npx skills add <name>\`).`,
  whyUseful: `Maintained by Composio (awesome.re-listed, Apache-2.0, ~65k GitHub stars), this is one of the largest curated indexes of the Claude Skills ecosystem — spanning Anthropic's official skills, dozens of community projects, and ~78 ready-to-use Composio app-automation skills with real tool slugs, parameter guidance, and known pitfalls. It doubles as a single jump-off point: official Skills docs, the format spec, and a working connect-apps plugin that turns Claude into an actor across 500+ SaaS apps.`,
  examplePrompt: "Browse Awesome Claude Skills and recommend an existing skill for automating my Jira and Slack workflows, then walk me through installing it.",
  author: "Composio",
  dateAdded: "2026-06-20",
};
