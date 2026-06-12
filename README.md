# Claude Skills Library

A curated library of [Claude Code](https://claude.com/claude-code) skills: what each one does, **when** to reach for it, **how** to install it, and live GitHub stats (stars, forks, watchers, license, last push).

Built with Next.js 15, Tailwind CSS v4, and Motion. Hosted on Vercel.

## Features

- **Curated entries, not scraped lists.** Every skill has hand-written notes: when to use it, how to invoke it, and why it earns its place.
- **Live GitHub stats** via the REST API with 6-hour ISR revalidation. Skills sharing a monorepo cost one request.
- **Exact install commands** with one-click copy: plugin marketplaces, `npx skills`, or plain git clone.
- **Instant client-side search and category filters** over fully static data. No database, no backend.
- Dark-first design with a light mode, keyboard navigable, WCAG AA contrast.

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

## Adding a skill

Skills are typed data files. To add one:

1. Create `src/data/skills/<slug>.ts` exporting a `Skill` (see [src/data/types.ts](src/data/types.ts) for the shape and any existing file for an example).
2. Register it in [src/data/skills/index.ts](src/data/skills/index.ts).
3. `npm run build` to verify, then open a pull request.

Set `repo: "owner/repo"` for skills hosted on GitHub (stats appear automatically) or `repo: null` for local/private skills.

## Deploy

One-click deploy on Vercel: import the repo, optionally set `GITHUB_TOKEN`, done. ISR handles stat freshness automatically.

## License

MIT. Skill names, descriptions, and linked content belong to their respective authors.
