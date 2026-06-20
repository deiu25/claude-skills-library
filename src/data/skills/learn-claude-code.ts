import type { Skill } from "../types";

export const skill: Skill = {
  slug: "learn-claude-code",
  name: "Learn Claude Code",
  tagline: "20-lesson tutorial reverse-engineering Claude Code's harness: agent loop, tools, subagents, MCP, teams, in runnable Python.",
  category: "resource",
  tags: ["tutorial", "harness", "agent-loop", "architecture", "education", "mcp"],
  repo: "shareAI-lab/learn-claude-code",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/shareAI-lab/learn-claude-code",
  },
  update: {
    command: "git pull / re-visit the repo",
    note: "Tutorial repo -- no install; clone and run the chapter code, or bookmark and revisit.",
  },
  usage: [
    { command: "git clone https://github.com/shareAI-lab/learn-claude-code", description: "Clone the repo to read and run all 20 chapters locally." },
    { command: "pip install -r requirements.txt && cp .env.example .env", description: "Install deps and set ANTHROPIC_API_KEY before running any lesson." },
    { command: "python s01_agent_loop/code.py", description: "Run lesson 1: the minimal agent loop with a single bash tool." },
    { command: "python s08_context_compact/code.py", description: "Run the context-compaction lesson." },
    { command: "python s20_comprehensive/code.py", description: "Run the endpoint chapter assembling every mechanism around one loop." },
    { command: "cd web && npm install && npm run dev", description: "Launch the Next.js web platform at localhost:3000." },
  ],
  whenToUse: [
    "You want to understand how Claude Code actually works internally -- agent loop, tool dispatch, subagents, context compaction, MCP routing.",
    "You're building your own coding-agent harness and want runnable, minimal reference implementations to learn from.",
    "You want to teach or onboard engineers on harness engineering versus model training (agency = model + harness).",
    "You need a structured, chapter-by-chapter path from one-loop-plus-bash up to multi-agent teams and worktree isolation.",
  ],
  howToUse: `This is a **tutorial/reference repo**, not a skill or plugin. Clone it and work through the chapters in order:

\`\`\`sh
git clone https://github.com/shareAI-lab/learn-claude-code
cd learn-claude-code
pip install -r requirements.txt
cp .env.example .env   # set ANTHROPIC_API_KEY
python s01_agent_loop/code.py
\`\`\`

The canonical track is the root-level \`s01_agent_loop/\` through \`s20_comprehensive/\` folders. Each chapter has a narrative README (zh default, plus \`README.en.md\` / \`README.ja.md\`), a standalone \`code.py\`, and an \`images/\` dir. Read s01 -> s20 in order; each adds exactly one harness mechanism (permissions, hooks, todo, subagents, skills, compaction, memory, tasks, teams, worktree isolation, MCP) on top of the unchanged core loop. A legacy 12-lesson track lives under \`agents/\` (e.g. \`python agents/s01_agent_loop.py\`), and a Next.js web platform runs via \`cd web && npm install && npm run dev\`.`,
  whyUseful: `Trending on GitHub (Trendshift-featured) and authored by shareAI-lab, the team behind the Kode agent CLI (\`@shareai-lab/kode\`) and kode-agent-sdk. It is one of the clearest end-to-end breakdowns of agent harness engineering: 20 minimal, runnable Python chapters that strip Claude Code down to its essence -- one loop plus tools, on-demand skill loading, context compaction, subagents, task graphs, teams, worktree isolation, permissions, hooks, memory, and MCP routing. Its thesis -- agency comes from model training, the harness is the vehicle -- reframes "building an agent" as building a harness, directly applicable to anyone extending Claude Code.`,
  examplePrompt: "Walk me through s06_subagent/code.py and explain how it keeps the subagent's context isolated from the main loop.",
  author: "shareAI-lab",
  dateAdded: "2026-06-20",
};
