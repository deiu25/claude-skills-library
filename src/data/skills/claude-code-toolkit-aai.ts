import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-code-toolkit-aai",
  name: "Claude Code Toolkit",
  tagline: "Six plugins, 28 commands, 5 agents, 6 skills implementing Anthropic's workflow, memory, and handoff patterns.",
  category: "meta",
  tags: ["workflow", "plugins", "skills", "agents", "memory", "session-search"],
  repo: "applied-artificial-intelligence/claude-code-toolkit",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/applied-artificial-intelligence/claude-code-toolkit.git && cp claude-code-toolkit/commands/setup-toolkit.md ~/.claude/commands/",
  },
  update: {
    command: "git -C claude-code-toolkit pull",
    note: "Pull the clone, then re-run /setup-toolkit in a project to refresh plugin/marketplace config. Plugins resolve from the local clone path, so updates land on pull.",
  },
  usage: [
    { command: "/setup-toolkit", description: "Bootstrap command (installed globally to ~/.claude/commands/) that detects project type and wires up the local plugin marketplace + .claude/settings.json." },
    { command: "/workflow:explore -> /workflow:plan -> /workflow:next -> /workflow:ship", description: "Stateless explore-plan-next-ship task lifecycle with per-task auto-commits." },
    { command: "/transition:handoff and /transition:continue", description: "Save context to disk before a context reset, then resume cleanly after /clear." },
    { command: "/memory:index and /memory:memory-review", description: "Build and curate persistent project knowledge in .claude/memory/." },
    { command: "python3 scripts/session-db.py search \"authentication\"", description: "Index and query past Claude Code session history across projects (session-db.py index | search | timeline)." },
    { command: "./scripts/install-git-safe-commit.sh", description: "Install the git wrapper that blocks --no-verify so quality gates can't be skipped." },
  ],
  whenToUse: [
    "You want a structured explore -> plan -> next -> ship loop with per-task git checkpoints instead of one-shot plan-mode execution.",
    "You keep losing context across session resets and need handoff/continue plus a persistent .claude/memory/ store.",
    "You want Anthropic's documented Claude Code patterns (subagents, progressive-disclosure skills, quality-gate hooks) as ready-to-copy plugins.",
    "You need to search past Claude Code sessions ('how did we implement X last time?') across all projects.",
  ],
  howToUse: `Clone, install the bootstrap command once, then run setup inside any project:

\`\`\`bash
git clone https://github.com/applied-artificial-intelligence/claude-code-toolkit.git
cd claude-code-toolkit
cp commands/setup-toolkit.md ~/.claude/commands/
\`\`\`

In any project, launch Claude Code and run:

\`\`\`text
/setup-toolkit
\`\`\`

It detects project type (Python/JS/web), asks which of the 6 plugins and optional MCP servers you want, and writes \`.claude/settings.json\` with a local marketplace pointing at the cloned \`plugins/\` dir. To configure manually, add \`extraKnownMarketplaces.local\` (\`source: {source: "directory", path: ".../plugins"}\`) plus \`enabledPlugins\` for \`system@local\`, \`workflow@local\`, \`development@local\`, \`transition@local\`, \`memory@local\`, \`setup@local\`.

Optional hardening: run \`./scripts/install-git-safe-commit.sh\` (blocks \`--no-verify\`) and enable the \`mdtoken\` pre-commit hook to keep markdown under context limits. MCP servers (Serena, Context7, Chrome DevTools, FireCrawl) are optional and every command degrades gracefully without them.`,
  whyUseful: `Distilled from 6+ months of daily Claude Code use and explicitly mapped to Anthropic's own best-practice docs (multi-context-window workflows, the memory tool, progressive-disclosure skills, subagents, quality-gate hooks). You get a coherent, file-based, stateless system (workflow + memory + transition + development + system + setup) rather than a loose pile of commands, plus a cross-project session-history search tool (session-db.py) and the companion mdtoken token-limit linter. MIT-licensed, actively maintained (v1.1.0), and honest about Claude's real limits rather than padding with unvalidated token-reduction claims.`,
  examplePrompt: "/workflow:explore \"add JWT user authentication\" then /workflow:plan and /workflow:next to execute tasks with auto-commits",
  author: "Applied Artificial Intelligence Consulting",
  dateAdded: "2026-06-20",
};
