import type { Skill } from "../types";

export const skill: Skill = {
  slug: "n8n-skills",
  name: "n8n-skills",
  tagline: "14 Claude Code skills for building production n8n workflows with the n8n-mcp server, plus a router and hooks enforcement layer.",
  category: "domain",
  tags: ["n8n", "workflow-automation", "mcp", "hooks", "skills", "domain"],
  repo: "czlonkowski/n8n-skills",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add czlonkowski/n8n-skills",
  },
  update: {
    command: "/plugin marketplace update n8n-skills",
    note: "Then run /reload-plugins. The README documents no explicit update step; reinstalling the plugin also pulls the latest skills. Manual installs: git pull and re-copy skills/* into ~/.claude/skills/.",
  },
  usage: [
    { command: "/plugin install czlonkowski/n8n-skills", description: "Install directly as a Claude Code plugin (Method 1, recommended)." },
    { command: "/plugin marketplace add czlonkowski/n8n-skills", description: "Add as a marketplace, then run /plugin install and select \"n8n-mcp-skills\"." },
    { command: "using-n8n-mcp-skills", description: "Always-on router skill (SessionStart hook) that points you at the right n8n skill and summarizes the n8n-mcp tools." },
    { command: "n8n MCP Tools Expert", description: "Highest-priority skill: correct n8n-mcp tool selection, nodeType formats, validation profiles." },
    { command: "n8n Validation Expert", description: "Interpret validate_workflow errors, escape validation loops, handle false positives." },
    { command: "n8n Self-Hosting", description: "Deploy production self-hosted n8n to a fresh Linux VM via Docker Compose + Caddy (single or queue mode)." },
  ],
  whenToUse: [
    "You build n8n workflows programmatically and keep hitting validation loops, wrong expression syntax, or misconfigured nodes.",
    "You use the n8n-mcp MCP server and want Claude to pick the right tools, nodeType formats, and validation profiles.",
    "You're wiring AI Agents, Code/Code Tool nodes, sub-workflows, error handling, or binary data in n8n and want production-tested patterns.",
    "You need to self-host n8n on your own VPS (Hetzner, DigitalOcean, EC2) with HTTPS, secrets, and Day-2 ops.",
  ],
  howToUse: `Requires the [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) MCP server installed and configured first (listed as a prerequisite in the README).

Install as a Claude Code plugin (Method 1, recommended):

\`\`\`bash
/plugin install czlonkowski/n8n-skills
\`\`\`

Or add the marketplace, then pick the plugin:

\`\`\`bash
/plugin marketplace add czlonkowski/n8n-skills
/plugin install   # select "n8n-mcp-skills"
\`\`\`

Manual / Claude.ai — clone and copy, or zip individual skill folders and upload via Settings -> Capabilities -> Skills:

\`\`\`bash
git clone https://github.com/czlonkowski/n8n-skills.git
cp -r n8n-skills/skills/* ~/.claude/skills/
\`\`\`

The 14 skills activate by description automatically (e.g. "Build a webhook to Slack workflow" or "Why is validation failing?"). In the plugin install, a \`SessionStart\` hook loads the \`using-n8n-mcp-skills\` router and PreToolUse hooks nudge you toward the right skill around high-impact n8n-mcp calls; hooks degrade gracefully on Claude.ai.`,
  whyUseful: `Conceived by Romuald Członkowski, creator of the widely used n8n-mcp server, so the skills encode firsthand knowledge of that toolchain. It goes beyond static skills with an always-on router plus PreToolUse hooks that surface the right guidance at the moment of a node lookup or validate_workflow call, instead of only on a keyword match. Coverage is broad and specific: expressions, MCP tool usage, workflow patterns, validation, node config, JS/Python Code nodes, Code Tool, error handling, binary data, sub-workflows, AI agents, multi-instance routing, and full self-hosting deployment.`,
  examplePrompt: "Build and validate a webhook-to-Slack n8n workflow, then tell me how to self-host it on a Hetzner VPS.",
  author: "Romuald Członkowski (czlonkowski)",
  dateAdded: "2026-06-20",
};
