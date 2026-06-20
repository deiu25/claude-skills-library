import type { Skill } from "../types";

export const skill: Skill = {
  slug: "caveman",
  name: "Caveman",
  tagline: "Why use many token when few token do trick. Cuts ~65% of output tokens.",
  category: "productivity",
  tags: ["tokens", "cost", "output-style", "compression"],
  repo: "JuliusBrussee/caveman",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add JuliusBrussee/caveman",
  },
  update: {
    command: "/plugin marketplace update caveman",
    note: "Then run /reload-plugins. Official marketplaces auto-update at startup.",
  },
  usage: [
    { command: "/caveman", description: "Activate caveman mode at full (default) intensity." },
    { command: "/caveman full", description: "Set intensity to full; other levels are lite and ultra." },
    { command: '"caveman mode"', description: "Activate by saying caveman mode in plain prose." },
    { command: "/caveman-stats", description: "Show real token usage and savings report for the session." },
    { command: '"stop caveman"', description: "Revert to normal prose output." },
  ],
  whenToUse: [
    "Long working sessions where output token cost adds up",
    "You read answers fast and do not need pleasantries",
    "Pair-programming flow where terse status updates beat prose",
  ],
  howToUse: `Activate with \`/caveman\` or by saying "caveman mode". Intensity levels: lite, full (default), ultra. The model drops articles, filler, pleasantries, and hedging while keeping all technical substance: code blocks stay intact, errors are quoted exactly, security warnings revert to normal prose automatically.

\`\`\`
/caveman full
/caveman-stats   real token usage report for the session
\`\`\`

Say "stop caveman" to revert.`,
  whyUseful: `Most assistant output is packaging: "Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by..." becomes "Bug in auth middleware. Token expiry check use < not <=. Fix:". Same information, fraction of the tokens. The skill has auto-clarity rules so destructive operations and multi-step sequences stay unambiguous.`,
  examplePrompt: "/caveman full",
  author: "JuliusBrussee",
  featured: true,
  dateAdded: "2026-06-12",
};
