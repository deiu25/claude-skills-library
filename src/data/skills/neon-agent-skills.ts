import type { Skill } from "../types";

export const skill: Skill = {
  slug: "neon-agent-skills",
  name: "Neon Agent Skills",
  tagline:
    "Neon's official agent skills: Lakebase Postgres setup, branching, migrations and diagnostics, driven through the Neon CLI or MCP server.",
  category: "domain",
  tags: ["postgres", "neon", "database", "branching", "migrations", "serverless"],
  repo: "neondatabase/agent-skills",
  repoPath: "skills",
  install: {
    method: "npx-skills",
    command: "npx skills add neondatabase/agent-skills",
  },
  update: {
    command: "npx skills update",
    note: "Add -g for user-level installs. With the Neon CLI installed, `neon skills update -y` does the same; add `--global` there for user-level installs.",
  },
  usage: [
    { command: '"Get started with Neon"', description: "The parent `neon` skill: checks the CLI and credentials, then links a project." },
    { command: '"Recommend a connection method for this project"', description: "`neon-postgres` picks pooled or direct and the driver for your runtime." },
    { command: "neon link --project-id <id> --no-env-pull", description: "Link the repo to a project without writing DATABASE_URL into .env." },
    { command: "neon checkout <branch> --create", description: "Branch-first flow: one copy-on-write database branch per git branch." },
    { command: "neon inspect db <check>", description: "Read-only diagnostics (outliers, locks, unused-indexes, bloat) the skill picks by symptom." },
    { command: "neon profile create <name> --api-key -", description: "Store an API key read from stdin, the CLI sign-in for Vercel-managed accounts." },
    { command: "npx skills add neondatabase/agent-skills --skill neon-postgres-branches", description: "Add one more skill from the set." },
  ],
  whenToUse: [
    "Your database is Neon, created directly or through the Vercel Marketplace, and the agent keeps mixing up pooled and direct connections",
    "Testing a migration on a branch of production, against production-like data, before applying it",
    "Diagnosing slow queries, locks, bloat or cache misses with Neon's read-only inspect checks instead of hand-written catalog SQL",
    "Linking a repo to a Neon project and moving between per-feature database branches",
    "Spinning up a throwaway Postgres with no account (Claimable Neon) for a prototype; it expires unless you claim it",
  ],
  howToUse: `Install the set, or only the core \`neon\` and \`neon-postgres\` skills: \`npx neon@latest skills -s neon -s neon-postgres -y\` installs them into the current project, and \`--global\` makes it user-level. \`neon\` is the overview and routes the work; \`neon-postgres\` takes over for an existing \`DATABASE_URL\`, SQL, schema and diagnostics.

The skills drive the Neon CLI (\`npm i -g neon\`), so the CLI needs credentials. A Neon account signs in with \`neon login\`. A database created through the Vercel Marketplace lives in an organization named "Vercel: <team>", where \`neon login\` does not work: create a project-scoped key under Organization settings → API keys, then store it with \`neon profile create DEFAULT --api-key -\`.

\`neon link\` and \`neon checkout\` pull the branch's variables into \`.env\` or \`.env.local\` by default. Pass \`--no-env-pull\` when the env comes from elsewhere, such as \`vercel env pull\`. A Claude Code plugin that also bundles the Neon MCP server is available: \`/plugin marketplace add neondatabase/agent-skills\`, then \`/plugin install neon-postgres@neon\`.

Not for a Postgres hosted elsewhere: the guidance is Neon-specific.`,
  whyUseful: `Generic Postgres skills miss what is specific to Neon: run migrations over a direct connection rather than the pooler, test them on a copy-on-write branch first, reach for \`neon inspect db\` before writing catalog queries, and keep \`neon.ts\` as the branch config. These skills are maintained by Neon under Apache-2.0 and send the agent to the current docs as Markdown instead of its training data.

Review these instructions before you rely on them. The \`neon\` skill tells the agent to send an issue report to Neon with \`neon feedback\` after a task, for problems Neon can fix, without telling you, and to update the skills for every new session. Say in your project instructions if you want either off. The Neon CLI also collects anonymous usage analytics and sends crash reports by default, and \`--no-analytics\` turns both off; \`npx skills\` has its own telemetry, off with \`DISABLE_TELEMETRY=1\`.`,
  examplePrompt: "Recommend a connection method for this project",
  author: "Neon (neondatabase)",
  dateAdded: "2026-10-22",
};
