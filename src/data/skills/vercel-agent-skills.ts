import type { Skill } from "../types";

export const skill: Skill = {
  slug: "vercel-agent-skills",
  name: "Vercel Agent Skills",
  tagline: "Vercel's prioritized rubrics for React, Next.js, web design, and deployment optimization.",
  category: "code-quality",
  tags: ["react", "nextjs", "performance", "frontend", "vercel"],
  repo: "vercel-labs/agent-skills",
  install: {
    method: "npx-skills",
    command: "npx skills add vercel-labs/agent-skills",
  },
  whenToUse: [
    "Writing or reviewing React/Next.js code against impact-ranked best-practice rules",
    "Killing request waterfalls and shipping statically-analyzable, bundle-friendly imports",
    "Auditing a deployed Vercel project for cost, caching (ISR), and middleware usage",
    "Enforcing consistent web-design and writing guidelines pulled from a live source",
  ],
  howToUse: `Install with the open \`skills\` CLI; the agent invokes the relevant rubric when it detects a matching task.

\`\`\`
npx skills add vercel-labs/agent-skills
\`\`\`

Ships \`react-best-practices\` (64 rules tiered Critical/High/Low), \`web-design-guidelines\`, \`writing-guidelines\`, and \`vercel-optimize\`. The React skill constrains the agent to fixes like \`Promise.all()\` for parallel fetches and \`React.cache()\` for dedup.`,
  whyUseful: `Maintained by Vercel, this encodes the framework authors' own optimization priorities as enforceable rules rather than vague advice. Because rules are ranked by architectural impact, the agent fixes high-leverage problems (waterfalls, bundle size) first instead of micro-optimizations that don't matter.`,
  examplePrompt: "Audit this Next.js page with vercel react-best-practices and fix the critical issues",
  author: "Vercel",
  dateAdded: "2026-06-14",
};
