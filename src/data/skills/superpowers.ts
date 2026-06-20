import type { Skill } from "../types";

export const skill: Skill = {
  slug: "superpowers",
  name: "Superpowers",
  tagline: "An agentic skills framework and software development methodology that works.",
  category: "workflow",
  tags: ["methodology", "tdd", "debugging", "planning", "skills-framework"],
  repo: "obra/superpowers",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add obra/superpowers-marketplace",
  },
  update: {
    command: "/plugin marketplace update superpowers-marketplace",
    note: "Then run /reload-plugins. Official marketplaces auto-update at startup.",
  },
  usage: [
    { command: "/plugin install superpowers@superpowers-marketplace", description: "Install the superpowers plugin from the marketplace." },
    { command: "auto-activates", description: "Framework triggers the right skill at each phase (brainstorm, plan, TDD, verify)." },
    { command: "SKILL.md", description: "Extend the skills system with your own SKILL.md files." },
    { command: "process skills", description: "Built-in debugging loops, root-cause analysis, and code review." },
  ],
  whenToUse: [
    "You want a disciplined end-to-end development methodology, not ad-hoc prompting",
    "Brainstorming and refining a feature before any code is written",
    "Systematic debugging when the obvious fixes have failed",
    "Test-driven implementation with verification gates",
  ],
  howToUse: `Install the marketplace, then install the superpowers plugin. The framework auto-activates relevant skills at the right moment: brainstorming before planning, planning before implementation, TDD during, verification after.

\`\`\`
/plugin install superpowers@superpowers-marketplace
\`\`\`

It also ships a skills system you can extend with your own SKILL.md files, plus battle-tested process skills (debugging loops, root-cause analysis, code review).`,
  whyUseful: `Written by Jesse Vincent (obra), this is one of the most starred Claude Code skill frameworks. The value is the methodology: it forces the steps experienced engineers do naturally (clarify, plan, test first, verify) into the agent loop, which measurably reduces rework on non-trivial features.`,
  examplePrompt: "Brainstorm and plan a rate-limiting feature using superpowers",
  author: "obra (Jesse Vincent)",
  featured: true,
  dateAdded: "2026-06-12",
};
