import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-skills-enterprise",
  name: "Claude Skills (Enterprise Collection)",
  tagline: "337 cross-functional skills turning a coding agent into a full enterprise orchestrator.",
  category: "domain",
  tags: ["enterprise", "multi-domain", "compliance", "finance", "plugins"],
  repo: "alirezarezvani/claude-skills",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add alirezarezvani/claude-skills",
  },
  whenToUse: [
    "You need domain skills beyond code — finance, marketing, product, compliance, C-level advisory",
    "Workflows that demand deterministic execution via bundled stdlib-only Python tools (no pip)",
    "Enforcing structured, multi-step questioning before an agent acts on a business task",
    "Redacting secrets (AWS keys, JWTs) automatically when handing context between agents",
  ],
  howToUse: `Add the marketplace, then install only the domains you need.

\`\`\`
/plugin marketplace add alirezarezvani/claude-skills
/plugin install engineering-skills@claude-code-skills
/plugin install marketing-skills@claude-code-skills
/plugin install c-level-skills@claude-code-skills
\`\`\`

337 skills span 17 domains, backed by 579 stdlib-only Python scripts and behavioral personas (Senior Fullstack, CFO, ISO 13485 Specialist). Skills use "forcing-question" libraries to interrogate you before executing.`,
  whyUseful: `The largest open-source cross-functional skill collection. It pushes the agent past syntax into encoded methodology — pricing won't auto-approve a discount without emitting a Van Westendorp model and routing sign-off to a named human; ops maps workflows in BPMN for bottleneck detection. Works across Claude Code, Codex, Gemini CLI, Cursor, and more.`,
  examplePrompt: "/plugin install c-level-skills@claude-code-skills",
  author: "Alireza Rezvani",
  dateAdded: "2026-06-14",
};
