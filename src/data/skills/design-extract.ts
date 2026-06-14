import type { Skill } from "../types";

export const skill: Skill = {
  slug: "design-extract",
  name: "Design Extract",
  tagline: "Extract any website's design system into DTCG tokens, Tailwind, Figma vars, and shadcn themes via slash commands.",
  category: "design",
  tags: ["design-tokens", "design-system", "tailwind", "figma", "accessibility"],
  repo: "Manavarya09/design-extract",
  install: {
    method: "plugin",
    command: "/plugin install Manavarya09/design-extract",
  },
  whenToUse: [
    "You want to reverse-engineer a live website's colors, typography, spacing, and motion into structured design tokens",
    "You need DTCG tokens, a Tailwind config, shadcn theme, or Figma variables generated from an existing site",
    "You want a WCAG contrast/accessibility audit and a shareable graded design report card for a URL",
    "You want to compare two sites' design systems head-to-head, or restyle a site into another visual vocabulary",
  ],
  howToUse: `Install as a Claude Code plugin:

\`\`\`bash
/plugin install Manavarya09/design-extract
\`\`\`

It also installs via \`npx skills add Manavarya09/design-extract\`, standalone npm (\`npm i -g designlang\`), or ships an MCP server (\`npx designlang mcp\`). Once installed, each command is a slash command:

\`\`\`
/extract <url>            Full extraction -> DTCG tokens, Tailwind, Figma vars, motion, voice
/grade <url>             Shareable HTML "Design Report Card"
/battle <urlA> <urlB>    Head-to-head graded battle card
/remix <url> --as <vocab>  Restyle as brutalist / swiss / cyberpunk / editorial
/pack <url>              Bundle every output into one design-system directory
\`\`\`

A typical run points a headless Playwright browser at the URL, reads the live DOM, and writes 17+ output files you can drop straight into a project.`,
  whyUseful: `It turns the slow, manual job of auditing and replicating a website's design into a single command, emitting standards-compliant W3C DTCG tokens plus ready-to-use Tailwind, shadcn, and Figma outputs rather than just a color list. It captures responsive behavior across breakpoints, interaction states, WCAG contrast scoring, and multi-page consistency, and as a Claude Code plugin the whole pipeline runs from slash commands.`,
  examplePrompt: "/extract https://stripe.com",
  author: "Manavarya09",
  dateAdded: "2026-06-14",
};
