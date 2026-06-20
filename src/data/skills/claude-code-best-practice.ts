import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-code-best-practice",
  name: "Claude Code Best Practice",
  tagline: "Curated reference of Claude Code workflows, skills, agents, commands, hooks, and 83 community tips.",
  category: "meta",
  tags: ["awesome-list", "best-practices", "workflows", "orchestration", "reference"],
  repo: "shanraisshan/claude-code-best-practice",
  install: {
    method: "manual-copy",
    command: "Clone shanraisshan/claude-code-best-practice and copy its .claude/ primitives into your project",
  },
  update: {
    command: "git -C claude-code-best-practice pull",
    note: "Reference repo, not a single skill dir: pull the clone, then re-copy any .claude/ primitives you use. Or re-clone from shanraisshan/claude-code-best-practice.",
  },
  usage: [
    { command: "git clone https://github.com/shanraisshan/claude-code-best-practice", description: "Clone the reference repository to browse locally." },
    { command: "cp -r claude-code-best-practice/.claude/* your-project/.claude/", description: "Copy example primitives into your own project." },
    { command: "/weather-orchestrator", description: "Run the bundled example showing the command -> agent -> skill pattern." },
    { command: "Browse CONCEPTS, SKILL/AGENT COLLECTIONS, 83 TIPS AND TRICKS", description: "Read the markdown sections as a course on Claude Code primitives." },
  ],
  whenToUse: [
    "Learning Claude Code primitives (subagents, slash commands, skills, hooks, MCP, plugins) from one organized reference",
    "Designing an orchestration architecture (command -> agent -> skill) and wanting a worked example to copy",
    "Comparing community development workflows before choosing one",
    "Tuning your own CLAUDE.md or settings using a curated list of 83 community tips",
  ],
  howToUse: `This is a reference/knowledge-base repository, not an installable package. Use it by browsing or cloning, then applying patterns to your own projects.

\`\`\`bash
git clone https://github.com/shanraisshan/claude-code-best-practice
# Browse the markdown, or copy example primitives into your project:
# cp -r claude-code-best-practice/.claude/* your-project/.claude/
\`\`\`

Read it as a course: start with CONCEPTS (subagents, commands, skills, hooks, MCP, plugins, settings, memory), then try the bundled \`/weather-orchestrator\` example to see the command -> agent -> skill pattern. Study the implementation/ and orchestration-workflow/ directories, then mine the SKILL COLLECTIONS, AGENT COLLECTIONS, and 83 TIPS AND TRICKS sections.`,
  whyUseful: `A high-visibility, actively maintained meta-resource that consolidates the Claude Code ecosystem — concepts, orchestration patterns, community and cross-model workflows, skill/agent collections, 83 categorized tips, and deep-dive reports — into one place. It includes a runnable \`/weather-orchestrator\` example demonstrating the command -> agent -> skill architecture. Best for learning and reference rather than as a drop-in skill.`,
  examplePrompt: "Read claude-code-best-practice and propose an orchestration structure (command -> agent -> skill) for my project.",
  author: "shanraisshan",
  dateAdded: "2026-06-14",
};
