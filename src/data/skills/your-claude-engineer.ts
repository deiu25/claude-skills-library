import type { Skill } from "../types";

export const skill: Skill = {
  slug: "your-claude-engineer",
  name: "Your Claude Engineer",
  tagline: "Autonomous AI software engineer harness: orchestrator plus Linear, Coding, GitHub, and Slack subagents for long-running tasks.",
  category: "workflow",
  tags: ["multi-agent", "orchestration", "claude-agent-sdk", "linear", "arcade-mcp", "automation"],
  repo: "coleam00/your-claude-engineer",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/coleam00/your-claude-engineer",
  },
  update: {
    command: "git pull",
    note: "Cloned Python harness — pull latest, then re-run pip install -r requirements.txt to sync dependencies.",
  },
  usage: [
    { command: "pip install -r requirements.txt", description: "Install the Python harness dependencies (after npm install -g @anthropic-ai/claude-code)." },
    { command: "python authorize_arcade.py", description: "Run the one-time Arcade OAuth flow for Linear/GitHub/Slack tools." },
    { command: "uv run python autonomous_agent_demo.py --project-dir my-app", description: "Run an autonomous session that builds my-app in ./generations/my-app/." },
    { command: "--max-iterations 3", description: "Cap the number of agent iterations (useful for testing)." },
    { command: "--model opus", description: "Set the orchestrator model (haiku/sonnet/opus); per-agent models set via env vars." },
    { command: "prompts/app_spec.txt", description: "Edit to change which application the harness builds." },
  ],
  whenToUse: [
    "You want to hand off a feature spec and have an autonomous agent plan, code, test, commit, and report over many iterations.",
    "You already use Linear for issue tracking and want issues created/updated automatically as work progresses.",
    "You want a multi-agent reference architecture (orchestrator + specialized subagents) built on the Claude Agent SDK to study or fork.",
    "You want GitHub commits/PRs and Slack progress updates wired through a single Arcade MCP gateway.",
  ],
  howToUse: `This is a **Python harness on the Claude Agent SDK**, not a Claude Code skill/plugin. Linux/WSL only (Claude Agent SDK subagent limitation — no native Windows).

\`\`\`bash
git clone https://github.com/coleam00/your-claude-engineer
cd your-claude-engineer
python3 -m venv venv && source venv/bin/activate
npm install -g @anthropic-ai/claude-code
pip install -r requirements.txt
\`\`\`

Configure credentials and authorize the Arcade gateway (Linear required; GitHub/Slack optional):

\`\`\`bash
cp .env.example .env   # set ARCADE_API_KEY, ARCADE_GATEWAY_SLUG, ARCADE_USER_ID
python authorize_arcade.py
\`\`\`

Run an autonomous session:

\`\`\`bash
uv run python autonomous_agent_demo.py --project-dir my-app --model opus
\`\`\`

Customize what gets built via \`prompts/app_spec.txt\`, the initial issue count via \`prompts/initializer_task.md\`, and the bash allowlist via \`ALLOWED_COMMANDS\` in \`security.py\`.`,
  whyUseful: `A working, end-to-end reference for long-running autonomous engineering: an orchestrator delegates to Linear, Coding (with Playwright UI testing), GitHub, and Slack subagents, with per-agent model selection (haiku/sonnet/opus) to control cost and context. By Cole Medin (coleam00), a widely-followed AI-engineering educator. The Arcade MCP gateway gives one OAuth flow across Linear/GitHub/Slack, and the defense-in-depth security model (OS sandbox, filesystem restrictions, bash allowlist with rm validation) makes it a credible base to fork rather than a toy demo.`,
  examplePrompt: "uv run python autonomous_agent_demo.py --project-dir todo-app --model opus --max-iterations 5",
  author: "Cole Medin (coleam00)",
  dateAdded: "2026-06-20",
};
