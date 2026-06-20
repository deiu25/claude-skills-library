import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-scientific-skills",
  name: "Scientific Agent Skills",
  tagline: "147 scientific research skills: genomics, drug discovery, proteomics, clinical ML, 100+ databases, for any Agent Skills agent.",
  category: "research",
  tags: ["bioinformatics", "drug-discovery", "genomics", "research", "agent-skills", "scientific-computing"],
  repo: "K-Dense-AI/claude-scientific-skills",
  install: {
    method: "npx-skills",
    command: "npx skills add K-Dense-AI/scientific-agent-skills",
  },
  update: {
    command: "gh skill update --all",
    note: "Re-run `npx skills add` to refresh, or use `gh skill update --all` (GitHub CLI v2.90.0+). Install a topical subset, not all 147 skills — they add a lot of standing context.",
  },
  usage: [
    { command: "npx skills add K-Dense-AI/scientific-agent-skills", description: "Install the full collection across Claude Code, Cursor, Codex, Google Antigravity, and other Agent Skills hosts." },
    { command: "gh skill install K-Dense-AI/scientific-agent-skills scanpy", description: "Install a single skill (e.g. scanpy) via GitHub CLI instead of the whole bundle." },
    { command: "gh skill update --all", description: "Update all installed skills to the latest published versions (GitHub CLI v2.90.0+)." },
    { command: "database-lookup", description: "Unified skill for deterministic, provenance-rich REST access to 78 public databases (PubChem, ChEMBL, UniProt, COSMIC, ClinicalTrials.gov)." },
    { command: "rdkit / scanpy / pydeseq2 / diffdock", description: "Per-package skills with curated docs and examples for cheminformatics, single-cell, differential expression, and docking workflows." },
    { command: "gh skill install K-Dense-AI/scientific-agent-skills --pin v1.0.0", description: "Pin to a release tag for reproducible installs." },
  ],
  whenToUse: [
    "You want your agent to run multi-step scientific pipelines — e.g. query ChEMBL for EGFR inhibitors, run RDKit SAR, dock with DiffDock, then write a report.",
    "You need reliable, provenance-rich access to scientific/clinical databases (PubChem, UniProt, COSMIC, ClinicalTrials.gov) instead of letting the agent improvise API calls.",
    "You work in bioinformatics, cheminformatics, proteomics, clinical ML, materials science, or geospatial analysis and want curated package skills (Scanpy, PyDESeq2, RDKit, PyTorch Lightning).",
    "You want literature review, scientific writing, lab automation (Benchling, Opentrons), or figure/slide generation driven by your agent.",
  ],
  howToUse: `Install via the Agent Skills standard (works in Claude Code, Cursor, Codex, Google Antigravity, and more):

\`\`\`bash
npx skills add K-Dense-AI/scientific-agent-skills
\`\`\`

Or pick individual skills with GitHub CLI (v2.90.0+) to avoid pulling all 147 into context:

\`\`\`bash
gh skill install K-Dense-AI/scientific-agent-skills scanpy
gh skill update --all
\`\`\`

Skills require \`uv\` to install their Python dependencies:

\`\`\`bash
curl -LsSf https://astral.sh/uv/install.sh | sh
\`\`\`

Once installed, the agent auto-discovers relevant skills; you can also name one directly in your prompt (e.g. "use database-lookup and rdkit"). Review each \`SKILL.md\` before installing — skills execute code and make network requests.`,
  whyUseful: `One of the largest curated open-source scientific skill collections for AI agents — 147 skills spanning genomics, drug discovery, proteomics, clinical ML, materials science, and scientific writing, plus a unified \`database-lookup\` skill covering 78 public databases with auditable provenance. Maintained by K-Dense Inc. (k-dense.ai), MIT-licensed, with all skills security-scanned approximately weekly via the Cisco AI Defense Skill Scanner, and built on the open Agent Skills standard so it works beyond Claude. It turns a coding agent into a research assistant that runs real end-to-end lab and analysis workflows from a single prompt.`,
  examplePrompt: "Use available skills: query ChEMBL for EGFR inhibitors with IC50 < 50nM, run SAR analysis with RDKit, dock candidates against the AlphaFold EGFR structure with DiffDock, then write a report.",
  author: "K-Dense Inc.",
  dateAdded: "2026-06-20",
};
