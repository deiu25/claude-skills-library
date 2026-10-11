# Claude Skills Library

A curated library of [Claude Code](https://claude.com/claude-code) skills: what each one does, **when** to reach for it, **how** to install it, and live GitHub stats (stars, forks, watchers, license, last push).

Built with Next.js 16, Tailwind CSS v4, and Motion. Hosted on Vercel.

**Live:** https://claude-skills-library-psi.vercel.app

## Features

- **Curated entries, not scraped lists.** Every skill has hand-written notes: when to use it, how to invoke it, and why it earns its place.
- **Live GitHub stats** via the REST API with 6-hour ISR revalidation. Skills sharing a monorepo cost one request.
- **Exact install commands** with one-click copy: plugin marketplaces, `npx skills`, or plain git clone.
- **Instant client-side search and category filters** over fully static data. Browsing needs no account and calls no backend.
- Dark-first design with a light mode, keyboard navigable, WCAG AA text contrast. Honors reduced motion, reduced transparency and increased contrast.

## Local development

```bash
npm install
npm run dev
```

GitHub stats work without configuration (60 unauthenticated requests/hour). For production, add a token:

```bash
cp .env.example .env.local
# set GITHUB_TOKEN=ghp_... (no scopes needed, public repo read only)
```

Accounts need a Postgres database and the auth variables in `.env.example`; [RUNBOOK.md](RUNBOOK.md) explains each one. The catalog runs without any of them.

## Adding a skill

Skills are typed data files: add `src/data/skills/<slug>.ts`, register it in [src/data/skills/index.ts](src/data/skills/index.ts), and open a pull request. [CONTRIBUTING.md](CONTRIBUTING.md) has the steps, the checks, and what makes a good entry. No time to write one? [Suggest a skill](https://github.com/deiu25/claude-skills-library/issues/new/choose) instead.

## Deploy

One-click deploy on Vercel: import the repo and set `GITHUB_TOKEN`. The catalog has more GitHub repos than the 60 anonymous requests per hour cover, so without a token part of it shows no stats. ISR handles stat freshness automatically. Operating the live site: [RUNBOOK.md](RUNBOOK.md).

## Documentation

| File | What it covers |
|---|---|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup, commands, adding a skill, pull requests |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code map, data flow, caching, invariants |
| [DESIGN.md](DESIGN.md) | Design tokens and component rules |
| [PRD.md](PRD.md) | Requirements, non-goals, acceptance criteria |
| [PRODUCT.md](PRODUCT.md) | Users, positioning, product principles |
| [ROADMAP.md](ROADMAP.md) | Planned accounts, user skills, marketplace and sync CLI, phase by phase |
| [RUNBOOK.md](RUNBOOK.md) | Deploys, rollbacks, incidents |
| [SECURITY.md](SECURITY.md) | Reporting a vulnerability |
| [CHANGELOG.md](CHANGELOG.md) | Notable changes |
| [AGENTS.md](AGENTS.md) | Instructions for AI coding agents; Claude Code loads it through [CLAUDE.md](CLAUDE.md) |

## License

MIT. Skill names, descriptions, and linked content belong to their respective authors.
