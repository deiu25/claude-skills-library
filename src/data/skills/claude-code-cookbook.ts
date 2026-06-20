import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-code-cookbook",
  name: "Claude Code Cookbook",
  tagline: "39 slash commands, 9 expert roles, and safety hooks for Claude Code, in 8 languages.",
  category: "workflow",
  tags: ["commands", "roles", "workflow", "code-review", "pull-requests", "i18n"],
  repo: "wasabeef/claude-code-cookbook",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add wasabeef/claude-code-cookbook",
  },
  update: {
    command: "/plugin marketplace update claude-code-cookbook",
    note: "Not documented in the README — uses the standard marketplace convention (slug = repo name). Then reinstall/reload your language plugin (e.g. /plugin install cook-en@claude-code-cookbook). Marketplaces refresh at startup.",
  },
  usage: [
    { command: "/plugin install cook-en@claude-code-cookbook", description: "Install the English plugin (or cook for Japanese, cook-ko, cook-zh-cn, cook-zh-tw, cook-es, cook-fr, cook-pt)." },
    { command: "/cook:pr-create", description: "Auto-generate a PR from Git changes with description and optimal branch setup." },
    { command: "/cook:semantic-commit", description: "Split large changes into meaningful units with semantic commit messages." },
    { command: "/cook:role security --agent", description: "Run the security expert role as an independent sub-agent for a full audit." },
    { command: "/cook:smart-review", description: "Advanced code review pass to improve quality before committing." },
    { command: "/cook:multi-role security,performance --agent", description: "Run multiple expert roles in parallel against the codebase." },
  ],
  whenToUse: [
    "You want a ready-made command set covering the full dev loop: PR list/create/review/fix, refactor, semantic commit, CI checks.",
    "You want to switch Claude into expert personas (security, architect, frontend, backend, performance, qa, mobile, reviewer, analyzer), optionally as parallel sub-agents.",
    "You work in a non-English team and want native-language command and role docs (Japanese, Korean, Chinese, Spanish, French, Portuguese).",
    "You want file-permission safety hooks that preserve and restore permissions around tool use.",
  ],
  howToUse: `This is a **plugin marketplace**. Add it once, then install one language plugin:

\`\`\`bash
/plugin marketplace add wasabeef/claude-code-cookbook
/plugin install cook-en@claude-code-cookbook   # or cook (ja), cook-ko, cook-zh-cn, cook-zh-tw, cook-es, cook-fr, cook-pt
\`\`\`

Commands and agents are namespaced with the \`cook\` plugin prefix:

\`\`\`bash
/cook:pr-create
/cook:semantic-commit
/cook:role architect
@agent-cook:frontend
/cook:            # explore all commands
\`\`\`

Roles can run inline or as isolated sub-agents with \`--agent\`, and \`/cook:multi-role\` fans several roles out in parallel.`,
  whyUseful: `An Apache-2.0 collection (~1.1k stars, actively maintained — v3.2.0, 199 commits) from wasabeef, a prolific Android/Flutter OSS maintainer. It bundles 39 workflow commands, 9 expert roles, and a \`preserve-file-permissions.sh\` safety hook into one marketplace, with full native translations across 8 languages — rare for a Claude Code plugin. The role-as-sub-agent and \`multi-role\` parallel execution let you run security and performance audits in isolated contexts without polluting the main thread.`,
  examplePrompt: "/cook:role security --agent then \"Perform a comprehensive security audit of this authentication flow.\"",
  author: "wasabeef (Daichi Furiya)",
  dateAdded: "2026-06-20",
};
