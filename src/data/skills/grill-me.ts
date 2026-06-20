import type { Skill } from "../types";

export const skill: Skill = {
  slug: "grill-me",
  name: "Grill Me",
  tagline: "Interviews you relentlessly about a plan until every branch of the decision tree is resolved.",
  category: "research",
  tags: ["planning", "interview", "design-review", "requirements"],
  repo: null,
  install: {
    method: "manual-copy",
    command: "Copy SKILL.md into ~/.claude/skills/grill-me/",
  },
  update: {
    command: "Re-copy the latest SKILL.md into ~/.claude/skills/grill-me/",
    note: "Local skill with no upstream repo; re-copy from the source you installed it from to update.",
  },
  usage: [
    { command: "grill me", description: "Enter interviewer mode and start the grilling session." },
    { command: "Grill me on this migration plan", description: "Attach a plan or design and have it stress-tested." },
    { command: "Grill me on my plan to move billing from Stripe Checkout to Elements", description: "Grill a specific architecture or decision end to end." },
  ],
  whenToUse: [
    "Stress-testing a plan or architecture before committing to it",
    "You suspect your design has holes you cannot see yourself",
    "Requirements feel settled but nobody has pushed back on them",
  ],
  howToUse: `Say "grill me" with a plan or design attached:

\`\`\`
Grill me on this migration plan
\`\`\`

Claude switches into interviewer mode: one pointed question at a time, following up on weak answers, branching into edge cases, and not stopping until shared understanding is reached on every open decision.`,
  whyUseful: `The cheapest time to find a design flaw is before implementation. A relentless interviewer surfaces the assumptions you did not know you were making: failure modes, rollback paths, scale limits, ownership questions. Twenty minutes of grilling routinely saves days of rework.`,
  examplePrompt: "Grill me on my plan to move billing from Stripe Checkout to Elements",
  author: "Community",
  dateAdded: "2026-06-12",
};
