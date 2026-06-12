import type { Skill } from "../types";

export const skill: Skill = {
  slug: "design-taste-frontend",
  name: "design-taste-frontend",
  tagline: "Anti-slop frontend skill that ships landing pages and portfolios that do not look templated.",
  category: "design",
  tags: ["frontend", "landing-page", "tailwind", "gsap", "motion", "anti-slop"],
  repo: "Leonxlnx/taste-skill",
  repoPath: "skills/taste-skill",
  install: {
    method: "npx-skills",
    command: 'npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"',
  },
  whenToUse: [
    "Building a new landing page, marketing site, or portfolio",
    "Redesigning an existing site that looks generic or AI-generated",
    "Any frontend work where visual taste matters more than raw speed",
    "Not for dashboards, data tables, or multi-step product UI",
  ],
  howToUse: `The skill activates on frontend design briefs. It reads the brief first and outputs a one-line "Design Read" before generating anything, then sets three dials (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY) that gate every layout and motion decision.

Invoke it explicitly with a brief:

\`\`\`
/design-taste-frontend redesign my landing page, dark, premium SaaS feel
\`\`\`

Or mention it when asking for frontend work: "use design-taste-frontend for this page".`,
  whyUseful: `Most LLM-generated frontends share the same tells: centered hero over a dark mesh, AI-purple gradients, three equal feature cards, Inter everywhere, eyebrow labels above every section. This skill bans those patterns outright and replaces them with hard rules: hero must fit the viewport, max one eyebrow per three sections, real images instead of div-based fake screenshots, one accent color locked across the whole page, and canonical GSAP/Motion code skeletons that actually work. The result reads as designed, not generated.`,
  examplePrompt: "/design-taste-frontend build a landing page for a CLI tool, Linear-clean, dark-first",
  author: "Leonxlnx",
  featured: true,
  dateAdded: "2026-06-12",
};
