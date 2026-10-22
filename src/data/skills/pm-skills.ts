import type { Skill } from "../types";

export const skill: Skill = {
  slug: "pm-skills",
  name: "PM Skills Marketplace",
  tagline:
    "Product-management skills and chained workflows as Claude Code plugins: discovery, strategy, execution, launch and growth.",
  category: "domain",
  tags: ["product-management", "prd", "strategy", "discovery", "go-to-market", "marketplace"],
  repo: "phuryn/pm-skills",
  install: {
    method: "marketplace",
    command: "claude plugin marketplace add phuryn/pm-skills",
  },
  update: {
    command: "claude plugin marketplace update pm-skills",
    note: "Then run /reload-plugins, or start a new session. Inside Claude Code: `/plugin marketplace update pm-skills`.",
  },
  usage: [
    { command: "/discover", description: "Run a full discovery cycle: ideation, assumption mapping, prioritization, experiment design." },
    { command: "/strategy", description: "Create a product strategy with the Strategy Canvas, from vision to defensibility." },
    { command: "/write-prd", description: "Draft a lean PRD from a feature idea or problem statement, with a fuller spec on request." },
    { command: "/red-team-prd", description: "Adversarially stress-test a PRD for gaps, risks, and unstated assumptions before build." },
    { command: "/plan-launch", description: "Create a go-to-market strategy: beachhead segment, ICP, messaging, channels and launch plan." },
    { command: "/north-star", description: "Define a North Star metric and the input metrics that drive it." },
    { command: "/analyze-cohorts", description: "Cohort analysis of user data: retention curves, feature adoption and engagement trends." },
    { command: "/ship-check", description: "Turn a vibe-coded repo into a shipping packet: docs, correctness, security and performance reviews, test coverage." },
    { command: "/security-audit-static", description: "Static security audit of a vibe-coded app for intended-vs-implemented security gaps." },
  ],
  whenToUse: [
    "You do product-management work in Claude and want proven PM frameworks (Torres, Cagan, Savoia) built into the workflow, not sitting on a shelf",
    "Writing or pressure-testing a PRD, defining OKRs, or planning a sprint or launch",
    "Running discovery — assumption mapping, interview synthesis, opportunity solution trees, experiment design",
    "Building strategy artifacts: vision, lean/business-model canvas, SWOT, PESTLE, Porter's Five Forces, pricing",
    "You're a PM or founder accountable for AI-built code and need a reviewer-ready shipping packet with security and performance audits",
  ],
  howToUse: `Add the marketplace, then install the plugins you want. Each plugin is a focused PM domain; install all of them for the full toolkit.

\`\`\`bash
claude plugin marketplace add phuryn/pm-skills
claude plugin install pm-product-discovery@pm-skills
claude plugin install pm-product-strategy@pm-skills
claude plugin install pm-execution@pm-skills
claude plugin install pm-market-research@pm-skills
claude plugin install pm-data-analytics@pm-skills
claude plugin install pm-go-to-market@pm-skills
claude plugin install pm-marketing-growth@pm-skills
claude plugin install pm-toolkit@pm-skills
claude plugin install pm-ai-shipping@pm-skills
\`\`\`

Inside Claude Code you can also run \`/plugin marketplace add phuryn/pm-skills\` and install plugins from the \`/plugin\` menu. Then invoke a workflow by its slash command:

\`\`\`
/write-prd a self-serve onboarding flow that lifts week-1 activation
\`\`\`

**The plugins.** \`pm-product-discovery\` (ideation, experiments, assumption testing, interviews) · \`pm-product-strategy\` (vision, canvases, SWOT/PESTLE/Porter, monetization) · \`pm-execution\` (PRDs, OKRs, roadmaps, sprints, pre-mortems, stories) · \`pm-market-research\` (personas, segmentation, sentiment, competitive analysis) · \`pm-data-analytics\` (SQL generation, cohort analysis) · \`pm-go-to-market\` (GTM strategy, growth loops, beachhead, ICPs) · \`pm-marketing-growth\` (positioning, value props, naming, North Star) · \`pm-toolkit\` (resume review, NDAs, privacy policy, proofreading) · \`pm-ai-shipping\` (document a vibe-coded app, security/performance audits, shipping packet).

**Beyond Claude Code.** It's designed for Claude Code and Cowork, and also installs on Codex CLI. The skills themselves are portable — copy the skill folders into \`.gemini/skills/\`, \`.cursor/skills/\`, \`.opencode/skills/\`, or \`.kiro/skills/\` and drive them with plain language (the slash commands are Claude-specific).

**Before you run it.** \`/ship-check\` writes \`CLAUDE.md\` and \`AGENTS.md\`, can send your code to another vendor's model for an independent review, and fans its audits out to subagents, so a run uses many tokens. \`/write-prd\` researches the web, so your product idea can end up in search queries.`,
  whyUseful: `Generic AI hands you text; PM Skills hands you structure. Each skill encodes a proven product-management framework — continuous discovery, assumption mapping, prioritization, strategy canvases — and walks you through it step by step, so the output has the rigor of the methods behind it rather than a plausible-sounding draft. The skills and chained workflows span the full PM arc — discovery → strategy → execution → market research → analytics → go-to-market → growth — plus a standout \`pm-ai-shipping\` kit aimed squarely at PMs and founders shipping AI-built code: it documents a vibe-coded app, audits security gaps between documented intent and code, reviews performance, and produces a reviewer-ready packet. It's MIT-licensed, curated by Paweł Huryn of The Product Compass, and installs as native Claude Code / Cowork plugins with portable skills for other assistants.`,
  examplePrompt: "/write-prd a self-serve onboarding flow that lifts week-1 activation",
  author: "Paweł Huryn (The Product Compass)",
  dateAdded: "2026-10-22",
};
