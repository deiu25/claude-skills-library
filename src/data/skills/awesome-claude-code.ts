import type { Skill } from "../types";

export const skill: Skill = {
  slug: "awesome-claude-code",
  name: "Awesome Claude Code",
  tagline: "Canonical awesome-list of Claude Code resources: skills, agents, hooks, status lines, slash commands, orchestrators, and tooling.",
  category: "resource",
  tags: ["awesome-list", "slash-commands", "claude-md", "skills", "curated", "resources"],
  repo: "hesreallyhim/awesome-claude-code",
  install: {
    method: "manual-copy",
    command: "Browse at github.com/hesreallyhim/awesome-claude-code",
  },
  update: {
    command: "git pull / re-visit the repo",
    note: "Curated list — no install. Bookmark and revisit; the catalog updates as the maintainer merges bot-generated PRs.",
  },
  usage: [
    { command: "git clone https://github.com/hesreallyhim/awesome-claude-code", description: "Clone to browse the full catalog and vendored resource files locally." },
    { command: "THE_RESOURCES_TABLE.csv", description: "Machine-readable master table of every listed resource (name, category, links, author, license, description)." },
    { command: "resources/slash-commands/", description: "Vendored example slash commands you can copy into ~/.claude/commands." },
    { command: "resources/claude.md-files/", description: "Real-world CLAUDE.md examples to model your own project memory on." },
    { command: "resources/workflows-knowledge-guides/", description: "Curated workflows and knowledge guides for getting more out of Claude Code." },
    { command: "issues/new?template=recommend-resource.yml", description: "Submit your own resource via the required web issue form (no PRs, gh CLI is rejected)." },
  ],
  whenToUse: [
    "You want a vetted starting point for skills, slash commands, hooks, status lines, or orchestrators instead of building from scratch.",
    "You're writing a CLAUDE.md and want battle-tested examples to model.",
    "You want to discover well-known Claude Code tooling, workflows, and official docs in one curated place.",
    "You've built a Claude Code resource and want it listed (with an awesome.re 'Mentioned in' badge).",
  ],
  howToUse: `This is a **curated awesome-list**, not an installable plugin or skill. Browse it on GitHub or clone it to read locally.

\`\`\`bash
git clone https://github.com/hesreallyhim/awesome-claude-code
\`\`\`

The master catalog is \`THE_RESOURCES_TABLE.csv\` (a structured CSV index), and example resources are vendored under \`resources/\` (\`slash-commands/\`, \`claude.md-files/\`, \`workflows-knowledge-guides/\`, \`official-documentation/\`). Copy any slash command into \`~/.claude/commands/\` to use it.

Note: the README is mid-reorganization (its Table of Contents currently reads "TODO"), so the CSV is the most reliable index right now.

To get your own resource listed you **must** use the web issue form — PRs and the \`gh\` CLI are rejected, and bypassing the form risks a ban:

\`\`\`
https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml
\`\`\`

A bot validates the submission (required fields, reachable URLs, no duplicates, license, description quality), the maintainer reviews, then the bot opens the PR automatically.`,
  whyUseful: `The original and most-cited "awesome" list for Claude Code, maintained by hesreallyhim with an explicitly *selective* editorial bar — emphasizing code quality, security, and originality over raw volume. Unlike auto-scraped lists, every entry passes bot validation plus human review, and the data is kept in a structured CSV (\`THE_RESOURCES_TABLE.csv\`) with vendored examples, so it doubles as a machine-readable index. It is the standard place both to discover proven Claude Code resources and to get your own work surfaced (with an awesome.re "Mentioned in" badge).`,
  examplePrompt: "Clone hesreallyhim/awesome-claude-code and from THE_RESOURCES_TABLE.csv list the slash commands related to code review, then copy the best one into ~/.claude/commands.",
  author: "hesreallyhim",
  dateAdded: "2026-06-20",
};
