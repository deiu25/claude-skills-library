<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Claude Skills Library

A curated catalog of Claude Code skills, live at https://claude-skills-library-psi.vercel.app. Next.js 16 App Router, React 19, Tailwind CSS v4, strict TypeScript. The catalog is static data in `src/data/skills/`. Accounts, user skills and a marketplace are being built around it, one phase at a time, from [ROADMAP.md](ROADMAP.md). A push to `main` deploys to production.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Unit tests | `npm test` |
| Lint | `npm run lint` |
| Type check | `npx tsc --noEmit` (there is no npm script) |
| Production build | `npm run build` |

A change is done when test, lint, type check and build all pass.

## Read before you change

| When you change | Read first |
|---|---|
| Data flow, caching, routes, `src/lib/` | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Anything visual: CSS, components, layout | [DESIGN.md](DESIGN.md) |
| Features, scope, what the site must not do | [PRD.md](PRD.md) |
| Copy, audience, positioning | [PRODUCT.md](PRODUCT.md) |
| Catalog entries, branches, pull requests | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Deploys, rollbacks, production problems | [RUNBOOK.md](RUNBOOK.md) |
| Auth, the database, user skills, payments, the sync CLI | [ROADMAP.md](ROADMAP.md): decisions, merge rules, the next phase |
| Any Next.js API | `node_modules/next/dist/docs/`; caching here follows `01-app/02-guides/caching-without-cache-components.md` |

## Gotchas

- `cacheComponents` is off. Cache with route segment config and `fetch(..., { next: { revalidate } })`; don't add `"use cache"`.
- `export const revalidate = 21600` must stay a literal in every catalog route, because Next.js reads it statically. Change it together with `REVALIDATE_SECONDS` in `src/lib/github.ts`.
- `getRepoStats` returns `null` on any failure. Every page must render without stats, and a GitHub error must never fail a page or a build.
- A file in `src/data/skills/` does nothing until it is imported and appended to `skills` in `src/data/skills/index.ts`.
- `/skills` writes its URL state (`q`, `category`, `sel`) with `window.history.replaceState`. `router.replace` re-runs the server page and flashes the loading skeleton.
- Without `GITHUB_TOKEN`, a build needs more GitHub requests than the 60 per hour allowed anonymously, so some stats come back empty. Expected locally; production needs the token (RUNBOOK.md).
- The theme is a `.dark` class on `<html>`, set by an inline script in `layout.tsx` before first paint. Dark is the default.

## Conventions

- English everywhere: code, UI copy, comments, commits, docs.
- Styling goes through the tokens in `src/app/globals.css` (`bg-surface`, `text-muted`, `border-line`). No raw hex in components.
- One component per file, named export. `"use client"` only for state, effects or browser APIs.
- Logic without UI goes in `src/lib/` with a `*.test.ts` beside it.
- Branch from `main` and use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `perf:`, `ci:`).
- When a change contradicts ARCHITECTURE.md, DESIGN.md or PRD.md, update that file in the same change. Visitor-facing changes get a line in [CHANGELOG.md](CHANGELOG.md).

## Boundaries

- Leave the `nextjs-agent-rules` block at the top of this file alone; Next.js manages it.
- Never commit a `.env*` file other than `.env.example`, which holds variable names only, and never print a secret: `GITHUB_TOKEN` and every key RUNBOOK.md lists.
- Backend work (auth, database, user content, payments) follows ROADMAP.md: one phase per session, under its merge rules. Catalog pages stay prerendered and cookie-free for anonymous visitors (PRD.md, NFR-3 and NFR-5).
- No request-time AI call, and no analytics or tracking (PRD.md, NFR-5).
- `main` is production. Push to it only when every check passes.
