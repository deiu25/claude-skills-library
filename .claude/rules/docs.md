---
paths:
  - "*.md"
  - "**/AGENTS.md"
  - "**/CLAUDE.md"
  - ".claude/rules/**"
  - "docs/**/*.md"
---

# Docs

Every line in these files costs context, so:

- Write only what the code cannot tell an agent within a minute: commands, gotchas, invariants, boundaries, pointers.
- One home per fact. Link from AGENTS.md to ARCHITECTURE.md, PRD.md and RUNBOOK.md instead of restating them.
- A new line in AGENTS.md or a rule needs evidence: something went wrong, or the code cannot show it. Replace, do not append.
- Link, never `@import`: an import loads into every session. The one exception is the `@AGENTS.md` line that is all of CLAUDE.md.
- Leave tool-owned blocks alone: anything between BEGIN and END markers.
- Budgets: AGENTS.md 80 lines, a path rule 40, ARCHITECTURE.md and PRD.md 120, RUNBOOK.md 100. Over budget: cut what the code shows, merge duplicates, move detail to the doc that owns it, scope it to a path rule.
- A rule that a test, a lint rule, a type or a hook can enforce belongs there, not here.
