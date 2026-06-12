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
