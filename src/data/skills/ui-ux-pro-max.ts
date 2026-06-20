import type { Skill } from "../types";

export const skill: Skill = {
  slug: "ui-ux-pro-max",
  name: "UI/UX Pro Max",
  tagline: "Searchable design intelligence: 67 styles, 96 palettes, 57 font pairings across 13 stacks.",
  category: "design",
  tags: ["ui", "ux", "design-system", "accessibility", "color", "typography"],
  repo: "nextlevelbuilder/ui-ux-pro-max-skill",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill",
  },
  update: {
    command: "/plugin marketplace update ui-ux-pro-max-skill",
    note: "Then run /reload-plugins. Official marketplaces auto-update at startup.",
  },
  usage: [
    { command: 'python3 scripts/search.py "<query>"', description: "Search the design knowledge base for matching styles, palettes, and fonts." },
    { command: "--design-system", description: "Return a full design-system recommendation (pattern, style, palette, type, effects, checklist)." },
    { command: '-p "My Project"', description: "Tag the recommendation with a project name." },
    { command: 'python3 scripts/search.py "developer tools dark mode" --design-system -p "My Project"', description: "Example: full design-system query for a dark-mode dev tool." },
    { command: "styles | colors | charts | stack", description: "Domain-specific searches to refine styles, palettes, charts, or stack guidance." },
  ],
  whenToUse: [
    "Choosing a style, palette, or font pairing for a new product",
    "Reviewing UI code for accessibility and UX issues",
    "Building dashboards, e-commerce, SaaS, or mobile app interfaces",
    "Generating a full design system recommendation before coding",
  ],
  howToUse: `The skill ships a CSV knowledge base plus a Python search CLI. The core workflow starts with a design-system query:

\`\`\`
python3 scripts/search.py "developer tools dark mode" --design-system -p "My Project"
\`\`\`

It returns a complete recommendation: pattern, style, palette with hex values, typography with Google Fonts links, key effects, anti-patterns to avoid, and a pre-delivery checklist. Domain-specific searches (styles, colors, charts, stack guidance) refine from there.`,
  whyUseful: `Instead of guessing at palettes and font pairings, you query a structured database built from real design practice. The priority system puts accessibility and touch targets first (WCAG contrast, 44px targets, focus states), so the output is not just pretty but compliant. Pairs well with an opinionated generator skill: one provides the data, the other the taste.`,
  examplePrompt: "Plan the design system for a fintech dashboard using ui-ux-pro-max",
  author: "nextlevelbuilder",
  featured: true,
  dateAdded: "2026-06-12",
};
