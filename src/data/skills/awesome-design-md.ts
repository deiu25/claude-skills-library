import type { Skill } from "../types";

export const skill: Skill = {
  slug: "awesome-design-md",
  name: "Awesome DESIGN.md",
  tagline: "Curated collection of ~73 DESIGN.md design-system files from popular brands for AI coding agents to match.",
  category: "design",
  tags: ["design-system", "design-md", "ui-generation", "awesome-list", "design-tokens", "stitch"],
  repo: "VoltAgent/awesome-design-md",
  repoPath: "design-md",
  install: {
    method: "manual-copy",
    command: "Copy a brand's DESIGN.md from design-md/<brand>/ into your project root",
  },
  whenToUse: [
    "You want generated UI to visually match an established brand (Stripe, Vercel, Linear, Apple) without exporting Figma or building a token schema",
    "You need a ready-made DESIGN.md to drop into a project so any coding agent has instant color/typography/component context",
    "You want a reference template and concrete examples for authoring your own DESIGN.md design system",
    "You are evaluating how popular sites structure design tokens, palettes, and layout rules in plain text",
  ],
  howToUse: `This is a repository of reference design-system documents, not an installable skill or plugin. Each brand lives under \`design-md/<brand>/\` with a \`DESIGN.md\`.

\`\`\`
1. Browse design-md/ and pick a brand (e.g. stripe, vercel, apple, claude).
2. Copy that brand's DESIGN.md into your project root.
3. Tell your AI coding agent to use it ("build me a page that looks like this").
\`\`\`

The \`DESIGN.md\` format is a plain-text design-system convention (introduced by Google Stitch) describing visual theme, colors, typography, component styling, layout, depth, do's/don'ts, and responsive behavior — no Figma, JSON schema, or tooling required. It is agent-agnostic and works with Claude Code, Cursor, Codex, Gemini CLI, and Google Stitch.`,
  whyUseful: `Provides ~73 reverse-engineered, copy-paste design systems from well-known brands so an AI agent produces visually consistent, on-brand UI from a single plain-text file instead of vague prompts. Because DESIGN.md is just markdown, it drops into any project and any coding agent, and the per-brand examples make it a strong reference for writing your own design spec. MIT-licensed and widely used.`,
  examplePrompt: "Build me a landing page that matches design-md/stripe/DESIGN.md — use those colors, typography, and component styling.",
  author: "VoltAgent",
  dateAdded: "2026-06-14",
};
