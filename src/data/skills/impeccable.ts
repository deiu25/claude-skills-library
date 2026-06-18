import type { Skill } from "../types";

export const skill: Skill = {
  slug: "impeccable",
  name: "Impeccable",
  tagline:
    "Design language for AI coding agents: 23 commands and 44 deterministic detectors that kill AI design tells and ship polished UI.",
  category: "design",
  tags: ["design", "frontend", "ui", "ux", "design-system", "accessibility"],
  repo: "pbakaus/impeccable",
  install: {
    method: "npx-skills",
    command: "npx impeccable install",
  },
  whenToUse: [
    "You want AI-generated frontends to stop shipping the same tells (Inter everywhere, purple gradients, cards nested in cards, gray text on color)",
    "You need a shared design vocabulary with your agent — craft, shape, audit, critique, polish, distill, harden, animate, and more",
    "You want deterministic, no-API-key checks that catch design anti-patterns and a11y/perf/responsive issues on every UI edit",
    "You run multiple AI harnesses (Claude Code, Cursor, Codex, Gemini CLI, Copilot…) and want one design workflow across all of them",
  ],
  howToUse: `Install with the npx command (it detects your harness and asks project vs global), then run \`/impeccable init\` once to write \`PRODUCT.md\` and \`DESIGN.md\` design context that every later command reads.

\`\`\`bash
npx impeccable install
\`\`\`

Drive it with the single \`/impeccable <command> <target>\` entry point — e.g. \`/impeccable audit landing\`, \`/impeccable critique\`, \`/impeccable polish settings\`, \`/impeccable harden checkout\`. There are 23 commands plus \`/impeccable live\` for in-browser variant iteration. Opt the per-project design-detector hook in with \`/impeccable hooks on\` so the 44 deterministic rules run after every UI edit and surface findings inline. \`/impeccable pin <command>\` creates standalone shortcuts (e.g. \`/audit\`).`,
  whyUseful: `Every model trained on the same SaaS templates, so skipping design guidance yields the same handful of tells on every project. Impeccable started from Anthropic's frontend-design skill and goes further: one setup flow that captures audience, brand lane, voice, anti-references, color, and type; 23 commands that give you and your agent a shared design vocabulary; and 44 deterministic detector rules that run with no LLM and no API key (in the CLI and a browser extension) to catch anti-patterns before they ship. Apache-2.0, ~39k stars, by Paul Bakaus, and it installs across nine+ AI runtimes so the discipline travels with you.`,
  examplePrompt: "/impeccable audit my landing page",
  author: "Paul Bakaus",
  featured: true,
  dateAdded: "2026-06-18",
};
