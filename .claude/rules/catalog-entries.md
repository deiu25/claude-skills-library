---
paths:
  - "src/data/skills/**"
---

# Catalog entries

One entry per file: `src/data/skills/<slug>.ts` exports `export const skill: Skill`, typed by `src/data/types.ts`. The human guide is "Adding a skill" in CONTRIBUTING.md.

- Research first. Read the upstream README on its default branch, with `gh` or a page fetch rather than memory, and copy the install and update commands exactly. Never guess a flag, a marketplace name or a package name.
- `slug`: kebab-case, unique, identical to the file name.
- `tagline`: one line, at most 20 words, saying what the skill does.
- `repo`: `owner/repo` exactly as on GitHub, because stats depend on it. `repoPath` for a monorepo subfolder. `null` only when there is no public repo.
- `install.method`: `marketplace`, `plugin`, `npx-skills` or `manual-copy`, matching the command.
- `whenToUse`: concrete situations, not a feature list. `usage`: real commands or prompts, one line each.
- `howToUse` and `whyUseful` are Markdown inside template literals: escape backticks as `` \` ``.
- `author`: the upstream owner as they present themselves. `dateAdded`: today, `YYYY-MM-DD`.
- Avoid star counts and other numbers that go stale in prose; the page shows live stats.
- Leave `featured` off unless the owner asks for it.
- Register the entry: import it in `src/data/skills/index.ts` and append it to the end of `skills`.
- Verify with `npm test`, `npm run lint`, `npx tsc --noEmit` and `npm run build`, then check `/skills/<slug>` under `npm run dev`.
