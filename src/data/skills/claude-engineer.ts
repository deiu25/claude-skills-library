import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-engineer",
  name: "Claude Engineer",
  tagline: "Self-improving AI dev assistant (CLI + web) that writes and hot-loads its own tools via the Anthropic API.",
  category: "workflow",
  tags: ["agent", "self-improving", "anthropic-api", "cli", "web-ui", "tool-creation"],
  repo: "Doriandarko/claude-engineer",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/Doriandarko/claude-engineer.git",
  },
  update: {
    command: "git pull",
    note: "Standalone repo, not a plugin: cd into the clone and run `git pull`, then re-run `uv venv` / re-sync deps if requirements changed.",
  },
  usage: [
    { command: "uv run ce3.py", description: "Launch the CLI assistant (rich terminal UI, token tracking, live tool execution)." },
    { command: "uv run app.py", description: "Launch the web interface at http://localhost:5000 (image upload, token visualization)." },
    { command: "toolcreator", description: "Built-in Tool Creator: generates a new tool from a natural-language description and hot-loads it." },
    { command: "e2bcodetool", description: "E2B Code Executor: runs Python in a sandbox (needs E2B_API_KEY) for analysis, viz, and computation." },
    { command: "duckduckgotool / webscrapertool / browsertool", description: "Web search, readable-content scraping, and open-URL-in-browser tools." },
    { command: "fileedittool / diffeditortool / filecreatortool", description: "Full/partial file edits, exact-substring diff replacement, and file creation." },
  ],
  whenToUse: [
    "You want a self-contained agentic coding assistant that decides which tools to run and chains them autonomously.",
    "You need an assistant that can invent and hot-load brand-new tools mid-conversation via the Tool Creator.",
    "You prefer a standalone CLI or web app over an in-editor harness, with built-in token tracking and image analysis.",
    "You want to study or fork a popular reference implementation of a self-improving, tool-generating agent.",
  ],
  howToUse: `This is a **standalone Python app** (Claude Engineer v3), not a Claude Code skill/plugin. Clone it and run with \`uv\`:

\`\`\`bash
git clone https://github.com/Doriandarko/claude-engineer.git
cd claude-engineer
uv venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate

uv run ce3.py   # CLI
uv run app.py   # web UI at http://localhost:5000
\`\`\`

Add API keys to a \`.env\` file (\`ANTHROPIC_API_KEY\` required; \`E2B_API_KEY\` for the code executor):

\`\`\`bash
ANTHROPIC_API_KEY=your_anthropic_key
E2B_API_KEY=your_e2b_key
\`\`\`

Talk to it like a coding assistant; it picks tools automatically. When it lacks a capability, the Tool Creator writes a new tool into \`tools/\` and hot-reloads it for the rest of the session. Requires Python 3.8+.`,
  whyUseful: `One of the most-starred open-source agentic assistants and a canonical reference for the "agent that builds its own tools" pattern, from Pietro Schirano (@skirano). The Tool Creator plus hot-reload loop means the framework grows new capabilities during a conversation instead of shipping a fixed toolset, and it bundles a practical kit out of the box: E2B sandboxed code execution, Ruff linting, file/diff editing, DuckDuckGo search/scrape, and screenshots. Ships both a rich CLI and a web UI with real token tracking, making it a solid base to fork.`,
  examplePrompt: "Build me a tool that fetches a sitemap, then use it to crawl example.com and summarize the top 10 pages.",
  author: "Pietro Schirano (Doriandarko)",
  dateAdded: "2026-06-20",
};
