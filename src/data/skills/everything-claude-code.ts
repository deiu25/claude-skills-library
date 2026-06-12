import type { Skill } from "../types";

export const skill: Skill = {
  slug: "everything-claude-code",
  name: "Everything Claude Code",
  tagline: "A massive toolkit of agents, commands, skills, rules, and hooks for productive sessions.",
  category: "workflow",
  tags: ["plugin-suite", "agents", "hooks", "commands", "collection"],
  repo: "affaan-m/ECC",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add affaan-m/ECC",
  },
  whenToUse: [
    "You want language-specific reviewers (TypeScript, Python, Go, Rust, Java) on tap",
    "Build-error resolvers that fix failing builds with minimal diffs",
    "Ready-made patterns for TDD, security review, deployment, and docs",
    "One install that covers most day-to-day engineering workflows",
  ],
  howToUse: `Install the marketplace, then enable the plugin. It registers dozens of agents and skills that activate contextually: code reviewers fire after edits in their language, build resolvers fire on failing builds, pattern skills (laravel-patterns, postgres-patterns, frontend-patterns) load when the stack matches.

\`\`\`
/everything-claude-code:code-review
/everything-claude-code:tdd
/everything-claude-code:plan
\`\`\``,
  whyUseful: `The broadest single collection in the ecosystem. Instead of hunting for a separate reviewer per language and a separate skill per workflow, one marketplace gives a coherent, maintained set. Good first install for a new machine; cherry-pick favorites from it later.`,
  examplePrompt: "/everything-claude-code:code-review this branch",
  author: "affaan-m",
  dateAdded: "2026-06-12",
};
