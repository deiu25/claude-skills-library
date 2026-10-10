# Product Requirements: Claude Skills Library

| | |
|---|---|
| Status | Live at https://claude-skills-library-psi.vercel.app |
| Owner | Badulescu Andrei ([@deiu25](https://github.com/deiu25)) |
| Last reviewed | 2026-10-10 |

What the product must do, and what it must not do. Who it is for and why it exists are in [PRODUCT.md](PRODUCT.md); how it is built is in [ARCHITECTURE.md](ARCHITECTURE.md).

## Problem

Claude Code skills, plugins and MCP servers are spread across hundreds of GitHub repositories and awesome lists. A README rarely says when a skill is the right tool, install paths differ from one project to the next (plugin marketplace, `npx skills`, a plain copy), and star counts say little about fit. Choosing and installing the right skill means reading many READMEs.

## Goals

1. A visitor goes from a task to an installed skill without leaving the site to read documentation.
2. Every entry explains, in hand-written prose, when to use the skill, how to invoke it and why it earns its place.
3. Where a skill installs with a command, the entry gives that command exactly as it runs; where none exists, a one-line instruction.
4. The whole catalog can be handed to an LLM in one step: Markdown, JSON, `llms.txt` or an install-all prompt.

## Non-goals

- User accounts, ratings, comments or any other user-generated content.
- A backend, a database or a request-time AI call. Search, recommendations and exports stay in the browser.
- Scraped or generated entries. The catalog is curated by hand.
- Hosting skill files. The site links to each skill's source and installs from there.
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

## Non-functional requirements

- **NFR-1 Freshness.** The first request after each 6-hour window triggers a background refresh of the GitHub stats; requests after it get the new data.
- **NFR-2 Resilience.** When GitHub rejects a request or is down, every page still renders and every build still succeeds; stats are hidden or marked unavailable. A response that hangs is not covered (see ARCHITECTURE.md, Known limits).
- **NFR-3 Performance.** Pages are prerendered, and the core features make no network request after load.
- **NFR-4 Accessibility.** WCAG AA contrast for text in both themes, full keyboard navigation, a skip link, and support for reduced motion, reduced transparency and increased contrast.
- **NFR-5 Privacy.** No analytics, cookies or tracking. The only thing stored on the client is the theme choice in `localStorage`.
- **NFR-6 Security.** The server accepts no user input. `GITHUB_TOKEN` is the only secret and never reaches the client.
- **NFR-7 Licensing.** The code is MIT. Skill names, descriptions and linked content belong to their authors, and the footer says so.

## Acceptance criteria for any change

- The quality gates pass: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Every route in this document still renders, with GitHub stats and without them.
- A new or edited entry meets FR-1 to FR-4, and its install command matches the upstream README on the day it is written.

## Open questions

- **Usage measurement.** With no analytics, there is no evidence of which skills or features people use. Adding any measurement changes NFR-5.
- **Entry freshness.** Nothing checks that an install command still works after its upstream project changes.
