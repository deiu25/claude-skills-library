import type { Skill } from "../types";

export const skill: Skill = {
  slug: "dev-browser",
  name: "Dev Browser",
  tagline: "CLI that lets AI agents drive real browsers via sandboxed JavaScript scripts with the full Playwright API.",
  category: "testing",
  tags: ["browser-automation", "playwright", "cli", "agent-tools", "computer-use", "sandbox"],
  repo: "SawyerHood/dev-browser",
  install: {
    method: "manual-copy",
    command: "npm install -g dev-browser && dev-browser install",
  },
  update: {
    command: "npm install -g dev-browser@latest",
    note: "Global npm CLI: re-run the install to pull the newest release (re-runs the postinstall that fetches Playwright + Chromium).",
  },
  usage: [
    { command: "dev-browser --headless", description: "Launch a headless Chromium and run the script piped on stdin." },
    { command: "dev-browser --connect", description: "Attach to your running Chrome via remote-debugging (chrome://inspect)." },
    { command: "dev-browser install", description: "One-time setup that installs Playwright plus Chromium." },
    { command: "dev-browser --help", description: "Prints the full LLM usage guide, API reference, and examples for agents." },
    { command: "browser.getPage(\"main\")", description: "In-script: get/create a persistent named Playwright page to navigate and interact." },
    { command: "page.cua / page.domCua", description: "In-script: pixel/vision and DOM-id computer-use toolsets for click, type, scroll, screenshot." },
  ],
  whenToUse: [
    "You want an AI agent to drive a real browser (navigate, fill, click, screenshot) more cheaply and in fewer turns than Playwright MCP.",
    "You need persistent named pages so the agent can navigate once and interact across multiple separate scripts.",
    "You want the agent to run browser scripts in a sandboxed JavaScript runtime with restricted host access instead of raw Node.",
    "You need to attach to your own logged-in Chrome session for authenticated web tasks.",
  ],
  howToUse: `This is a **CLI tool**, not a skill or plugin. Install it once and your agent invokes it via Bash.

\`\`\`bash
npm install -g dev-browser
dev-browser install    # installs Playwright + Chromium
\`\`\`

Run a script by piping it on stdin:

\`\`\`bash
dev-browser --headless <<'EOF'
const page = await browser.getPage("main");
await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
console.log(await page.title());
EOF
\`\`\`

Attach to your running Chrome (enable remote debugging at \`chrome://inspect\`):

\`\`\`bash
dev-browser --connect <<'EOF'
console.log(JSON.stringify(await browser.listPages(), null, 2));
EOF
\`\`\`

To skip approval prompts in Claude Code, add \`"Bash(dev-browser *)"\` to the \`allow\` list in \`.claude/settings.json\`. Agents discover the full API by running \`dev-browser --help\` — the README states "No plugin or skill installation needed." A legacy \`/plugin marketplace add sawyerhood/dev-browser\` path exists but the README steers agents to the CLI.`,
  whyUseful: `From Sawyer Hood (Do Browser), it earns its place by being faster and cheaper than the alternatives at agentic web tasks: the README's eval clocks Dev Browser at 3m53s / $0.88 / 29 turns vs Playwright MCP at 4m31s / $1.45 / 51 turns (both 100% success). Scripts run in a sandboxed JavaScript runtime with restricted host filesystem access (reads/writes confined to \`~/.dev-browser/tmp/\`), yet still expose the full Playwright Page API plus two computer-use tiers (\`page.cua\` pixel/vision and \`page.domCua\` DOM-id) and \`snapshotForAI\`. Persistent named pages and auto-connect to your real Chrome make multi-step, authenticated flows practical without standing up an MCP server.`,
  examplePrompt: "Use dev-browser to open example.com headless, log in with these credentials, screenshot the dashboard, and report the page title.",
  author: "Sawyer Hood",
  dateAdded: "2026-06-20",
};
