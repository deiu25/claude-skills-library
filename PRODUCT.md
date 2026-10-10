# Product

<!-- impeccable:product-schema 1 -->

> Drafted on 2026-10-10 from repository evidence: README, site copy, code. Not yet confirmed in an `/impeccable init` interview, so treat each line as observed fact rather than a brand decision. Requirements live in [PRD.md](PRD.md).

## Platform

web

## Users

- **Claude Code users extending their setup.** They arrive with a task ("I need a design skill", "how do I install this plugin?") and want to pick, install and invoke the right skill in minutes, without reading a dozen READMEs.
- **Agents and scripts.** They read `/llms.txt`, `/skills.json` and `/install-all.txt`, or a page pasted through "Copy for Claude".
- **Contributors.** They add a skill by opening a pull request with one typed data file.
- **Skill authors and teams (planned).** They keep private skills, publish or sell them, and sync what they have installed. [ROADMAP.md](ROADMAP.md) builds this in phases.

## Product Purpose

The library explains each curated Claude Code skill: what it does, when to reach for it, how to install and update it, and why it earns its place, alongside live GitHub stats. Success means a visitor goes from a task to a working, installed skill.

## Positioning

Curated entries, not scraped lists. Every entry is written by hand, with when-to-use guidance, exact install and update commands, and the reason it is included. The whole catalog also exports straight into Claude: as Markdown, JSON, `llms.txt`, or a prompt that installs everything.

## Operating Context

- Visitors come from Claude Code work. They copy a command into a terminal, or paste a prompt into Claude Code ("Copy for Claude", "Get all Skills").
- Install paths differ per skill: a plugin marketplace, a plugin, `npx skills`, or a manual copy.
- The site is English-only. Browsing, search, recommendations and exports work without an account.

## Capabilities and Constraints

- Browse, search, filter by category, multi-select, and share a selection by URL. Detail page per skill, a task-based recommender, a coverage report, and exports.
- The catalog needs no account, no database and no AI call at request time; accounts exist only for a user's own skills, selling and sync (planned, [ROADMAP.md](ROADMAP.md)). GitHub stats can be missing at any moment, and every surface must work without them.
- Content is the hand-written catalog in `src/data/skills/`. Skill names, descriptions and linked content belong to their authors.

## Brand Commitments

- Name: "Claude Skills Library".
- Description used in the site metadata: "A curated library of Claude Code skills: what each one does, when to use it, and how to install it."
- Dark-first, with a light mode.
- Footer line: "MIT licensed. Skill names and content belong to their authors."

## Evidence on Hand

- The catalog itself in `src/data/skills/`, and live repository stats from GitHub.
- Absent: testimonials, user counts, usage analytics, case studies, press. Future work must not fabricate any of them.

## Product Principles

1. **Curated over comprehensive.** An entry is included because it earns its place, not because it exists.
2. **Exact over approximate.** A command comes from upstream and runs as pasted; where no single command exists, the entry gives one plain instruction.
3. **Nothing to sign up for to browse.** The catalog is static pages. An account is only for keeping, selling or syncing your own skills.
4. **Readable by agents as well as people.** The home page, `/report`, every skill page and any selection on `/skills` export straight into an LLM.
5. **Accessible by default.** Contrast, keyboard use and motion preferences are requirements, not polish.

## Accessibility & Inclusion

WCAG AA contrast for text in both themes, full keyboard navigation, and support for reduced motion, reduced transparency and increased contrast.
