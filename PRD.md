# Product Requirements: Claude Skills Library

| | |
|---|---|
| Status | Live at https://claude-skills-library-psi.vercel.app |
| Owner | Badulescu Andrei ([@deiu25](https://github.com/deiu25)) |
| Last reviewed | 2026-10-10 |

What the product must do, and what it must not do. Who it is for and why it exists are in [PRODUCT.md](PRODUCT.md); how it is built is in [ARCHITECTURE.md](ARCHITECTURE.md); the accounts and marketplace work is planned in [ROADMAP.md](ROADMAP.md).

## Problem

Claude Code skills, plugins and MCP servers are spread across hundreds of GitHub repositories and awesome lists. A README rarely says when a skill is the right tool, install paths differ from one project to the next (plugin marketplace, `npx skills`, a plain copy), and star counts say little about fit. Choosing and installing the right skill means reading many READMEs.

## Goals

1. A visitor goes from a task to an installed skill without leaving the site to read documentation.
2. Every entry explains, in hand-written prose, when to use the skill, how to invoke it and why it earns its place.
3. Where a skill installs with a command, the entry gives that command exactly as it runs; where none exists, a one-line instruction.
4. The whole catalog can be handed to an LLM in one step: Markdown, JSON, `llms.txt` or an install-all prompt.
5. A signed-in user keeps all their skills in one library: the ones they wrote, bought or saved from GitHub and the web, and what is installed globally and in each project.
6. An author presents a skill on its own page and sells it through the site.
7. A user follows a playbook for their kind of project: the skills for each stage, in order, exported so Claude Code walks through them.

Goals 5 to 7 are planned; [ROADMAP.md](ROADMAP.md) builds them in phases.

## Non-goals

- Comments, forums or messages between users. Reviews come only from verified buyers.
- A request-time AI call. Search, recommendations and exports of the catalog stay in the browser.
- Scraped or generated catalog entries. The catalog is curated by hand; skills that users publish appear separately, as Community.
- Hosting files for catalog entries. An entry links to its source and installs from there; the site stores only the skills users upload.
- Analytics or tracking. Sellers see their own sales, never data about visitors.
- Localisation. The site is English-only.

## Users

Described in [PRODUCT.md](PRODUCT.md#users): Claude Code users choosing skills, agents reading the machine endpoints, and contributors adding entries.

## Functional requirements

### Catalog entry (`src/data/types.ts`)

- **FR-1** Each entry has a unique kebab-case `slug`, a `name`, a one-line `tagline` (the schema asks for 20 words or fewer), one `category`, `tags`, an `author` and a `dateAdded` ISO date.
- **FR-2** Each entry has an `install` command with its method (`marketplace`, `plugin`, `npx-skills` or `manual-copy`) and an `update` command with an optional note, each copied from upstream, or a one-line instruction when no single command exists.
- **FR-3** Each entry has `whenToUse` bullets, structured `usage` items (a command and a one-line description), and Markdown `howToUse` and `whyUseful`. `examplePrompt` is optional.
- **FR-4** `repo` is `owner/repo` for a GitHub-hosted skill, or `null` for a local skill, which then shows no stats.

### Home (`/`)

- **FR-5** A hero search opens `/skills` with the query filled in.
- **FR-6** An "Install the whole library" panel copies the install-all prompt or the whole library as Markdown, and links to the raw endpoints.
- **FR-7** A category strip with counts, the featured skills ordered by GitHub stars, a three-step "how it works" and a call to contribute.

### Browse (`/skills`)

- **FR-8** Instant search and a category filter over the full catalog.
- **FR-9** Multi-select with a selection bar that exports the chosen skills as Markdown and copies a share link. `q`, `category` and `sel` live in the URL, so any view can be shared and restored.

### Skill page (`/skills/[slug]`)

- **FR-10** Shows the tagline, author, source link, GitHub stats (stars, forks, watchers, open issues, license, last push), install, update, when to use, commands and flags, how to use, why it earns its place, an optional "Try it" prompt, and tags that link back to search.
- **FR-11** "Copy for Claude" copies a compact Markdown summary of the entry: name, stars, tagline, category, install command, tags, when to use, author and source.
- **FR-12** An unknown slug returns the 404 page.

### Recommend (`/recommend`)

- **FR-13** A free-text task description ranks matching skills in the browser, with no account and no AI call.

### Report (`/report`)

- **FR-14** A coverage map of every category, empty ones included, with the spread of install methods and the most recent update.
- **FR-15** Exports of the Markdown report, cheat sheet, JSON catalog and install-all prompt, each one copyable or downloadable.

### Machine endpoints

- **FR-16** `/skills.json` (a versioned JSON catalog with star counts), `/llms.txt` (llmstxt.org format) and `/install-all.txt` (a prompt Claude Code runs), all static and regenerated with the site.
- **FR-17** `/sitemap.xml` lists every skill page, and `/robots.txt` allows all crawlers.

### Accounts and user content (planned)

Each line becomes its own section here when its [ROADMAP.md](ROADMAP.md) phase ships.

- **FR-18** Accounts: email and password with verification and reset, GitHub sign-in, two-factor, passkeys, active sessions, data export and account deletion (P1–P3).
- **FR-19** Private skills: a user writes or uploads a skill folder, keeps its versions, and sees a security scan of it (P4–P5).
- **FR-20** Community: public profiles and skill pages, a Community browse kept apart from the catalog, reports and moderation (P6–P7).
- **FR-21** Selling: sellers onboard with Stripe, buyers pay by card and download what they bought, and a refund revokes access (P8, P9, P13).
- **FR-22** Library: skills saved from the catalog, Community, GitHub or any URL; projects; global and per-project installs; export as an install prompt (P10).
- **FR-23** Sync CLI: an `npx` command authenticated with an API key reports installed skills, pulls owned skills and flags outdated ones (P11–P12).
- **FR-24** Reviews from verified buyers and public project stacks (P14); teams that share private skills (P15).
- **FR-25** Playbooks:
  - Curated playbooks need no account (P16).
  - Users build their own (P17), share and copy them (P18), apply them with the CLI (P19), and sell them or share them in a team (P20).
  - Every playbook exports as a Claude Code skill that walks its stages in order.

## Non-functional requirements

- **NFR-1 Freshness.** The first request after each 6-hour window triggers a background refresh of the GitHub stats; requests after it get the new data.
- **NFR-2 Resilience.** When GitHub rejects a request or is down, every page still renders and every build still succeeds; stats are hidden or marked unavailable. A response that hangs is not covered (see ARCHITECTURE.md, Known limits). The catalog never depends on a database: a database outage leaves every catalog page and endpoint working, and only the migration step of a deploy needs it.
- **NFR-3 Performance.** Catalog pages are prerendered. For anonymous visitors the core features run in the browser and call no API; Next.js route prefetches are the only requests after load.
- **NFR-4 Accessibility.** WCAG AA contrast for text in both themes, full keyboard navigation, a skip link, and support for reduced motion, reduced transparency and increased contrast.
- **NFR-5 Privacy.** No analytics or tracking. Anonymous visitors get no cookie; the browser stores only the theme choice in `localStorage` and, after a sign-in, a flag saying the visitor has signed in before. Signed-in users get one strictly necessary session cookie and can export and delete their data.
- **NFR-6 Security.** The server accepts input only on authenticated routes and the payment webhook; it validates every input and checks ownership on every write. No secret reaches the client; RUNBOOK.md lists them.
- **NFR-7 Licensing.** The code is MIT. Skill names, descriptions and linked content belong to their authors, and the footer says so.

## Acceptance criteria for any change

- The quality gates pass: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Every route in this document still renders, with GitHub stats and without them.
- Catalog routes stay static in the build output, and an anonymous catalog page sets no cookie.
- A new or edited entry meets FR-1 to FR-4, and its install command matches the upstream README on the day it is written.

## Open questions

- **Usage measurement.** With no analytics, there is no evidence of which skills or features people use. Adding any measurement changes NFR-5.
- **Entry freshness.** Nothing checks that an install command still works after its upstream project changes.
- **Selling setup.** VAT, the platform fee and the marketplace terms are settled with an accountant before payments go live (ROADMAP.md, P13).
