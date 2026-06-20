import type { Skill } from "../types";

export const skill: Skill = {
  slug: "awesome-claude-code-subagents",
  name: "Awesome Claude Code Subagents",
  tagline: "Curated catalog of 154+ Claude Code subagents across 10 categories, installable as per-category plugins or copied .md files.",
  category: "resource",
  tags: ["subagents", "awesome-list", "agents", "catalog", "marketplace", "voltagent"],
  repo: "VoltAgent/awesome-claude-code-subagents",
  install: {
    method: "manual-copy",
    command: "claude plugin marketplace add VoltAgent/awesome-claude-code-subagents",
  },
  update: {
    command: "git pull / re-run claude plugin marketplace add VoltAgent/awesome-claude-code-subagents",
    note: "Curated catalog: pull the repo to refresh, or re-add the marketplace and reinstall the per-category plugins you use.",
  },
  usage: [
    { command: "claude plugin marketplace add VoltAgent/awesome-claude-code-subagents", description: "Register the repo as a Claude Code plugin marketplace." },
    { command: "claude plugin install voltagent-lang", description: "Install a per-category plugin (here, the language specialists)." },
    { command: "cp -r tools/subagent-catalog ~/.claude/commands/", description: "Install the subagent-catalog skill to search and fetch agents on demand." },
    { command: "/subagent-catalog:search <query>", description: "Find agents by name, description, or category." },
    { command: "/subagent-catalog:fetch <name>", description: "Pull a single agent's full definition into your project." },
    { command: "./install-agents.sh", description: "Interactive installer to browse categories and install/uninstall agents." },
  ],
  whenToUse: [
    "You want a ready-made specialist subagent (e.g. python-pro, security-auditor, kubernetes-specialist) instead of writing the system prompt yourself.",
    "You want to install a whole category of agents at once via a plugin (voltagent-infra, voltagent-qa-sec, etc.).",
    "You need orchestration/meta agents (multi-agent-coordinator, agent-organizer) to coordinate other subagents.",
    "You want a reference template for the standard subagent .md structure (frontmatter name/description/tools/model + system prompt).",
  ],
  howToUse: `This is a **curated catalog**, not a single skill. Three ways to consume it.

Install a category as a plugin (recommended):

\`\`\`bash
claude plugin marketplace add VoltAgent/awesome-claude-code-subagents
claude plugin install voltagent-lang     # language specialists
claude plugin install voltagent-infra    # infra & devops
\`\`\`

Or copy individual agents manually:

\`\`\`bash
git clone https://github.com/VoltAgent/awesome-claude-code-subagents.git
cp awesome-claude-code-subagents/categories/04-quality-security/code-reviewer.md ~/.claude/agents/
\`\`\`

Or install the bundled catalog skill and pull agents on demand:

\`\`\`bash
cp -r tools/subagent-catalog ~/.claude/commands/
# then: /subagent-catalog:search kubernetes
#       /subagent-catalog:fetch kubernetes-specialist
\`\`\`

There is also an interactive installer (\`./install-agents.sh\`, or curl it standalone). Each agent carries a \`model\` field (opus/sonnet/haiku) for cost-aware routing and a minimal \`tools\` allowlist; the \`voltagent-meta\` orchestration agents work best once other categories are installed.`,
  whyUseful: `Maintained by VoltAgent and carrying the Awesome badge, this is one of the largest curated subagent collections (154+ agents across core dev, languages, infra, QA/security, data/AI, DX, domains, business, meta-orchestration, and research). Every agent follows a consistent template with smart model routing and least-privilege tool grants, so they drop straight into \`~/.claude/agents/\` and work immediately. The per-category plugin marketplace plus the \`subagent-catalog\` skill make it both a browseable reference and a one-command install source.`,
  examplePrompt: "Have the kubernetes-specialist subagent review my Helm charts and flag misconfigurations.",
  author: "VoltAgent",
  dateAdded: "2026-06-20",
};
