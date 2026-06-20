import type { Skill } from "../types";

export const skill: Skill = {
  slug: "harness-optimizer",
  name: "Harness Optimizer",
  tagline: "Skill that scans, scores, and auto-fixes your Claude Code harness against Anthropic's 8 harness design principles.",
  category: "productivity",
  tags: ["harness", "audit", "skills", "agents", "claude-code", "auto-fix"],
  repo: "CaesiumY/harness-optimizer",
  install: {
    method: "npx-skills",
    command: "npx skills add CaesiumY/harness-optimizer",
  },
  update: {
    command: "npx skills add CaesiumY/harness-optimizer",
    note: "Re-run the install command to pull the latest version of the skill.",
  },
  usage: [
    { command: "optimize harness", description: "Scan, diagnose, report, and auto-fix the current project's harness." },
    { command: "diagnose harness --report-only", description: "Output the PASS/FAIL/PARTIAL diagnostic report and health grade, skip auto-fix." },
    { command: "check my harness --dry-run", description: "Show proposed Tier 1/Tier 2 fixes without modifying any files." },
    { command: "--path <path>", description: "Target a project directory other than the current one." },
    { command: "harness health", description: "Trigger phrase that returns the 0-100 health grade across the 8 principles." },
  ],
  whenToUse: [
    "You have built skills, agents, commands, hooks, or a plugin and want to know if your harness follows Anthropic's long-running-app design principles.",
    "You want a 0-100 health grade and per-principle PASS/FAIL scorecard for your .claude/ setup or plugin.json.",
    "Your multi-agent setup lacks evaluator separation, context-reset strategy, or feedback loops and you want concrete fixes applied.",
    "You are auditing a plugin or CLAUDE.md project before sharing it and want auto-fixes with a dry-run preview first.",
  ],
  howToUse: `Install the skill, then trigger it with a natural-language phrase:

\`\`\`bash
npx skills add CaesiumY/harness-optimizer
\`\`\`

Then in Claude Code:

\`\`\`text
optimize harness
diagnose harness --report-only
check my harness --dry-run --path ./my-plugin
\`\`\`

It runs four operations: **Scan** (auto-detects skills, agents, commands, hooks, CLAUDE.md, plugin.json, MCP config, settings), **Diagnose** (2-layer Grep/Glob signal collection + LLM semantic judgment against the 8 principles), **Report** (per-principle scores weighted to a 0-100 grade), and **Fix** (Tier 1 edits existing files, Tier 2 creates new files on confirmation). Use \`--report-only\` to skip fixes or \`--dry-run\` to preview them.`,
  whyUseful: `Codifies Anthropic's "Harness design for long-running application development" article (by Prithvi Rajasekaran) into an actionable audit, scoring your setup against 8 weighted principles like evaluator separation, context management, and feedback loops. The 2-layer diagnostic avoids naive keyword matching: Grep collects signals, then the LLM reads file contents to confirm a principle is actually implemented, cutting false positives and negatives. It is one of the few tools that audits the harness itself rather than the code, and ships tiered auto-fixes so findings translate directly into changes.`,
  examplePrompt: "diagnose harness --report-only for this plugin and give me the per-principle scorecard",
  author: "CaesiumY",
  dateAdded: "2026-06-20",
};
