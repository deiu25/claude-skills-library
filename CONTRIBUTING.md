# Contributing

Most contributions are one new skill entry: a typed data file plus one line in the registry. Code changes are welcome too.

## Setup

You need Node.js 20.9 or later and npm.

```bash
npm install
npm run dev   # http://localhost:3000
```

GitHub stats work without configuration, but a full build needs more requests than the 60 per hour GitHub allows without a token, so some cards will show no stats. For complete stats, copy the example env file and set `GITHUB_TOKEN`. The token needs no scopes, because it only reads public repositories.

```bash
cp .env.example .env.local
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run the Vitest unit tests once (`npm run test:watch` keeps watching) |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check |
| `npm run build` | Build for production and prerender every page |
| `npm start` | Serve the production build |
| `npm run test:e2e` | Build, serve on port 3000 and run the Playwright tests in `e2e/`. Run `npx playwright install chromium` once first |

## Adding a skill

1. Read the skill's upstream README. You need its exact install command, how to update it, and what it is for.
2. Create `src/data/skills/<slug>.ts` exporting `export const skill: Skill`. The schema is in `src/data/types.ts`, with comments on most fields. Good models: `claude-mem.ts` (a plugin marketplace), `skill-creator.ts` (a folder inside a monorepo, using `repoPath`) and `grill-me.ts` (a local skill with no public repo).
3. Import it in `src/data/skills/index.ts` and append it to the `skills` array. A file that is not registered does not appear on the site.
4. Run the checks below and open `/skills/<slug>` in the dev server.
5. Open a pull request.

No time to write the entry? [Suggest the skill](https://github.com/deiu25/claude-skills-library/issues/new/choose) in an issue instead.

### What makes a good entry

- **Tagline:** one line, at most 20 words, saying what the skill does.
- **When to use:** concrete situations where it is the right tool, not a feature list.
- **Install and update:** copied from upstream exactly as they run, with the matching method: `marketplace`, `plugin`, `npx-skills` or `manual-copy`. When no single command exists, write one plain instruction instead, as `grill-me.ts` does.
- **Usage:** real commands or prompts, each with a one-line description.
- **How to use, why it earns its place:** short Markdown. Say when not to use it, too.
- **Repo:** `owner/repo` for live stats, `repoPath` for a monorepo subfolder, `null` when there is no public repo.
- **Dates and numbers:** `dateAdded` is the day you add the entry (`YYYY-MM-DD`). Avoid star counts in prose: the page shows live stats, and written numbers go stale.

## Making a change

- Branch from `main`. `main` is production: every push to it deploys the live site.
- Write commit messages in English, as [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`, `ci:`.
- Keep the change focused, and match the style of the file you are editing.
- Logic without UI belongs in `src/lib/`, with a `*.test.ts` next to it.
- If the change alters what [ARCHITECTURE.md](ARCHITECTURE.md), [DESIGN.md](DESIGN.md) or [PRD.md](PRD.md) describes, update that file in the same pull request. Add a line to [CHANGELOG.md](CHANGELOG.md) for anything a visitor would notice.

## Before you open a pull request

```bash
npm test && npm run lint && npx tsc --noEmit && npm run build && npm run test:e2e
```

All five must pass. For a visual change, check both themes and a 375px-wide viewport, and add a screenshot to the pull request.

Branches pushed to this repository get a Vercel preview deployment, and merging into `main` deploys to production. A push that changes only docs builds nothing; [RUNBOOK.md](RUNBOOK.md) lists which files count and covers deploys and rollbacks.

## Security

Report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md), never in a public issue.
