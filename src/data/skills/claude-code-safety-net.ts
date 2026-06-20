import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-code-safety-net",
  name: "CC Safety Net",
  tagline: "PreToolUse hook that blocks destructive git and filesystem commands (rm -rf, git reset --hard) before they execute.",
  category: "code-quality",
  tags: ["safety", "hooks", "git", "guardrails", "destructive-commands", "pretooluse"],
  repo: "kenryu42/claude-code-safety-net",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add kenryu42/cc-marketplace",
  },
  update: {
    command: "/plugin marketplace update cc-marketplace",
    note: "After adding the marketplace, run /plugin install safety-net@cc-marketplace then /reload-plugins. Enable marketplace auto-update via /plugin (Marketplaces - cc-marketplace) to stay current.",
  },
  usage: [
    { command: "/plugin install safety-net@cc-marketplace", description: "Install the safety-net plugin from the cc-marketplace after adding it." },
    { command: "npx -y cc-safety-net doctor", description: "Validate hook installation, run a self-test, and check config and recent blocks." },
    { command: "npx -y cc-safety-net explain \"git reset --hard\"", description: "Trace step-by-step why a command is blocked or allowed (add --json or --cwd)." },
    { command: "npx -y cc-safety-net rule init", description: "Scaffold a project rulebook for custom block rules; then rule sync / verify / test." },
    { command: "CC_SAFETY_NET_PARANOID=1", description: "Env flag enabling all stricter checks (e.g. rm -rf inside cwd, interpreter one-liners)." },
    { command: "bunx cc-safety-net statusline --claude-code", description: "Status line command showing protection state in the Claude Code status bar." },
  ],
  whenToUse: [
    "You let an agent run shell commands and want a hard technical block on rm -rf, git reset --hard, git checkout --, git clean -f, and similar footguns.",
    "Permission deny rules feel brittle and you want bypass-resistant semantic analysis that also catches shell wrappers (bash -c) and interpreter one-liners (python -c).",
    "You need a PreToolUse layer that runs before the permission system as defense-in-depth alongside sandboxing.",
    "You want team-wide custom block rules (e.g. block git push --force, dd to block devices) enforced via a versioned rulebook.",
  ],
  howToUse: `Install the Claude Code plugin from the dedicated marketplace repo:

\`\`\`bash
/plugin marketplace add kenryu42/cc-marketplace
/plugin install safety-net@cc-marketplace
/reload-plugins
\`\`\`

Protection is on out of the box — destructive commands are blocked by a PreToolUse hook with a reason. Verify and debug from a shell:

\`\`\`bash
npx -y cc-safety-net doctor
npx -y cc-safety-net explain "git checkout -- file.txt"
\`\`\`

Add custom rules via the \`/cc-safety-net\` skill (natural language) or manually:

\`\`\`bash
npx -y cc-safety-net rule init
# edit the generated rulebook JSON
npx -y cc-safety-net rule sync && npx -y cc-safety-net rule verify && npx -y cc-safety-net rule test
\`\`\`

Tune enforcement with env flags: \`CC_SAFETY_NET_STRICT=1\` (fail closed on unparseable commands), \`CC_SAFETY_NET_PARANOID=1\` (all stricter checks). \`CC_SAFETY_NET_WORKTREE=1\` instead relaxes discard rules inside linked git worktrees. Requires Node.js 18+ (bunx works too). Also installs into Codex, Gemini CLI, Copilot CLI, Kimi Code, OpenCode, and Pi.`,
  whyUseful: `Born from a real incident where Claude Code wiped a home directory with \`rm -rf ~/\`, it replaces soft CLAUDE.md instructions with a hard, bypass-resistant guard. It does semantic command analysis — not wildcard matching — so it catches flag reordering (\`rm -r -f /\`), shell wrappers (\`bash -c 'rm -rf /'\`), and interpreter one-liners (\`python -c 'os.system("rm -rf /")'\`) that permission patterns miss. It runs as a PreToolUse hook before the permission system, distinguishes safe from dangerous variants of the same command (\`git checkout -b\` allowed, \`git checkout --\` blocked), blocks \`dd\`/\`mkfs\`/\`shred\`/\`git push --force\`, and ships doctor/explain/statusline tooling plus a versioned custom-rulebook system. Actively maintained with CI, codecov, and versioned tags, and works across seven coding-agent CLIs.`,
  examplePrompt: "/cc-safety-net read my package.json and add a rule blocking all git push --force commands",
  author: "kenryu42",
  dateAdded: "2026-06-20",
};
