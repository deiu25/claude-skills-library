import type { Skill } from "../types";

export const skill: Skill = {
  slug: "claude-scientific-writer",
  name: "Claude Scientific Writer",
  tagline: "Deep-research plugin generating publication-ready papers, grants, posters, and clinical reports with verified citations and AI diagrams.",
  category: "research",
  tags: ["scientific-writing", "research", "latex", "citations", "literature-review", "academic"],
  repo: "K-Dense-AI/claude-scientific-writer",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add https://github.com/K-Dense-AI/claude-scientific-writer",
  },
  update: {
    command: "/plugin marketplace update claude-scientific-writer",
    note: "README documents no explicit update command; the reliable path is re-running the marketplace add against the GitHub repo, then restarting Claude Code. PyPI CLI users update via pip install -U scientific-writer.",
  },
  usage: [
    { command: "/plugin install claude-scientific-writer", description: "Install the plugin after adding the K-Dense-AI GitHub marketplace." },
    { command: "/claude-scientific-writer:scientific-writer-init", description: "Write a CLAUDE.md in your project and enable all 20+ scientific writing skills." },
    { command: "@research-lookup", description: "Real-time literature search via Perplexity Sonar Pro to back claims with verifiable sources." },
    { command: "@peer-review", description: "Systematic manuscript evaluation using the 8-dimension ScholarEval framework." },
    { command: "@scientific-schematics", description: "Generate CONSORT diagrams, neural architectures, and pathways via Nano Banana Pro." },
    { command: "pip install scientific-writer", description: "Install the PyPI package for the standalone scientific-writer CLI and async Python API." },
  ],
  whenToUse: [
    "You need a publication-ready paper, NSF/NIH grant, conference poster, or clinical report drafted from your own CSV/figure data.",
    "You want every claim backed by real-time literature search and verified citations rather than hallucinated references.",
    "You need to generate scientific diagrams (CONSORT flowcharts, neural networks, pathways) from natural-language descriptions.",
    "You want manuscript peer-review feedback scored against the structured 8-dimension ScholarEval rubric.",
  ],
  howToUse: `Add the marketplace from the GitHub repo, install, restart, then initialize per project:

\`\`\`bash
/plugin marketplace add https://github.com/K-Dense-AI/claude-scientific-writer
/plugin install claude-scientific-writer
# restart Claude Code, then in your project:
/claude-scientific-writer:scientific-writer-init
\`\`\`

Skills are invoked with an \`@\` prefix, e.g. \`@research-lookup Find papers on mRNA vaccine efficacy\` or \`@peer-review Evaluate this manuscript\`. Drop figures and data into your project, then prompt with explicit file references:

\`\`\`text
> Create a Nature paper on CRISPR gene editing. Present editing_efficiency.csv
  (5 cell lines), include Western_blot.png and flow_cytometry.png showing 87%
  efficiency (p<0.001). Compare with literature benchmarks.
\`\`\`

Set \`ANTHROPIC_API_KEY\` (required) and \`OPENROUTER_API_KEY\` (optional, for research lookup). For CLI/API use without Claude Code, \`pip install scientific-writer\` exposes the \`scientific-writer\` command and an async Python API (Python 3.10-3.12).`,
  whyUseful: `Built by K-Dense Inc as the open-source tier of their commercial scientific-AI platform, it bundles 20+ purpose-built skills (papers, grants, posters, clinical reports, peer review) behind one plugin. Its differentiator is research-first generation: it searches real literature via Perplexity Sonar Pro and grounds every claim in verifiable citations, then handles BibTeX, LaTeX, and figure integration end to end, including AI-generated CONSORT/pathway diagrams via Nano Banana Pro. The same SKILL.md files double as portable prompts for any agentic LLM.`,
  examplePrompt: "Write an NSF grant proposal on quantum error correction. Present gate_fidelity.csv (99.2% vs 95% state-of-art), include circuit_topology.png and error_rates.csv, and add a 5-year timeline from milestones_budget.xlsx.",
  author: "K-Dense Inc (K-Dense-AI)",
  dateAdded: "2026-06-20",
};
