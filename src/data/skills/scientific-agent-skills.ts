import type { Skill } from "../types";

export const skill: Skill = {
  slug: "scientific-agent-skills",
  name: "Scientific Agent Skills",
  tagline: "146 skills giving agents procedural access to bioinformatics, ML, and 78+ research databases.",
  category: "research",
  tags: ["science", "bioinformatics", "machine-learning", "research", "databases"],
  repo: "K-Dense-AI/scientific-agent-skills",
  install: {
    method: "npx-skills",
    command: "npx skills add K-Dense-AI/scientific-agent-skills",
  },
  update: {
    command: "npx skills add K-Dense-AI/scientific-agent-skills",
    note: "Re-running fetches the latest version.",
  },
  usage: [
    { command: "npx skills add K-Dense-AI/scientific-agent-skills", description: "Install the full skill bundle via the open skills CLI (Claude Code, Codex, Gemini CLI, Cursor, and more)." },
    { command: "npx skills add <skill-name>", description: "Install a single skill by name instead of the whole bundle." },
    { command: "pathml", description: "WSI pathology pipeline: load -> Macenko/Vahadane normalization -> tissue detection -> feature extraction." },
    { command: "stable-baselines3", description: "RL training skill that forces observation spaces to np.uint8 in [0, 255]." },
    { command: "primekg", description: "Query the PrimeKG knowledge graph for drug-target interactions and repurposing candidates." },
  ],
  whenToUse: [
    "Running computational science pipelines (pathology WSI, single-cell, RL training) without hand-writing boilerplate",
    "Querying public scientific databases (PubChem, ChEMBL, UniProt, PrimeKG, ClinicalTrials.gov, and 70+ more)",
    "Autonomous hypothesis generation and drug-repurposing over knowledge graphs",
    "Deep literature research that prioritizes preprints (arXiv, bioRxiv) over commercial sources",
  ],
  howToUse: `Install with the open \`skills\` CLI (works across Claude Code, Codex, Gemini CLI, Cursor, and more), or install a single skill by name.

\`\`\`
npx skills add K-Dense-AI/scientific-agent-skills
\`\`\`

Each skill's SKILL.md encodes a strict order of operations to prevent hallucinated parameters — e.g. \`pathml\` dictates load → Macenko/Vahadane normalization → tissue detection → feature extraction; \`stable-baselines3\` forces observation spaces to \`np.uint8\` in [0, 255].`,
  whyUseful: `It dissolves the integration friction that — more than raw model intelligence — bottlenecks computational science. By shipping pre-configured schemas, database access, and deterministic procedures for highly specialized domains, a generalist agent can formulate and test scientific hypotheses against real data with far less setup and far fewer syntactic hallucinations.`,
  examplePrompt: "Use the primekg skill to find drug-target interactions for repurposing against a disease gene",
  author: "K-Dense AI",
  dateAdded: "2026-06-14",
};
