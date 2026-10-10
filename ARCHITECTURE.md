# Architecture

How the Claude Skills Library is built. Read it before you change data flow, caching, routes or a shared module. What the product must do is in [PRD.md](PRD.md); how it looks is in [DESIGN.md](DESIGN.md).

Accounts, user skills, a marketplace, personal libraries and playbooks are being added phase by phase; [ROADMAP.md](ROADMAP.md) holds their target design. Everything below describes the code as it is, and each phase updates it when it changes the code.

## Bird's-eye view

A curated catalog of Claude Code skills, published as a mostly static Next.js site.

- **Input:** one hand-written TypeScript file per skill in `src/data/skills/`, plus repository stats from the GitHub REST API.
- **Output:** prerendered HTML pages and three plain-text or JSON endpoints, regenerated every 6 hours (ISR).
- **No backend of its own:** no database, no auth, no endpoint that accepts user input. Search, filters, multi-select, the recommender, copy and download run in the browser on data already in the page.

```text
src/data/skills/<slug>.ts ──► src/data/skills/index.ts      registry: skills[] + helpers
                                         │
api.github.com ◄── src/lib/github.ts ────┤                  one fetch per unique repo,
                                         │                  cached 6 h, null on any failure
                                         ▼
                  src/app/**   Server Components and route handlers
                  ├── HTML pages ──► client components: search, selection, recommender, copy, download
                  └── /skills.json · /llms.txt · /install-all.txt     serializers in src/lib/report.ts
```

## Code map

### `src/data/`

- `types.ts`: the `Skill` interface, `SkillCategory`, `InstallMethod` and `CATEGORY_LABELS`. Every entry, page and serializer depends on this schema.
- `skills/<slug>.ts`: one catalog entry per file, exported as `export const skill: Skill`.
- `skills/index.ts`: the registry. It imports every entry into `skills` (lists sort by GitHub stars, so array order only breaks ties) and exposes `getSkill`, `getFeaturedSkills`, `getCategoriesWithCounts` and `getUniqueRepos`. An entry that is not registered here does not exist on the site.

### `src/lib/`

Pure modules, plus the one clipboard hook. All unit tests live here.

- `github.ts`: `getRepoStats`, `formatCount`, `formatRelativeDate`.
- `report.ts`: every export format: the JSON catalog (versioned by `CATALOG_VERSION`), the Markdown report, per-skill Markdown for "Copy for Claude", `llms.txt`, the cheat sheet and the install-all prompt.
- `recommend.ts`: the weighted token-overlap scorer behind `/recommend`.
- `selection.ts`: encodes and decodes the `sel` URL parameter.
- `site.ts`: site name, URLs and description, and `ariaCurrent` for nav links.
- `useCopyToClipboard.ts`: copy with transient "copied" feedback, shared by the copy buttons. The selection bar's "Copy share link" calls the clipboard API directly.

### `src/app/`

| Route | Source | Rendering |
|---|---|---|
| `/` | `page.tsx` | static, revalidated every 6 h |
| `/skills` | `skills/page.tsx` | static, revalidated every 6 h; `SkillSearch` sits in `<Suspense>` because it reads `useSearchParams` |
| `/skills/[slug]` | `skills/[slug]/page.tsx` | prerendered through `generateStaticParams`, revalidated every 6 h, `notFound()` for unknown slugs |
| `/recommend` | `recommend/page.tsx` | static, revalidated every 6 h; matching runs in the browser |
| `/report` | `report/page.tsx` | static, revalidated every 6 h |
| `/skills.json`, `/llms.txt`, `/install-all.txt` | `<name>/route.ts` | `force-static`, revalidated every 6 h |
| `/sitemap.xml`, `/robots.txt` | `sitemap.ts`, `robots.ts` | metadata routes; the sitemap lists every skill in the registry, robots allows all crawlers |
| `/opengraph-image` | `opengraph-image.tsx` | edge runtime, rendered on demand |

