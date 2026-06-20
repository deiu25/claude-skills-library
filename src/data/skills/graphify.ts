import type { Skill } from "../types";

export const skill: Skill = {
  slug: "graphify",
  name: "Graphify",
  tagline:
    "Turns any folder of code, SQL, docs, PDFs, images, or video into a queryable, interactive knowledge graph.",
  category: "research",
  tags: ["knowledge-graph", "graphrag", "rag", "codebase", "visualization", "tree-sitter"],
  repo: "safishamsi/graphify",
  install: {
    method: "npx-skills",
    command: "pip install graphifyy && graphify install",
  },
  whenToUse: [
    "You drop into an unfamiliar codebase and want a map of its real structure and relationships before reading files",
    "You want to query a body of work (code, SQL schemas, docs, papers, screenshots, even video) instead of re-reading raw files every time",
    "You want a persistent, interactive graph you can revisit weeks later without reprocessing, and that auto-syncs as files change",
    "You want to export understanding into Obsidian, Wikipedia-style articles, JSON, SVG, GraphML, or Neo4j",
  ],
  howToUse: `Install once (needs Python 3.10+), then drive it with the \`/graphify\` slash command pointed at any folder.

\`\`\`bash
pip install graphifyy && graphify install
\`\`\`

\`graphify install\` registers the skill globally (\`~/.claude/skills/graphify/\`) and auto-detects your runtime; add \`--project\` only if you want the SKILL.md vendored into a single repo. Then, inside the agent:

\`\`\`
/graphify .                 # graph the current directory
/graphify ./raw --mode deep # aggressive extraction
/graphify ./raw --update    # merge into the existing graph
/graphify ./raw --watch     # auto-sync as files change
/graphify ./raw --wiki      # emit Wikipedia-style articles
\`\`\`

You get an interactive HTML graph (clickable nodes, search, community filtering) plus analysis — "god nodes" (highest-degree concepts), surprising connections, and suggested questions.`,
  whyUseful: `Most agents understand a repo by repeatedly reading raw files, which burns context and misses cross-file structure. Graphify builds the structure once into a knowledge graph and lets you query it — the author claims ~71x fewer tokens per query — while surfacing relationships you didn't know were there. It is multimodal (code in a dozen languages, SQL, shell/R scripts, Markdown, PDFs, and images), persists graphs so you can return without reprocessing, can \`--watch\` for live updates and rebuild on commit, and exports to Obsidian, JSON, SVG, GraphML, and Neo4j. MIT-licensed, ~70k stars, and runs across Claude Code, Codex, Cursor, Gemini CLI, and more.`,
  examplePrompt: "/graphify . --wiki",
  author: "Safi Shamsi",
  dateAdded: "2026-06-20",
};
