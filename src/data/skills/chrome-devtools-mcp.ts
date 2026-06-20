import type { Skill } from "../types";

export const skill: Skill = {
  slug: "chrome-devtools-mcp",
  name: "Chrome DevTools MCP",
  tagline: "Chrome DevTools team's MCP server that drives a live Chrome via Puppeteer for automation, debugging, and performance traces.",
  category: "mcp",
  tags: ["mcp-server", "chrome", "browser-automation", "performance", "debugging", "puppeteer"],
  repo: "ChromeDevTools/chrome-devtools-mcp",
  install: {
    method: "plugin",
    command: "claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest",
  },
  update: {
    command: "claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest",
    note: "npx-launched MCP server pinned to @latest: restarting Claude Code (or re-running add) fetches the newest published version.",
  },
  usage: [
    { command: "performance_start_trace / performance_stop_trace", description: "Record a Chrome performance trace and stop it to extract actionable insights." },
    { command: "performance_analyze_insight", description: "Drill into a specific insight from a recorded trace (LCP, CLS, long tasks, etc.)." },
    { command: "list_network_requests / get_network_request", description: "Inspect all network requests on the page and fetch full details for one." },
    { command: "take_snapshot / take_screenshot", description: "Capture an accessibility snapshot or pixel screenshot of the current page." },
    { command: "navigate_page / click / fill_form", description: "Drive the browser: navigate, click elements, and fill forms via Puppeteer." },
    { command: "list_console_messages / evaluate_script", description: "Read source-mapped console output or run arbitrary JS in the page context." },
  ],
  whenToUse: [
    "You want the agent to measure and debug real page performance (Core Web Vitals, trace insights, CrUX field data) on a live URL.",
    "You need reliable browser automation that waits for action results: navigating, clicking, filling forms, uploading files.",
    "You are debugging front-end issues and want network requests, console messages with source-mapped stack traces, and screenshots.",
    "You want to connect the agent to an already-running Chrome instance to preserve login state or run inside a sandbox.",
  ],
  howToUse: `This is an **MCP server**, not a skill. Register it once with the Claude Code CLI:

\`\`\`bash
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest
\`\`\`

Or install as a **plugin** to get the MCP server plus bundled skills:

\`\`\`sh
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp@chrome-devtools-plugins
\`\`\`

The browser launches lazily on the first tool call that needs it. Useful flags passed after the package name:

\`\`\`bash
# basic browser tasks only
npx chrome-devtools-mcp@latest --slim --headless
# connect to an already-running Chrome (preserves login/state)
npx chrome-devtools-mcp@latest --browser-url=http://127.0.0.1:9222
# auto-connect to a local Chrome 144+ instance
npx chrome-devtools-mcp@latest --autoConnect
\`\`\`

Smoke-test it with the prompt: \`Check the performance of https://developers.chrome.com\`.`,
  whyUseful: `Maintained under the ChromeDevTools org (the Chrome DevTools team at Google), so it tracks current Chrome and exposes the real DevTools performance engine plus CrUX field data, not a thin wrapper. Built on Puppeteer for reliable, auto-waiting automation, it ships ~49 tools across input, navigation, network, console, screenshots, Lighthouse audits, heap-snapshot memory debugging, and extensions. It is the canonical answer when an agent needs to control and inspect a live Chrome rather than guess from static code.`,
  examplePrompt: "Record a performance trace of https://example.com, then tell me the biggest LCP and render-blocking issues and how to fix them.",
  author: "Google Chrome DevTools",
  dateAdded: "2026-06-20",
};
