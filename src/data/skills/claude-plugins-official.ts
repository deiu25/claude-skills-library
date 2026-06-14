import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-plugins-official",
  name: "Claude Plugins (Official Directory)",
  tagline: "Anthropic's official, curated marketplace of Claude Code plugins and bundled skills.",
  category: "meta",
  tags: ["marketplace", "plugins", "official", "skills-directory", "anthropic"],
  repo: "anthropics/claude-plugins-official",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add anthropics/claude-plugins-official",
  },
  whenToUse: [
    "You want vetted, Anthropic-managed plugins instead of hunting across random repos",
    "Discovering bundled skills (git workflows, security analysis with Semgrep/CodeRabbit, framework helpers)",
    "You need a trusted source with SAST scanning and license checks on every submission",
    "Standardizing what plugins a team installs from one central directory",
  ],
  howToUse: `Add the marketplace, then install any plugin from it by name.

\`\`\`
/plugin marketplace add anthropics/claude-plugins-official
/plugin install {plugin-name}@claude-plugins-official
\`\`\`

Plugins live under \`/plugins\` and \`/external_plugins\`. When a plugin has no dedicated manifest, the marketplace declares its skills via relative paths pointing at directories that contain a SKILL.md.`,
  whyUseful: `This is the institutional home of the Claude Code plugin ecosystem. Every submission goes through automated frontmatter validation, license verification, and mandatory static analysis (SAST), so you get a higher trust floor than installing from arbitrary GitHub repos. It's the canonical place to find official and partner-maintained skills.`,
  examplePrompt: "/plugin marketplace add anthropics/claude-plugins-official",
  author: "Anthropic",
  dateAdded: "2026-06-14",
};
