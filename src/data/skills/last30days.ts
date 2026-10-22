import type { Skill } from "../types";

export const skill: Skill = {
  slug: "last30days",
  name: "last30days",
  tagline:
    "Research any topic across Reddit, X, YouTube, HN, and Polymarket, ranked by real engagement into a grounded, cited brief.",
  category: "research",
  tags: ["research", "social-listening", "trend-discovery", "reddit", "engagement-ranking"],
  repo: "mvanhorn/last30days-skill",
  repoPath: "skills/last30days",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add mvanhorn/last30days-skill",
  },
  update: {
    command: "claude plugin update last30days@last30days-skill",
    note: "Then run /reload-plugins. Cross-host: `npx skills update last30days -g`.",
  },
  usage: [
    { command: "/last30days <topic>", description: "Default: pull last-30-day posts + engagement across every source into a grounded, cited brief." },
    { command: "/last30days trending", description: "Discovery mode: nominate then deep-research what's exploding in a domain right now." },
    { command: "/last30days <a> vs <b>", description: "Comparison mode: contrast two tools, brands, or people by live community signal." },
    { command: "--competitors", description: "Competitor mode: run per-entity research across sources for a set of rivals." },
    { command: "--discover-shallow", description: "Fast, listing-only discovery sweep (thinner cards, still quality-floored)." },
    { command: "doctor", description: "Health check: diagnose broken, rate-limited, or unconfigured sources before a run." },
    { command: "library search \"<q>\" / library feed", description: "Query prior saved research, or build a local index.html + feed.xml of it." },
    { command: "--agent", description: "Emit a structured research report for use inside agent pipelines." },
  ],
  whenToUse: [
    "You want what people are actually saying about a topic right now — ranked by upvotes/views/volume, not editorial curation",
    "Pre-launch or product research: gauge real demand, complaints, and feature requests from Reddit, X, YouTube, and forums",
    "Comparing two tools, brands, or people by live community sentiment across many platforms at once",
    "Discovering what's trending or exploding in a domain (AI agents, a stock, a framework) this month",
    "Building a dated, cited evidence base you can re-query later from a local research library",
  ],
  howToUse: `Add the marketplace and install the plugin:

\`\`\`
/plugin marketplace add mvanhorn/last30days-skill
/plugin install last30days
\`\`\`

Then invoke it with a topic. The skill runs parallel searches across Reddit (with comments), X/Twitter, YouTube (transcripts), TikTok, Hacker News, Polymarket, GitHub, arXiv, Techmeme, Digg, and the web — merging duplicate stories into clusters and ranking by real engagement.

\`\`\`
/last30days what developers are saying about the Next.js App Router this month
\`\`\`

Modes are inferred from your phrasing: a plain topic → grounded brief; \`trending\` / "what's hot in X" → discovery; "A vs B" → comparison. Flags like \`--competitors\`, \`--hiring-signals\`, \`--discover-shallow\`, and \`--agent\` refine the run, and \`doctor\` reports source health.

**Requirements & config.** Needs Python 3.12+ (it installs a managed 3.12 through \`uv\` when none is found and \`uv\` is on PATH), plus Node.js and yt-dlp. A first-run setup wizard walks you through source access — all API keys are optional: \`SCRAPECREATORS_API_KEY\` (primary, unlocks most sources, TikTok and Instagram included; free GitHub signup), plus \`XAI_API_KEY\` (X search without browser cookies) and \`OPENAI_API_KEY\` (re-ranking). Digg, arXiv and Techmeme need no key, only their CLIs on PATH.

**Before you run it.** The skill declares the Bash, Read, Write, AskUserQuestion and WebSearch tools. It can read browser cookies or save API keys to \`~/.config/last30days/.env\` only with your consent, and cookie consent covers later runs too. Your topic goes to ScrapeCreators (paid credits), X, Reddit, Hacker News and Polymarket, and topic plus snippets go to the re-ranking provider whose key you set. Briefs are saved in \`~/Documents/Last30Days/\`, and \`library feed --publish\` posts your feed publicly to ht-ml.app.

Not on Claude Code? The same skill installs to any Agent Skills host with \`npx skills add mvanhorn/last30days-skill -g\`.`,
  whyUseful: `Most "research" tools hand you what an editor or the SEO game surfaced. last30days instead ranks by what real users engaged with — upvotes, likes, views, prediction-market volume — across many platforms in parallel, then merges duplicate stories and cites every source. That makes it a strong fit for genuine demand-sensing: pre-launch validation, competitor watching, and "what's actually trending" questions where recency and grounding matter more than authority. It ships guardrails that most scrapers lack — a \`doctor\` health check, per-source status (so it never claims "nothing on X" when a source merely rate-limited), keyword-trap pre-flight, and a strict badge/laws output contract that keeps the model from fabricating titles or headings. MIT-licensed, no analytics, and installable in Claude Code and other Agent Skills hosts.`,
  examplePrompt: "/last30days what developers are saying about the Next.js App Router this month",
  author: "Matt Van Horn (mvanhorn)",
  dateAdded: "2026-10-22",
};
