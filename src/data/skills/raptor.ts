import type { Skill } from "../types";

export const skill: Skill = {
  slug: "raptor",
  name: "RAPTOR",
  tagline: "Turns Claude Code into an autonomous security agent that scans, validates, exploits, and patches vulnerabilities.",
  category: "domain",
  tags: ["security", "vulnerability-scanning", "exploit-generation", "static-analysis", "fuzzing", "agentic"],
  repo: "gadievron/raptor",
  install: {
    method: "manual-copy",
    command:
      "git clone https://github.com/gadievron/raptor.git && cd raptor && pip install -r requirements.txt semgrep && claude",
  },
  whenToUse: [
    "You want Claude Code to autonomously scan a codebase or binary, validate exploitability, generate a PoC, and propose patches",
    "You run security research / red-team or blue-team operations and want an agentic workflow over Semgrep, CodeQL, and AFL++",
    "You want plain-English slash commands (/scan, /understand, /validate, /exploit, /patch, /fuzz) instead of memorizing tool syntax",
    "You need triage of static-analysis findings with LLM-driven prioritization and false-positive filtering",
  ],
  howToUse: `RAPTOR is a full Claude Code project (it ships \`.claude/\` with agents, commands, skills, and a top-level \`CLAUDE.md\`) backed by a Python execution layer. You clone the whole repo and run Claude Code from inside it.

\`\`\`bash
git clone https://github.com/gadievron/raptor.git
cd raptor
pip install -r requirements.txt   # + npm install -g @anthropic-ai/claude-code, pip install semgrep
claude
# Devcontainer (recommended): docker build -f .devcontainer/Dockerfile -t raptor:latest . && docker run --privileged -it raptor:latest
\`\`\`

Drive it with slash commands:

\`\`\`text
/agentic   # full workflow: scan -> validate -> exploit -> patch
/scan      # static analysis with Semgrep and CodeQL
/understand --map  # map attack surface, trace data flows
/validate  # multi-stage exploitability validation
/exploit   # PoC generation
/patch     # secure-fix generation
/fuzz      # binary fuzzing with AFL++
\`\`\`

The deterministic Python layer runs the tools and parses SARIF (also runs headless in CI); the LLM layer triages and reasons.`,
  whyUseful: `RAPTOR packages a serious security workflow — static analysis, binary fuzzing, exploitability validation, exploit PoC, and patch generation — as Claude Code skills, sub-agents, and slash commands orchestrated by a CLAUDE.md. It cleanly separates a deterministic Python layer from an LLM layer that triages and reasons, so the pipeline can also run headless in CI. Authored by well-known security researchers (Gadi Evron, Halvar Flake, et al.). For authorized security testing only.`,
  examplePrompt: "/scan - run static analysis on this directory for secrets and vulnerabilities",
  author: "gadievron",
  dateAdded: "2026-06-14",
};
