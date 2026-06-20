import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-skills-marketplace",
  name: "Claude Skills Marketplace",
  tagline: "Marketplace of four engineering plugins (17 skills + a Haiku agent) with a Python execution runtime for 90%+ token savings on bulk ops.",
  category: "meta",
  tags: ["marketplace", "skills", "plugins", "token-efficiency", "code-execution", "workflow"],
  repo: "mhattingpete/claude-skills-marketplace",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add mhattingpete/claude-skills-marketplace",
  },
  update: {
    command: "/plugin marketplace update mhattingpete-claude-skills",
    note: "Then run /reload-plugins. Marketplaces refresh from the source repo at startup.",
  },
  usage: [
    { command: "/plugin marketplace add mhattingpete/claude-skills-marketplace", description: "Add the marketplace; installs the engineering-workflow plugin (skills + plan-implementer agent)." },
    { command: "/plugin marketplace add mhattingpete/claude-skills-marketplace/code-operations-plugin", description: "Install just the code-operations plugin (code-execution, code-transfer, code-refactor, file-operations)." },
    { command: "code-execution", description: "Run Python locally with marketplace API access for 90%+ token savings on bulk/codebase-wide work." },
    { command: "feature-planning", description: "Break a feature request into discrete tasks executed by the plan-implementer (Haiku) agent." },
    { command: "architecture-diagram-creator", description: "Generate self-contained HTML architecture diagrams with data flows and deployment info." },
    { command: "~/.claude/plugins/marketplaces/mhattingpete-claude-skills/execution-runtime/setup.sh", description: "One-command install of the FastMCP execution-runtime server after adding the marketplace." },
  ],
  whenToUse: [
    "You want a bundle of software-engineering skills (planning, git-pushing, test-fixing, review) plus a plan-implementer agent in one install.",
    "You run bulk or codebase-wide transformations (10+ files) and want local Python execution instead of burning tokens reading/editing each file.",
    "You need to generate self-contained HTML visuals — architecture diagrams, flowcharts, dashboards, timelines, technical docs.",
    "You want code-operations skills (line-precise transfer, bulk refactor, file analysis) ported from code-copy-mcp.",
  ],
  howToUse: `Add the marketplace, then install the plugins you want:

\`\`\`bash
/plugin marketplace add mhattingpete/claude-skills-marketplace
\`\`\`

This installs the \`engineering-workflow-plugin\` (skills + \`plan-implementer\` agent). Install individual plugins by appending the path:

\`\`\`bash
/plugin marketplace add mhattingpete/claude-skills-marketplace/visual-documentation-plugin
/plugin marketplace add mhattingpete/claude-skills-marketplace/productivity-skills-plugin
/plugin marketplace add mhattingpete/claude-skills-marketplace/code-operations-plugin
\`\`\`

For the token-saving execution runtime, run its setup after installing:

\`\`\`bash
~/.claude/plugins/marketplaces/mhattingpete-claude-skills/execution-runtime/setup.sh
\`\`\`

Skills are model-invoked: phrasing like "refactor 50 files to the new API" auto-triggers \`code-refactor\` in execution mode; "add user authentication" triggers \`feature-planning\`.`,
  whyUseful: `Bundles 17 skills across four cohesive plugins plus a Haiku-backed plan-implementer agent, so one marketplace add covers planning, git, testing, review, refactoring, and HTML docs. Its standout feature is the execution-runtime, which implements Anthropic's code-execution-with-MCP pattern to run Python locally and cut bulk-operation token use by 90-99% (the README cites 25K to 600 tokens on a 50-file rename). Apache-2.0, actively maintained, by an author shipping several MCP/agent projects (personal-ai-os, agent-composer, outlook-mcp).`,
  examplePrompt: "Rename getUserData to fetchUserData across all Python files, then push the changes.",
  author: "Martin Hatting Petersen (mhattingpete)",
  dateAdded: "2026-06-20",
};
