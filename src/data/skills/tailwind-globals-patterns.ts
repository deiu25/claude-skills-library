import type { Skill } from "../types";

export const skill: Skill = {
  slug: "tailwind-globals-patterns",
  name: "Tailwind Globals Patterns",
  tagline: "Extracts repeated Tailwind utility clusters into reusable @utility classes and design tokens.",
  category: "code-quality",
  tags: ["tailwind", "css", "refactoring", "design-tokens", "dry"],
  repo: null,
  install: {
    method: "manual-copy",
    command: "Copy the skill folder into ~/.claude/skills/ or your project's .claude/skills/",
  },
  whenToUse: [
    "The same long className repeats across 3+ components",
    "Adding design tokens to the @theme block in Tailwind v4",
    "Keeping light/dark styling DRY at the stylesheet layer instead of per-component",
  ],
  howToUse: `Trigger with phrases like "extract UI pattern to globals" or "this className is duplicated everywhere". The skill owns the stylesheet layer: it identifies repeated utility clusters, authors v4 \`@utility\` classes in globals.css, adds \`@theme\` tokens, refactors components to use them, and updates the project's reusable-classes documentation.`,
  whyUseful: `Tailwind's biggest maintenance cost is className duplication drifting out of sync: one button gets the hover tweak, five copies do not. Moving repeated clusters into named utilities makes the design system explicit and greppable. A custom skill example worth adapting to any Tailwind v4 codebase.`,
  examplePrompt: "This card className is duplicated everywhere, extract it to globals",
  author: "Custom (local skill)",
  dateAdded: "2026-06-12",
};
