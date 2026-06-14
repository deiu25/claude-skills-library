import type { Skill } from "../types";

export const skill: Skill = {
  slug: "marketingskills",
  name: "Marketing Skills",
  tagline: "44 marketing skills for AI agents: CRO, copywriting, SEO, paid ads, analytics, and growth engineering.",
  category: "domain",
  tags: ["marketing", "seo", "copywriting", "cro", "growth", "skill-collection"],
  repo: "coreyhaines31/marketingskills",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add coreyhaines31/marketingskills",
  },
  whenToUse: [
    "You want AI help with marketing tasks like landing-page CRO, homepage copy, or cold email sequences",
    "You need SEO work (technical audits, AI SEO, programmatic SEO, schema, site architecture)",
    "You are setting up analytics/GA4 tracking or designing an A/B test",
    "You want growth-engineering frameworks: referrals, free tools, co-marketing, pricing, launches",
  ],
  howToUse: `Install via the Claude Code plugin marketplace, then either ask naturally or invoke a skill by name.

\`\`\`bash
/plugin marketplace add coreyhaines31/marketingskills
/plugin install marketing-skills
\`\`\`

Alternative installs from the README (CLI is the recommended option, works across Claude Code, Cursor, Codex, Windsurf):

\`\`\`bash
npx skills add coreyhaines31/marketingskills
npx skills add coreyhaines31/marketingskills --skill cro copywriting
\`\`\`

Once installed, request marketing help in plain language ("optimize this landing page" -> triggers \`cro\`) or invoke directly: \`/cro\`, \`/emails\`, \`/seo-audit\`. The \`product-marketing\` skill acts as the foundational context other skills consult first.`,
  whyUseful: `A single MIT-licensed pack of 44 specialized marketing skills covering the full funnel from a recognized practitioner (Corey Haines of Swipe Files / Conversion Factory). It is agent-agnostic via the Agent Skills spec and ships a Claude Code marketplace plugin, so a founder or technical marketer can give their coding agent expert playbooks for CRO, copywriting, SEO, paid ads, and analytics in one install. Skills share a common \`product-marketing\` context so outputs stay on-brand.`,
  examplePrompt: "Help me optimize this landing page for conversions and write a 5-email welcome sequence for my SaaS.",
  author: "coreyhaines31 (Corey Haines)",
  dateAdded: "2026-06-14",
};
