import type { Skill } from "../types";

export const skill: Skill = {
  slug: "gstack",
  name: "gstack",
  tagline: "Garry Tan's Claude Code setup: 23+ role-based slash commands enforcing a think-plan-build-review-test-ship workflow.",
  category: "workflow",
  tags: ["workflow", "agents", "code-review", "qa", "design-review"],
  repo: "garrytan/gstack",
  install: {
    method: "manual-copy",
    command:
      "git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup",
  },
  whenToUse: [
    "You are a solo builder who wants Claude Code to act as a full engineering team (CEO, architect, designer, QA lead, security officer)",
    "You want a repeatable sprint process: think, plan, build, review, test, ship, reflect, instead of ad-hoc prompting",
    "You need structured planning reviews (product scope, architecture, design audit) before writing code",
    "You want browser-based QA against a live/staging URL plus automated PR creation and deployment",
  ],
  howToUse: `After cloning into \`~/.claude/skills/gstack\` and running \`./setup\`, add a gstack section to your project's \`CLAUDE.md\`, then drive a feature through the sprint by chaining slash commands.

\`\`\`bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup
\`\`\`

Typical loop inside Claude Code:
\`/office-hours\` (reframe the idea) -> \`/plan-ceo-review\` + \`/plan-eng-review\` + \`/plan-design-review\` (or \`/autoplan\`) -> implement -> \`/review\` (staff-engineer bug hunt) -> \`/qa <staging-url>\` (real-browser testing) -> \`/ship\` (open PR) -> \`/land-and-deploy\`. Extras: \`/cso\` (security audit), \`/design-shotgun\`, \`/browse\`, \`/pair-agent\`, iOS QA, and safety commands \`/careful\`, \`/freeze\`, \`/guard\`. Requires Bun v1.0+.`,
  whyUseful: `gstack packages an entire AI engineering team into one installable skill collection, replacing scattered prompts with a disciplined sprint pipeline where each role's output feeds the next stage. It covers the full lifecycle most individual skills don't — from product interrogation and multi-angle planning reviews through real-browser QA, security audits, and automated shipping. Created by Garry Tan (YC CEO), MIT-licensed.`,
  examplePrompt: "/office-hours I want to build a daily briefing app for my calendar",
  author: "garrytan (Garry Tan)",
  dateAdded: "2026-06-14",
};