`layout.tsx` owns the fonts (Geist and Geist Mono through `next/font`), site metadata, the skip link and the theme init script. `globals.css` owns every design token.

### `src/components/`

One component per file, named export. Client components (`"use client"`): `SkillSearch`, `SelectionBar`, `SkillRecommender`, `HeroSearch`, `HeroInstall`, `ThemeToggle`, `NavLink`, `Reveal`, `CopyButton`, `CopyForClaudeButton`, `DownloadButton`. The rest render on the server; `SkillCard` and `StatsRow` also ship to the browser, because `SkillSearch` and `SkillRecommender` import them.

## Invariants

These hold today. Breaking one is an architecture decision, not a refactor: update this section in the same change.

1. **No runtime backend.** All data is the registry plus GitHub stats fetched at build or revalidation time. The only secret is the optional `GITHUB_TOKEN`.
2. **GitHub is optional.** `getRepoStats` returns `null` on any failure (rate limit, 404, network error, malformed JSON) and never throws. Every consumer renders without stats, and a GitHub outage must never fail a build.
3. **One cache window, written in several places.** The 6-hour window is `REVALIDATE_SECONDS` in `github.ts` and the literal `21600` in each catalog route's `export const revalidate`. Next.js requires that value to be statically analyzable, so routes cannot import the constant. Change all of them together.
4. **The previous caching model.** `cacheComponents` is off. Caching uses route segment config (`revalidate`, `dynamic`) and `fetch(..., { next: { revalidate } })`. The matching docs are `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`. Do not add `"use cache"` without migrating on purpose.
5. **Deterministic serializers.** `report.ts` writes no timestamps by default (`generatedAt` defaults to `""`), so builds and tests are reproducible.
6. **`/skills` state lives in the URL.** `q`, `category` and `sel` are written with `window.history.replaceState`, not `router.replace`: the router call re-runs the async server page behind `<Suspense>` and flashes the skeleton on every click.
7. **Slugs are unique kebab-case** (`[a-z0-9-]+`). They are route params, sitemap entries and the `sel` encoding; `selection.ts` drops anything else.
8. **No AI call, and no third-party call while serving a request.** GitHub is fetched at build and in background revalidation. The recommender and the selection export run in the browser; the other exports are built on the server at build or revalidation time.

## Cross-cutting concerns

- **Accessibility:** every page renders `SiteHeader`, `<main id="main">` and `SiteFooter`, and the layout's skip link targets `#main`. Nav links set `aria-current` through `ariaCurrent`. Motion honours `prefers-reduced-motion` in CSS and in `Reveal`, and a `scripting: none` rule keeps revealed content visible without JavaScript.
- **Theming:** dark by default, class strategy (`.dark` on `<html>`), choice stored in `localStorage.theme`. An inline script in `layout.tsx` applies it before first paint, which is why `<html>` carries `suppressHydrationWarning`.
- **SEO:** per-page `metadata` and `generateMetadata`, a sitemap and robots file generated from the registry, an Open Graph image and `/llms.txt`. `SITE_URL` in `site.ts` is the canonical origin.
- **Testing:** Vitest in a Node environment over `src/**/*.test.ts`. Only `src/lib` is covered; there are no component or end-to-end tests.
- **Quality gates:** `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Known limits

- **GitHub rate limit.** Each 6-hour window costs one request per unique repo. The catalog has more unique repos than the 60 requests per hour GitHub allows without a token, so production needs `GITHUB_TOKEN` (5,000 per hour) or some cards lose their stats.
- **No fetch timeout.** `getRepoStats` handles errors, not slowness. A GitHub response that hangs past Next.js's 60-second static generation limit fails that page's build.
- **Recommender scale.** Token overlap is sized for tens to low hundreds of entries. Past that, a search index is the upgrade.
- **Open Graph image.** It uses the edge runtime, so it is rendered on demand; the build warns that the edge runtime disables static generation for that route.
