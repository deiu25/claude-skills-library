import type { Skill } from "../types";

export const skill: Skill = {
  slug: "insforge",
  name: "InsForge MCP",
  tagline: "MCP server giving coding agents an open-source backend: Postgres, auth, storage, edge functions, model gateway, deploys.",
  category: "mcp",
  tags: ["mcp-server", "backend", "postgres", "auth", "storage", "edge-functions"],
  repo: "InsForge/insforge",
  install: {
    method: "plugin",
    command: "npx @insforge/install --client claude-code --env API_KEY=YOUR_API_KEY --env API_BASE_URL=http://localhost:7130",
  },
  update: {
    command: "npx @insforge/install --client claude-code --env API_KEY=YOUR_API_KEY --env API_BASE_URL=http://localhost:7130",
    note: "Installer wires up `@insforge/mcp@latest`, so re-running install (or restarting the client) fetches the newest server. Add `--dev` to pin the @insforge/mcp@dev channel.",
  },
  usage: [
    { command: "fetch-docs", description: "Pull InsForge instructions, schemas, and API references so the agent knows how to operate the backend." },
    { command: "npx @insforge/install --client claude-code", description: "Wire the @insforge/mcp server into Claude Code with your API_KEY and API_BASE_URL." },
    { command: "docker compose -f docker-compose.prod.yml up", description: "Self-host an InsForge instance locally; web UI and MCP connect flow at http://localhost:7130." },
    { command: "Database / migrations", description: "Run Postgres migrations and read schemas plus metadata directly from the agent." },
    { command: "Edge Functions / Storage", description: "Deploy serverless edge functions and create S3-compatible storage buckets." },
    { command: "Model Gateway", description: "Call an OpenAI-compatible API across multiple LLM providers through the backend." },
  ],
  whenToUse: [
    "You want a coding agent to provision and operate a real backend (DB, auth, storage, functions) end-to-end, not just write app code.",
    "You are self-hosting via Docker Compose or using the insforge.dev cloud and need to connect it to Claude Code over MCP.",
    "You want the agent to read live backend state — schemas, deployed functions, bucket contents, runtime logs — to verify and debug what it built.",
    "You are migrating off Supabase or building a full-stack app and want one MCP-driven backend platform.",
  ],
  howToUse: `This is an **MCP server**, not a skill/plugin. It needs a running InsForge backend (self-hosted or cloud) plus an API key.

1. Stand up a backend — self-host:

\`\`\`bash
git clone https://github.com/InsForge/InsForge.git
cd insforge
cp .env.example .env
docker compose -f docker-compose.prod.yml up
\`\`\`

Open \`http://localhost:7130\`, follow the connect flow, and grab your \`API_KEY\`. (Or skip Docker and use the cloud at insforge.dev.)

2. Register the MCP server with Claude Code (command from the InsForge/insforge-install repo):

\`\`\`bash
npx @insforge/install --client claude-code \\
  --env API_KEY=YOUR_API_KEY \\
  --env API_BASE_URL=http://localhost:7130
\`\`\`

Restart the client to load the server. Add \`--dev\` to use the \`@insforge/mcp@dev\` channel.

3. Verify by prompting the agent to call the \`fetch-docs\` tool:

\`\`\`
I'm using InsForge as my backend platform, call InsForge MCP's fetch-docs tool to learn about InsForge instructions.
\`\`\``,
  whyUseful: `Open-source (Apache-2.0) all-in-one backend purpose-built for agentic coding — one MCP surface covering Postgres, auth, S3-compatible storage, edge functions, an OpenAI-compatible model gateway, compute, and site deployment, so an agent can operate the backend like a backend engineer instead of you hand-wiring services. Backed by the InsForge org with published \`@insforge/sdk\`, \`@insforge/mcp\`, and \`@insforge/install\` packages on npm, Vercel OSS membership, and a Trendshift listing, and it ships self-hosted (Docker Compose) and cloud paths plus migration tooling from Supabase.`,
  examplePrompt: "Using the InsForge MCP, create a posts table with RLS, deploy an edge function to handle uploads to a new storage bucket, then show me the schema.",
  author: "InsForge",
  dateAdded: "2026-06-20",
};
