import type { Skill } from "../types";

export const skill: Skill = {
  slug: "obsidian-skills",
  name: "Obsidian Skills",
  tagline: "Claude Code plugin that auto-loads a disciplined note-taking working style inside Obsidian vaults; ships Karpathy's llm-wiki pattern.",
  category: "productivity",
  tags: ["obsidian", "note-taking", "knowledge-base", "llm-wiki", "markdown", "plugin"],
  repo: "qhuang20/obsidian-skills",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add qhuang20/obsidian-skills",
  },
  update: {
    command: "/plugin marketplace update obsidian-skills",
    note: "Then run /reload-plugins. The marketplace and plugin share the slug `obsidian-skills`. The README documents no explicit update command; this is the standard marketplace-update form.",
  },
  usage: [
    { command: "/plugin marketplace add qhuang20/obsidian-skills", description: "Add the marketplace from the GitHub repo inside a Claude Code session." },
    { command: "/plugin install obsidian-skills@obsidian-skills", description: "Install the plugin; the llm-wiki working style then auto-loads in any vault." },
    { command: "/plugin uninstall obsidian-skills@obsidian-skills", description: "Remove the plugin when you no longer want the vault working style." },
    { command: "llm-wiki (skill)", description: "Loads Karpathy's LLM Wiki pattern as the session mental model; pure guide, defines no slash commands." },
    { command: "Ingest (workflow)", description: "Drop a source into the vault and ask Claude to summarize, update related pages, and fix cross-references." },
    { command: "Lint (workflow)", description: "Ask Claude to health-check the wiki for contradictions, orphan pages, stale claims, and missing links." },
  ],
  whenToUse: [
    "You work in an Obsidian vault and want Claude to behave like a disciplined note-taking partner instead of a generic assistant.",
    "You want to build a persistent, interlinked markdown wiki that compounds over time rather than re-reading raw documents on every query.",
    "You're ingesting articles, papers, or podcast notes and want summaries, entity/concept pages, and consistent cross-references.",
    "You want vault-aware behavior that activates automatically and stays silent in non-vault projects.",
  ],
  howToUse: `Install from inside a running Claude Code session:

\`\`\`
/plugin marketplace add qhuang20/obsidian-skills
/plugin install obsidian-skills@obsidian-skills
\`\`\`

The \`llm-wiki\` working style loads automatically the next time you start a session from inside an Obsidian vault — detected by walking upward from your working directory for a \`.obsidian/\` subdirectory. No commands, no config, no imposed folder layout.

The workflow is three operations against your vault: **Ingest** a source, **Query** the accumulated wiki (answers come with citations and can be filed back as pages), and **Lint** for contradictions, orphans, and stale claims. The skill is a pure guide — it does not define slash commands or write to your vault on its own; Claude co-evolves page formats and folders with you.

Uninstall:

\`\`\`
/plugin uninstall obsidian-skills@obsidian-skills
\`\`\``,
  whyUseful: `Encodes Andrej Karpathy's LLM Wiki pattern as a reusable Claude Code working style: build a persistent, interlinked markdown knowledge base that compounds instead of retrieving from raw documents every time. It auto-activates only inside Obsidian vaults (\`.obsidian/\` marker, searched upward) and stays silent everywhere else, so it adds zero friction to your other projects. MIT-licensed, with a roadmap for more vault skills (daily notes, link management, publishing) that activate the same unobtrusive way.`,
  examplePrompt: "Ingest this paper into my vault: summarize it, update related concept pages, and flag any contradictions with existing notes.",
  author: "qhuang20",
  dateAdded: "2026-06-20",
};
