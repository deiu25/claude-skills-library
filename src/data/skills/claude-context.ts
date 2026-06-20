import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-context",
  name: "Claude Context",
  tagline: "MCP server adding semantic code search over your whole codebase via a Milvus/Zilliz vector index.",
  category: "mcp",
  tags: ["mcp-server", "semantic-search", "vector-database", "milvus", "embeddings", "codebase"],
  repo: "zilliztech/claude-context",
  install: {
    method: "plugin",
    command: "claude mcp add claude-context -e OPENAI_API_KEY=sk-your-key -e MILVUS_ADDRESS=your-zilliz-endpoint -e MILVUS_TOKEN=your-zilliz-key -- npx @zilliz/claude-context-mcp@latest",
  },
  update: {
    command: "claude mcp add claude-context -e OPENAI_API_KEY=sk-your-key -e MILVUS_ADDRESS=your-zilliz-endpoint -e MILVUS_TOKEN=your-zilliz-key -- npx @zilliz/claude-context-mcp@latest",
    note: "npx-launched MCP server pinned to @latest: re-running add (or restarting the client) fetches the newest published version.",
  },
  usage: [
    { command: "index_codebase", description: "Index a codebase directory for hybrid search (BM25 + dense vector)." },
    { command: "search_code", description: "Search the indexed codebase with natural-language queries via hybrid search." },
    { command: "get_indexing_status", description: "Report indexing progress percentage and completion status for a codebase." },
    { command: "clear_index", description: "Clear the search index for a specific codebase." },
    { command: "Index this codebase", description: "Natural-language prompt that triggers the index_codebase tool in Claude Code." },
    { command: "Find functions that handle user authentication", description: "Natural-language search prompt routed to search_code." },
  ],
  whenToUse: [
    "Your codebase is too large to load directory-by-directory into context and you want semantic retrieval instead.",
    "You want to cut token spend on large repos — Zilliz reports ~40% token reduction at equal retrieval quality.",
    "You need cross-file code search inside Claude Code, Cursor, Codex, Gemini CLI, or other MCP clients.",
    "You want incremental re-indexing (Merkle-tree diffing) so only changed files get re-embedded.",
  ],
  howToUse: `This is an **MCP server**, not a skill or plugin. It needs a vector database (free tier on Zilliz Cloud) and an embedding API key (OpenAI, VoyageAI, Ollama, or Gemini). Register it once with the Claude Code CLI:

\`\`\`bash
claude mcp add claude-context \\
  -e OPENAI_API_KEY=sk-your-openai-api-key \\
  -e MILVUS_ADDRESS=your-zilliz-cloud-public-endpoint \\
  -e MILVUS_TOKEN=your-zilliz-cloud-api-key \\
  -- npx @zilliz/claude-context-mcp@latest
\`\`\`

Then, from your project directory, drive it with plain prompts:

\`\`\`
Index this codebase
Check the indexing status
Find functions that handle user authentication
\`\`\`

Requires Node.js >= 20. Works with Cursor, Codex CLI, Gemini CLI, Qwen Code, Windsurf, Void, and Claude Desktop via equivalent JSON/TOML config. Also ships a \`@zilliz/claude-context-core\` npm package and a "Semantic Code Search" VS Code extension for non-MCP use.`,
  whyUseful: `Built by Zilliz, the team behind Milvus, so the vector-search backbone is production-grade rather than hand-rolled. It is a Trendshift-listed, actively maintained MIT project with a published efficiency benchmark (~40% token reduction at equivalent retrieval quality), AST-based code chunking, and Merkle-tree incremental indexing. Unlike grep-based context tools, it gives agents true hybrid (BM25 + dense vector) recall over millions of lines while keeping per-request token cost low.`,
  examplePrompt: "Index this codebase, then find all functions that handle user authentication and JWT validation.",
  author: "Zilliz",
  dateAdded: "2026-06-20",
};
