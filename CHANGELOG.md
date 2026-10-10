# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog 2.0.0](https://keepachangelog.com/en/2.0.0/). The site deploys continuously from `main` and has no version numbers, so changes are kept as dated entries under Unreleased, newest first.

## [Unreleased]

### 2026-10-10

#### Added

- Contributor guide, security policy, runbook, and project documentation for people and coding agents.

#### Changed

- Controls respond on press: buttons, chips and cards shrink, other links and buttons dim, and hover styles apply only where a pointer can hover.
- The selection bar and its export panel move on springs that can be interrupted, with a cross-fade under reduced motion.
- The header and the selection bar are translucent, with solid fallbacks for reduced transparency and increased contrast. The header's bottom line appears only once content scrolls under it.
- Display headings follow Geist's own letter-spacing scale.

### 2026-06-21

#### Changed

- The home page hero shows a working "Install the whole library" panel instead of a static terminal mock: copy the install-all prompt or the library as Markdown, or open the raw endpoints.

### 2026-06-20

#### Added

- "Get all Skills" on `/report`, and `/install-all.txt`: a prompt that makes Claude Code install the whole catalog, asking for global or project scope and skipping what is already installed.
- 45 skills and resources, and the Graphify skill.
- "Copy for Claude" on skill pages copies a compact Markdown summary of the entry.
- Skill pages show how to update each skill and a "Commands & flags" quick reference.

### 2026-06-18

#### Added

- The Impeccable skill.

#### Fixed

- Accessibility pass: a text-safe accent color raises the light-theme active chip to 5.33:1 contrast, select toggles and copy buttons get 44px tap targets, and sections no longer stay blank when JavaScript is off.

### 2026-06-16

#### Added

- The GSD Core skill.

### 2026-06-14

#### Added

- `/report`: a coverage map of the library and exports as Markdown, cheat sheet or JSON.
- `/recommend`: describe a task and get matching skills, ranked in the browser.
- `/skills.json` and `/llms.txt` for tools and agents.
- Multi-select on `/skills`, with an export bar, a shareable `?sel=` link and Select all.
- 21 skills.

#### Changed

- The skill grid and the featured skills are ordered by GitHub stars.

#### Removed

- The tailwind-globals-patterns skill.

#### Fixed

- Contrast and list-semantics issues found by Lighthouse; dark-theme secondary text now meets WCAG AA.
- Selecting skills no longer flashes the loading skeleton or loses the selection.

### 2026-06-12

#### Added

- First release: a landing page, a searchable directory and a page per skill, with live GitHub stats refreshed every 6 hours, 12 skills, and a dark-first theme with a light mode.

[Unreleased]: https://github.com/deiu25/claude-skills-library/commits/main
