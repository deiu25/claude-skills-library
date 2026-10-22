import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-ads",
  name: "Claude Ads",
  tagline:
    "Paid-media audits, plans and creative across major ad platforms, with cited evidence, versioned JSON reports and gated account changes.",
  category: "domain",
  tags: ["paid-ads", "ppc", "google-ads", "meta-ads", "attribution", "marketplace"],
  repo: "AgriciDaniel/claude-ads",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add agricidaniel/claude-ads",
  },
  update: {
    command: "/plugin marketplace update ai-marketing-hub-claude-ads",
    note: "Then /reload-plugins. From a shell: `claude plugin marketplace update ai-marketing-hub-claude-ads`. Added it before v2.0.0? Remove the old `agricidaniel-claude-ads` marketplace first.",
  },
  usage: [
    { command: "/claude-ads:ads", description: "Conductor: routes a paid-media request to the right platform and lifecycle skill." },
    { command: "/claude-ads:ads-audit", description: "Source-grounded account audit with deterministic findings, evidence coverage and a versioned JSON report." },
    { command: "/claude-ads:ads-plan", description: "Build a media plan: budgets, channel mix, structure and forecast." },
    { command: "/claude-ads:ads-google", description: "Google Ads audit, read-only: search terms, PMax, bidding, conversion tracking." },
    { command: "/claude-ads:ads-meta", description: "Meta Ads audit, read-only: Pixel/CAPI, creative fatigue, audiences, placements." },
    { command: "/claude-ads:ads-creative", description: "Cross-platform creative review: fit, concept diversity, fatigue, refresh calls." },
    { command: "/claude-ads:ads-generate", description: "Generate ad image assets from a validated creative brief, through an image provider you configure." },
    { command: "/claude-ads:ads-attribution", description: "Reconcile conversion taxonomy, attribution windows and cross-platform data." },
    { command: "/claude-ads:ads-monitor", description: "Ongoing review of pacing, delivery, tracking, creative fatigue, policy and anomalies." },
    { command: "/claude-ads:ads-optimize", description: "Bid and budget changes grounded in evidence: drafted by default, applied only when you ask." },
  ],
  whenToUse: [
    "You run paid media (PPC, social, retail media) and want repeatable audits instead of ad-hoc account reviews",
    "Auditing or planning across Google, Meta, YouTube, LinkedIn, TikTok, Microsoft, Apple, Amazon, Reddit, Pinterest, Snapchat, or X",
    "You need a versioned, defensible report — deterministic findings, cited evidence, and controls — to hand a client or stakeholder",
    "Working on attribution, server-side tracking, or cross-platform conversion reconciliation",
    "Reviewing ad creative for fatigue and fit, or generating image assets from a creative brief",
    "You want account changes gated behind explicit approval rather than an agent editing live campaigns unprompted",
  ],
  howToUse: `Add the marketplace and install the plugin inside Claude Code:

\`\`\`
/plugin marketplace add agricidaniel/claude-ads
/plugin install claude-ads@ai-marketing-hub-claude-ads
\`\`\`

From a shell, \`claude plugin marketplace add\` and \`claude plugin install\` take the same arguments. Plugin commands are namespaced, so each one starts with \`/claude-ads:\`:

\`\`\`
/claude-ads:ads audit google
\`\`\`

**Two ways in.** \`/claude-ads:ads\` is the conductor: it routes the request to the right platform and lifecycle skill. Or call a skill directly: one per platform (\`/claude-ads:ads-google\`, \`/claude-ads:ads-meta\`, …) plus lifecycle skills for audits, planning, creative, measurement and operations.

**Under the hood.** Audits fan out to one worker per selected platform, plus cross-platform workers for tracking, creative, budget and policy when their inputs exist. Findings are deterministic, and the Markdown, HTML and PDF reports are renderings of the same versioned JSON bundle. Account changes stay drafts until the full mutation gate passes: a granted capability, explicit IDs, a before/after diff, owner approval, rollback and verification.

**Before you rely on it.** Reading an account needs that platform's API credentials; \`/claude-ads:ads-setup\` stores references to them, never the values, so don't paste tokens into the chat. \`/claude-ads:ads-generate\` sends briefs to the image provider you configure, and \`/claude-ads:ads research refresh\` fetches platform, policy and benchmark sources. Claude Code is the only verified runtime: the installer's Codex, Gemini, Cursor, Windsurf and Goose targets are experimental.`,
  whyUseful: `Most "run my ads" agents improvise: they eyeball an account, output plausible advice, and give you a different answer every time. Claude Ads is built the opposite way. Its skills are source-grounded: findings cite evidence, and platform claims need a dated source. Audits run one worker per selected platform, plus cross-platform workers for tracking, creative, budget and policy, each returning schema-valid results. Findings are deterministic and reports are versioned JSON, so results are defensible to a client, not a fresh guess per run. It covers the whole lifecycle across Google, Meta, YouTube, LinkedIn, TikTok, Microsoft, Apple, Amazon, Reddit, Pinterest, Snapchat and X: audit, plan, creative, launch, monitor, optimize, attribution and reporting. It analyzes and plans freely, and keeps account changes as drafts until the full mutation gate passes.

MIT-licensed. Upstream calls the current version a development candidate, not release-ready, and keeps account-health scores disabled until a scoring policy is approved.`,
  examplePrompt: "/claude-ads:ads audit google",
  author: "AgriciDaniel",
  dateAdded: "2026-10-22",
};
