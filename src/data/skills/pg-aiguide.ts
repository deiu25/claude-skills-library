import type { Skill } from "../types";

export const skill: Skill = {
  slug: "pg-aiguide",
  name: "pg-aiguide",
  tagline: "AI-optimized PostgreSQL expertise: opinionated Postgres/TimescaleDB best-practice skills plus version-aware semantic search over the official manuals.",
  category: "domain",
  tags: ["postgresql", "timescaledb", "database", "schema-design", "mcp-server", "skills"],
  repo: "timescale/pg-aiguide",
  install: {
    method: "npx-skills",
    command: "npx skills add timescale/pg-aiguide --skill postgres",
  },
  update: {
    command: "npx skills add timescale/pg-aiguide --skill postgres",
    note: "Re-run the `npx skills add` command to pull the latest skill version. For the MCP server (hosted at mcp.tigerdata.com/docs) updates are server-side and automatic.",
  },
  usage: [
    { command: "npx skills add timescale/pg-aiguide --skill postgres", description: "Install the curated Postgres best-practice skill for Claude Code, Cursor, Codex, Gemini CLI, and 40+ agents." },
    { command: "npx skills add timescale/pg-aiguide", description: "Interactively pick which individual skills to install." },
    { command: "claude plugin marketplace add timescale/pg-aiguide && claude plugin install pg@aiguide", description: "Install as a Claude Code plugin bundling the skills plus the hosted docs MCP server." },
    { command: "search_docs", description: "MCP tool: semantic (vector) or keyword (BM25) search across postgres, tiger (TimescaleDB), and postgis manuals, scoped by PG version." },
    { command: "view_skill", description: "MCP tool: surface a curated best-practice skill (schema design, indexing, data types, constraints, naming, perf tuning)." },
  ],
  whenToUse: [
    "Your AI agent keeps generating Postgres schemas that miss constraints, indexes, or modern PG17 features.",
    "You want version-aware semantic search over the official PostgreSQL, TimescaleDB, and PostGIS manuals from inside your coding agent.",
    "You're designing time-series / IoT schemas and want TimescaleDB-aware guidance baked into the agent.",
    "You want consistent, opinionated Postgres best practices (data types, naming, integrity) applied automatically across a team.",
  ],
  howToUse: `Install the skill for any supported agent:

\`\`\`bash
npx skills add timescale/pg-aiguide --skill postgres
\`\`\`

For deeper coverage, also add the hosted MCP server (semantic search over the PostgreSQL, TimescaleDB, and PostGIS manuals) — no key required:

\`\`\`bash
# Codex
codex mcp add --url "https://mcp.tigerdata.com/docs" pg-aiguide
# VS Code
code --add-mcp '{"name":"pg-aiguide","type":"http","url":"https://mcp.tigerdata.com/docs"}'
\`\`\`

Or install everything as a Claude Code plugin (skills + MCP):

\`\`\`bash
claude plugin marketplace add timescale/pg-aiguide
claude plugin install pg@aiguide
\`\`\`

Then just prompt normally — e.g. "Create a Postgres schema for storing usernames and unique email addresses." The agent pulls in \`view_skill\` guidance and \`search_docs\` results automatically.`,
  whyUseful: `Built and maintained by Timescale/TigerData, the team behind TimescaleDB, so the opinions are grounded in real Postgres operating experience rather than generic LLM priors. The README's own benchmark shows the skill producing 4x more constraints, 55% more indexes, and PG17-recommended patterns (\`GENERATED ALWAYS AS IDENTITY\`, \`NULLS NOT DISTINCT\`) versus a bare agent. Uniquely it pairs curated skills with a hosted, version-aware semantic search MCP over the official PostgreSQL, TimescaleDB, and PostGIS manuals, and works across Claude Code, Cursor, Codex, Gemini CLI, and 40+ agents via one install.`,
  examplePrompt: "Design a Postgres schema for an IoT factory-floor system collecting temperature, humidity, and pressure per device over time, optimized for outlier detection and long-range historical analysis.",
  author: "Timescale (TigerData)",
  dateAdded: "2026-06-20",
};
