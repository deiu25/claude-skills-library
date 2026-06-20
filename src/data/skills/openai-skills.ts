import type { Skill } from "../types";

export const skill: Skill = {
  slug: "openai-skills",
  name: "OpenAI Skills (Codex Catalog)",
  tagline: "OpenAI's official Agent Skills catalog for Codex, sharing the same SKILL.md standard.",
  category: "meta",
  tags: ["codex", "openai", "skill-creator", "cross-agent", "agent-skills"],
  repo: "openai/skills",
  install: {
    method: "manual-copy",
    command: "$skill-installer <skill-name>   # run inside Codex; restart to load",
  },
  update: {
    command: "$skill-installer <skill-name>   # re-run inside Codex; restart to reload",
    note: "Skills are installed by Codex's in-Codex installer (not git checkouts), so re-running it fetches the latest from openai/skills. .system skills ship with Codex and update with Codex itself.",
  },
  usage: [
    { command: "$skill-installer <skill-name>", description: "Install a curated skill from the catalog; restart Codex to load it." },
    { command: "$skill-installer gh-address-comments", description: "Install the gh-address-comments curated skill." },
    { command: "$skill-installer install the create-plan skill from the .experimental folder", description: "Install an experimental skill via natural-language instruction." },
    { command: ".system skills", description: "Ship with Codex automatically; no install step needed." },
  ],
  whenToUse: [
    "Working in OpenAI Codex and wanting curated, ready-made skills",
    "Authoring new skills with the skill-creator (strict YAML frontmatter and tool-transport rules)",
    "Pulling OpenAI infrastructure docs that resolve the latest model info dynamically",
    "Studying a reference implementation of the cross-agent Agent Skills format",
  ],
  howToUse: `\`.system\` skills ship with Codex automatically. Curated and experimental skills install via the in-Codex installer, then restart Codex to pick them up.

\`\`\`
$skill-installer gh-address-comments
$skill-installer install the create-plan skill from the .experimental folder
\`\`\`

The format follows the same SKILL.md standard as Claude Code skills, so the patterns (and many skills) port across agents.`,
  whyUseful: `It's the canonical OpenAI-maintained skills repo and proves the Agent Skills format is becoming a cross-vendor standard, not a Claude-only convention. Even when you run Claude Code, its skill-creator references and authoring discipline are a strong template — though note the installers here are Codex-native.`,
  examplePrompt: "$skill-installer install the create-plan skill from the .experimental folder",
  author: "OpenAI",
  dateAdded: "2026-06-14",
};
