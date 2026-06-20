import type { Skill } from "../types";

export const skill: Skill = {
  slug: "my-claude-code-setup",
  name: "My Claude Code Setup",
  tagline: "George Liu's starter Claude Code config: CLAUDE.md memory-bank templates, slash commands, subagents, skills, hooks, and Z.AI setup.",
  category: "resource",
  tags: ["claude-md", "memory-bank", "slash-commands", "subagents", "starter-config", "z-ai"],
  repo: "centminmod/my-claude-code-setup",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/centminmod/my-claude-code-setup",
  },
  update: {
    command: "git pull / re-visit the repo",
    note: "Starter config you copy into your project — no package install; git pull (or re-browse) to pick up new templates and commands.",
  },
  usage: [
    { command: "/init", description: "After copying the files, run /init so Claude analyses your codebase and populates the CLAUDE-*.md memory bank." },
    { command: "CLAUDE-template-1/2/3.md", description: "Pick one of three Anthropic-best-practice CLAUDE.md memory-bank templates to seed your project." },
    { command: "/update-memory-bank", description: "Sync CLAUDE.md and the CLAUDE-*.md memory bank files after a completed task." },
    { command: "/cleanup-context", description: "Memory-bank optimizer that prunes redundant docs for a claimed 15-25% token reduction." },
    { command: "/consult-zai \"question\"", description: "Dual-AI skill comparing Z.AI GLM-4.7 and the code-searcher agent for code analysis." },
    { command: "clx <branch>", description: "Shell launcher that creates an isolated git worktree and starts Claude Code (opusplan) in plan mode." },
  ],
  whenToUse: [
    "You're starting a new project and want a ready-made CLAUDE.md memory-bank system that retains context across many sessions.",
    "You want a curated set of slash commands (apply-thinking, cleanup-context, ccusage-daily, security-audit, release notes) and subagents (code-searcher, memory-bank-synchronizer) to copy in.",
    "You want to run Claude Code against Z.AI GLM-4.7 for higher quotas, or run parallel sessions via the git-worktree launcher functions.",
    "You want a reference statusline script showing model, context %, cost, and git/worktree state.",
  ],
  howToUse: `This is a **starter-config repo you copy into your project**, not a plugin.

\`\`\`bash
git clone https://github.com/centminmod/my-claude-code-setup
# copy CLAUDE.md (or a CLAUDE-template-*.md), and the .claude/ commands/agents/skills into your project
\`\`\`

Then in your project:

\`\`\`bash
/init                 # populate the memory bank from your codebase
/update-memory-bank   # keep CLAUDE-*.md in sync after each task
\`\`\`

Existing CLAUDE.md? Paste \`CLAUDE-migrate-to-new-template.md\` as a prompt to migrate. macOS users need Terminal-Notifier for the STOP hook in \`.claude/settings.json\`; non-macOS users can delete that hook. Optional extras: install \`ripgrep fd jq\`, set up the \`clx\`/\`cx\` git-worktree launchers, and configure Z.AI (\`ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic\`). The bundled \`session-metrics\` skill can instead be installed from the author's marketplace via \`/plugin marketplace add centminmod/claude-plugins\`.`,
  whyUseful: `A frequently-updated reference setup from George Liu (centminmod, creator of Centmin Mod) that packages the full Claude Code surface area — CLAUDE.md memory-bank templates following Anthropic best practices, ~15 slash commands, subagents, skills, a STOP hook, a rich statusline, git-worktree launchers, and Z.AI GLM-4.7 integration — into one repo you can lift directly. The dual-memory / progressive-disclosure CLAUDE.md templates and the memory-bank-synchronizer agent are the standout, battle-tested pieces worth borrowing even if you adopt nothing else.`,
  examplePrompt: "Copy CLAUDE-template-3.md and the .claude/ commands from centminmod/my-claude-code-setup into my project, then run /init to build the memory bank.",
  author: "George Liu (centminmod)",
  dateAdded: "2026-06-20",
};
