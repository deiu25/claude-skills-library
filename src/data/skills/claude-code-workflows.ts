import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-code-workflows",
  name: "Claude Code Workflows",
  tagline: "Plugin marketplace of end-to-end dev workflows: specialized agents for requirements, design, TDD implementation, and quality.",
  category: "workflow",
  tags: ["workflow", "multi-agent", "tdd", "design-docs", "frontend", "marketplace"],
  repo: "shinpr/claude-code-workflows",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add shinpr/claude-code-workflows",
  },
  update: {
    command: "/plugin marketplace update claude-code-workflows",
    note: "Then run /reload-plugins. Pick one plugin per workflow (dev-workflows, dev-workflows-frontend, dev-workflows-fullstack, or dev-skills) — installing duplicates makes skills silently drop.",
  },
  usage: [
    { command: "/plugin install dev-workflows@claude-code-workflows", description: "Install the backend/general plugin (agents + recipes + best-practice skills)." },
    { command: "/recipe-implement \"Add user authentication with JWT\"", description: "Run the end-to-end feature workflow: PRD, design doc, TDD build, review." },
    { command: "/recipe-front-design \"Build a user profile dashboard\"", description: "Create a UI Spec + frontend Design Doc (needs dev-workflows-frontend)." },
    { command: "/recipe-diagnose \"API returns 500 on user login\"", description: "Run investigator -> verifier -> solver to map failure points and propose fixes." },
    { command: "/recipe-reverse-engineer \"src/auth module\"", description: "Generate PRD and Design Docs from existing code, verified against the source." },
    { command: "/plugin install dev-skills@claude-code-workflows", description: "Install skills only (no agents/recipes) as a ruleset for your own orchestrator." },
  ],
  whenToUse: [
    "You want a full feature built from requirements through design docs, TDD implementation, and review without hand-orchestrating each stage.",
    "You need to diagnose a bug systematically with mapped execution paths and tradeoff-weighted solutions.",
    "You have undocumented legacy code and want auto-generated PRDs/Design Docs to make it AI-friendly.",
    "You build React/TypeScript frontends and want UI Specs that capture loading/error/empty states before implementation.",
  ],
  howToUse: `Add the marketplace, then install one plugin matching your work.

\`\`\`bash
claude
/plugin marketplace add shinpr/claude-code-workflows

# Backend / general
/plugin install dev-workflows@claude-code-workflows
/reload-plugins
/recipe-implement "Add rate limiting to the API"

# Frontend (React/TS)
/plugin install dev-workflows-frontend@claude-code-workflows
/recipe-front-design "Settings page with tabs"
/recipe-front-build

# Fullstack (single plugin, replaces installing both)
/plugin install dev-workflows-fullstack@claude-code-workflows
/recipe-fullstack-implement "JWT auth + login form"
\`\`\`

All entry points use the \`recipe-\` prefix; type \`/recipe-\` and tab-complete. Recipes treat \`docs/plans/\` as ephemeral working state — add it to \`.gitignore\`. Each phase runs in a fresh agent context so earlier steps don't bloat later decisions. Do not install dev-skills alongside the dev-workflows plugins; shared skill descriptions duplicate and get silently ignored.`,
  whyUseful: `Most Claude Code workflow kits stop at "spawn some agents"; this one enforces a routed pipeline where requirement-analyzer sizes the task, design docs and acceptance criteria are generated before code, and code-reviewer/design-sync check the implementation back against those docs — so output actually matches its spec and tests. The marketplace cleanly separates concerns (backend, frontend with UI Specs, fullstack, skills-only) and ships adjacent recipes for diagnosis and reverse-engineering legacy code. Actively maintained by @shinpr, who also ships add-on plugins (discover, metronome, linear-prism, pr-review).`,
  examplePrompt: "/recipe-implement \"Add user authentication with JWT and refresh tokens\"",
  author: "shinpr",
  dateAdded: "2026-06-20",
};
