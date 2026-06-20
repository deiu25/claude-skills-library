import type { Skill } from "../types";

export const skill: Skill = {
  slug: "context-engineering-skills",
  name: "Agent Skills for Context Engineering",
  tagline: "15-skill marketplace teaching context and harness engineering: compression, memory, multi-agent patterns, evaluation, BDI mental states.",
  category: "meta",
  tags: ["context-engineering", "harness-engineering", "multi-agent", "memory", "evaluation", "marketplace"],
  repo: "muratcankoylan/Agent-Skills-for-Context-Engineering",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add muratcankoylan/Agent-Skills-for-Context-Engineering",
  },
  update: {
    command: "/plugin marketplace update context-engineering-marketplace",
    note: "Then run /reload-plugins. Marketplace slug is context-engineering-marketplace, not the repo name.",
  },
  usage: [
    { command: "/plugin marketplace add muratcankoylan/Agent-Skills-for-Context-Engineering", description: "Register the marketplace in Claude Code." },
    { command: "/plugin install context-engineering@context-engineering-marketplace", description: "Install the full context-engineering plugin (all 15 skills)." },
    { command: "context-fundamentals", description: "Skill on managing the model's limited attention budget vs prompt engineering." },
    { command: "context-compression", description: "Skill for compacting context to fit the window without losing signal." },
    { command: "multi-agent-patterns", description: "Skill covering orchestration and coordination across multiple agents." },
    { command: "harness-engineering", description: "Skill for designing the agent harness: tools, memory, eval loops, run state." },
  ],
  whenToUse: [
    "You are building a production agent and need disciplined patterns for managing the context window beyond ad-hoc prompting.",
    "Your agent degrades over long sessions and you need compression, memory, and context-optimization strategies.",
    "You are designing a multi-agent system and want vetted orchestration, tool-design, and filesystem-context patterns.",
    "You need to evaluate or benchmark an agent harness and want rubrics, provenance tracking, and adversarial eval scaffolding.",
  ],
  howToUse: `Register the marketplace, then install the plugin:

\`\`\`
/plugin marketplace add muratcankoylan/Agent-Skills-for-Context-Engineering
/plugin install context-engineering@context-engineering-marketplace
\`\`\`

This loads all 15 skills (context-fundamentals, context-degradation, context-compression, multi-agent-patterns, memory-systems, tool-design, filesystem-context, hosted-agents, context-optimization, latent-briefing, evaluation, advanced-evaluation, harness-engineering, project-development, bdi-mental-states). Claude auto-invokes the relevant skill by task description; you can also name a skill directly. The same skills are exposed for Cursor and other platforms via the Open Plugins directory, and can be dropped into \`.claude/skills/\` standalone.`,
  whyUseful: `A focused, well-organized reference set codifying context-engineering and harness-engineering as a discipline — context degradation, compression, memory systems, multi-agent coordination, tool design, and evaluation — rather than scattered prompting tips. It ships as a real Claude Code marketplace (plugin v2.3.0) with a parallel Open Plugins manifest, so the same skills work across Claude Code, Cursor, and other conformant agent platforms, and bundles evaluation scaffolding (rubrics, provenance, run-state machines, adversarial benchmarking) for hardening a harness.`,
  examplePrompt: "Use the context-engineering skills to redesign my agent's harness: my long-running agent loses track of earlier decisions — apply context-degradation and memory-systems patterns.",
  author: "Muratcan Koylan",
  dateAdded: "2026-06-20",
};
