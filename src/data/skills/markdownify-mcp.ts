import type { Skill } from "../types";

export const skill: Skill = {
  slug: "markdownify-mcp",
  name: "Markdownify MCP",
  tagline: "MCP server that converts PDFs, Office docs, images, audio, YouTube, and web pages into Markdown for agents.",
  category: "mcp",
  tags: ["mcp-server", "markdown", "file-conversion", "pdf", "document-processing", "transcription"],
  repo: "zcaceres/markdownify-mcp",
  install: {
    method: "manual-copy",
    command: "git clone https://github.com/zcaceres/markdownify-mcp && cd markdownify-mcp && bun install && bun run build",
  },
  update: {
    command: "git pull && bun install && bun run build",
    note: "No npm/npx package — pull the repo and rebuild dist/index.js, then restart your MCP client.",
  },
  usage: [
    { command: "pdf-to-markdown", description: "Convert a PDF file into Markdown text." },
    { command: "docx-to-markdown", description: "Convert a Word .docx document into Markdown." },
    { command: "xlsx-to-markdown / pptx-to-markdown", description: "Convert Excel sheets or PowerPoint decks into Markdown." },
    { command: "youtube-to-markdown", description: "Fetch a YouTube video's transcript as Markdown." },
    { command: "audio-to-markdown", description: "Transcribe an audio file into Markdown text." },
    { command: "webpage-to-markdown / bing-search-to-markdown", description: "Convert a web page or Bing search results into Markdown." },
  ],
  whenToUse: [
    "You want an agent to read PDFs, DOCX/XLSX/PPTX, or images and get clean Markdown instead of raw bytes.",
    "You need YouTube transcripts or audio transcription pulled into a chat as text.",
    "You want to feed web pages or Bing search results to a model as Markdown context.",
    "You need a local, path-restricted (MD_ALLOWED_PATHS) document-to-Markdown pipeline inside Claude Code or Claude Desktop.",
  ],
  howToUse: `This is an **MCP server**, not a skill/plugin. There is no npm package — clone and build it, then register the built entrypoint with your MCP client.

\`\`\`bash
git clone https://github.com/zcaceres/markdownify-mcp
cd markdownify-mcp
bun install
bun run build
\`\`\`

\`bun install\` also creates a Python virtual environment and installs \`markitdown\`. Register the build in your client config (e.g. \`claude_desktop_config.json\`):

\`\`\`json
{
  "mcpServers": {
    "markdownify": {
      "command": "node",
      "args": ["{ABSOLUTE PATH}/markdownify-mcp/dist/index.js"]
    }
  }
}
\`\`\`

Optionally restrict file access and point at external binaries via env vars: \`MD_ALLOWED_PATHS\`, \`MARKITDOWN_PATH\`, \`REPOMIX_PATH\`. A Dockerfile is included:

\`\`\`sh
docker build -t markdownify-mcp .
docker run --rm -i -v "$HOME/Documents:/data:ro" -e MD_ALLOWED_PATHS=/data markdownify-mcp
\`\`\``,
  whyUseful: `One server gives an agent ten conversion tools (PDF, DOCX, XLSX, PPTX, images, audio, YouTube, Bing, web pages, local files) all normalized to Markdown — the format LLMs read best. It is a widely-adopted reference MCP (~2.8k stars) from zcaceres, a prolific MCP/tooling author, and adds path-allowlist security via MD_ALLOWED_PATHS plus a ready Dockerfile, making it safe to expose document ingestion to a model.`,
  examplePrompt: "Use markdownify to convert ~/Documents/contract.pdf to Markdown and summarize the key obligations.",
  author: "Zach Caceres (zcaceres)",
  dateAdded: "2026-06-20",
};
