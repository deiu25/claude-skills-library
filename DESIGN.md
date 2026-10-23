---
name: Claude Skills Library
description: A curated library of Claude Code skills. Dark-first, zinc neutrals, one emerald accent.
colors:
  primary: "#3ecf8e" # the spec's required role name for `accent`; code uses `accent`
  background: "#09090b"
  surface: "#131316"
  surface-raised: "#1b1b1f"
  line: "#27272a"
  foreground: "#f4f4f5"
  muted: "#a1a1aa"
  faint: "#8b8b94"
  accent: "#3ecf8e"
  accent-soft: "#3ecf8e14"
  accent-strong: "#3ecf8e"
  accent-foreground: "#09090b"
  terminal-bg: "#0e0e11"
  terminal-fg: "#d4d4d8"
  background-light: "#fafafa"
  surface-light: "#ffffff"
  surface-raised-light: "#f4f4f5"
  line-light: "#e4e4e7"
  foreground-light: "#18181b"
  muted-light: "#52525b"
  faint-light: "#6b6b75"
  accent-light: "#15805c"
  accent-soft-light: "#15805c14"
  accent-strong-light: "#0e6f4d"
  accent-foreground-light: "#fafafa"
  terminal-bg-light: "#131316"
  line-high-contrast: "#71717a"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "60px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.06em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: "-0.05em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.33
  code:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  card: "14px"
  button: "10px"
  control: "8px"
  code: "6px"
  pill: "9999px"
spacing:
  page-x: "16px"
  page-x-wide: "24px"
  page-y: "48px"
  page-y-wide: "64px"
  grid-gap: "16px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.button}"
    padding: "0 20px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.button}"
  skill-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  skill-card-accent:
    backgroundColor: "{colors.accent-soft}"
    rounded: "{rounded.card}"
    padding: "24px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  chip-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-strong}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  terminal:
    backgroundColor: "{colors.terminal-bg}"
    textColor: "{colors.terminal-fg}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Claude Skills Library

The tokens above are normative. In code they live in `src/app/globals.css`, which stays the source of truth: change a value there first, then here. Plain keys are the dark theme, which is the default; `-light` keys are the light theme. Components reference the plain keys, and the CSS variables swap to the light values when `.dark` is absent from `<html>`.

## Overview

A quiet developer tool. Dark by default, zinc neutrals, one desaturated emerald accent, and Geist Mono for anything a visitor can type or copy. Structure comes from surface steps and 1px lines, not shadows; the only depth is translucent material on chrome that floats over content. Interaction follows Apple's lead: controls answer on pointer-down, motion settles like a critically damped spring without overshoot, and every effect has a fallback for reduced motion, reduced transparency and increased contrast.

**Key Characteristics:**

- Dark-first, with a complete light theme switched by a `.dark` class on `<html>`.
- One accent hue, used for actions, focus, selection and active states.
- Monospace for commands, slugs, skill names and code.
- Flat at rest. Translucent material only on the sticky header and floating panels.
- A 44px minimum hit target on buttons, inputs and the theme toggle.

## Colors

Zinc neutrals with a single emerald accent, locked site-wide.

### Primary

- **Emerald** (`primary` in this file, `accent` in code; #3ecf8e dark, #15805c light): primary buttons, focus rings, text selection, active chips, list bullets, the `$` prompt in terminal blocks.
- **Emerald Tint** (the accent at 8% alpha): fill of active chips and the accent skill card.
- **Text-Safe Emerald** (#3ecf8e dark, #0e6f4d light): accent-colored text, such as link hover and the active chip label.

### Neutral

- **Page** (#09090b dark, #fafafa light): the page background.
- **Surface** (#131316 dark, #ffffff light): cards, inputs, chips.
- **Raised Surface** (#1b1b1f dark, #f4f4f5 light): ghost-button hover fill, inline code.
- **Line** (#27272a dark, #e4e4e7 light): every border and divider. Under `prefers-contrast: more` it becomes #71717a in both themes.
- **Foreground** (#f4f4f5 dark, #18181b light): headings and primary text.
- **Muted** (#a1a1aa dark, #52525b light): body copy and secondary text.
- **Faint** (#8b8b94 dark, #6b6b75 light): metadata, labels, icons at rest, hover borders.
- **Terminal** (#0e0e11 dark, #131316 light, text #d4d4d8): command panels, dark in both themes.

### Named Rules

**The One Accent Rule.** Emerald is the only hue. A new state uses the accent, its tint or a neutral, never a second color.

**The Text-Safe Accent Rule.** In the light theme the plain accent reaches only 4.24:1 on its own tint, so accent-colored text on the tint (active chips, the accent card) uses Text-Safe Emerald. On plain surfaces the plain accent clears 4.5:1 and is used for icons; Text-Safe Emerald stays the default for accent-colored text.

**The Pinned Terminal Rule.** The terminal panel is dark in both themes and pins its own faint, muted and accent values through the `terminal` utility, so light-theme tokens never land on the dark panel.

## Typography

**Display Font:** Geist (with `ui-sans-serif, system-ui, sans-serif`), loaded through `next/font`
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (with `ui-monospace, monospace`)

**Character:** a neutral grotesque for reading, and a monospace that marks what you can type.

### Hierarchy

- **Display** (600, 36px on mobile, 48px from `sm`, 60px from `lg`; line-height 1.11 at 36px, 1 from 48px): the home hero headline only.
- **Headline** (600, 30px, 36px from `sm`): page titles. On a skill's own page the title is set in mono.
- **Title** (600, 20px to 30px): section headings.
- **Subtitle** (500, 18px): step titles. Skill card titles are mono 600 at 15px, 16px when featured.
- **Body** (400, 14px, 16px from `sm`, line-height 1.625): intros and descriptions. Prose on a skill page and on the legal pages is 15px. Line length: 42ch in the home hero, 50 to 60ch for intros, 65 to 70ch for prose.
- **Label** (400, 12px): stat labels and metadata.
- **Code** (Geist Mono 400, 13px): commands, usage items, inline code.

### Named Rules

**The Tracking-Follows-Size Rule.** Letter-spacing tightens as size grows, following Geist's own heading scale: -0.02em at 20px, -0.04em at 24 to 30px, -0.05em at 36px, -0.06em from 48px. Smaller headings use `tracking-tight`; body text keeps the default. Mono headings use `tracking-tight`, and small mono text stays at 0.

**The Mono-Means-Typeable Rule.** Monospace marks text a visitor can type or copy: commands, slugs, skill names, file names. It is never decoration.

## Layout

- Three container widths: 1280px for the home page and the skill grid, 896px for reading pages (skill detail, recommend, report, privacy, terms, settings), and 448px for the auth pages and the account-deletion confirmation, which pad 64px top and bottom, 96px from `sm`. Legal prose keeps a 70ch measure.
- Side gutters of 16px, 24px from `sm`. Inner pages (browse, skill, recommend, report) pad 48px top and bottom, 64px from `sm`; the home and 404 pages set their own section spacing.
- The skill grid has one column, two from `md` and three from `lg`, with 16px gaps.
- The home hero splits into two asymmetric columns from `lg` (1.1fr and 1fr); featured skills form an asymmetric bento below it.
- Header and footer frame every page.

## Elevation & Depth

Flat by default. Depth comes from three surface steps (page, surface, raised surface) and 1px lines. Shadows appear only on floating material.

### Shadow Vocabulary

- **Floating** (`box-shadow: 0 16px 40px -12px rgb(0 0 0 / 0.6)` dark, `0 12px 32px -12px rgb(24 24 27 / 0.22)` light), always with a 1px inset top highlight: the selection bar, its export panel and the account menu.

### Materials

- **Material:** the page color at 85% opacity behind a 20px blur at 180% saturation. Used by the sticky header, whose bottom hairline fades in over the first 48px of scroll.
- **Thick material:** the surface color at 78% opacity behind a 32px blur, with a 1px line border and the floating shadow. Used by floating panels.

### Named Rules

**The Flat-At-Rest Rule.** Cards and inputs never carry a shadow. Only material that floats over content does.

**The Solid Fallback Rule.** Under `prefers-reduced-transparency` or `prefers-contrast: more`, both materials become solid surfaces.

**The No-Nesting Rule.** Material never sits inside material. The header's `backdrop-filter` makes it the backdrop root, so a translucent panel inside it would show the page through without blurring it. A panel that opens from the header is solid Surface with the floating shadow.

## Shapes

Five radii, one job each: cards and panels 14px; buttons and the theme toggle 10px; inputs and small controls such as the icon copy button, command snippets and menu items 8px; inline code 6px; pills for chips, badges, dots and the account button, which carries the user's initial like an avatar. Every border is a 1px line. Active chips and the accent card border in emerald.

## Components

### Buttons

- **Shape:** gently rounded (10px), at least 44px tall, 20px side padding, weight 500.
- **Primary:** emerald fill with dark text in the dark theme and light text in the light theme. Hover brightens it by 8%.
- **Ghost:** transparent with a 1px line border. Hover raises the fill to Raised Surface and moves the border to Faint.
- **Press:** shrinks to 0.97 on pointer-down within 80ms and releases over 200ms.

### Chips

- **Style:** pill, 1px line border, Surface fill, Muted 13px text, about 34px tall. Hover moves the border to Faint and the text to Foreground.
- **State:** active chips take an emerald border, Emerald Tint fill and Text-Safe Emerald text. Used for category filters and tags.

### Cards / Containers

- **Corner Style:** 14px.
- **Background:** Surface; the accent variant uses Emerald Tint with an emerald border at 40%.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px line, Faint on hover.
- **Internal Padding:** 20px, 24px for featured cards.
- Skill cards lift 2px on hover and press to 0.98, shallower than buttons because they are larger.

### Inputs / Fields

- **Style:** 8px radius, 1px line border, Surface fill, at least 44px tall, 14px side padding, Muted placeholder.
- **Focus:** the border turns emerald. No glow.
- **Label and hint:** the label sits above the field (14px, weight 500, Foreground); a hint sits below it (12px Faint), tied to the input with `aria-describedby`.

### Forms and errors

- **One message per form,** between the last field and the submit button: a Surface box with a 1px line and 8px radius. Errors use `role="alert"` and a Foreground warning icon; success uses `role="status"` and an Emerald check. An error takes no second hue (The One Accent Rule).
- **Copy:** an error names the problem and the way out. Text from the URL is never shown: a `?error=` code maps to fixed copy.
- **Pending:** the submit button is disabled and its label says what is happening ("Signing in…").
- **Auth pages** are top-aligned, so a message appearing never moves the heading. "Continue with GitHub" and, on sign-in, "Sign in with a passkey" are full-width ghost buttons above the email form, separated by a 1px rule with "or with email" in 12px Faint.
- **A standing caution** (a warning that is there on load, not the result of an action) uses the same box with the Foreground warning icon and no live region.

### Settings

- **Sections:** the reading width (896px), divided by 1px lines. From `md`, the title (Title, 20px) and a one-line purpose in Muted sit in the left column (1fr) and the controls in the right (1.7fr); below `md` they stack.
- **State first:** a setting with an on/off state opens with it in Foreground at weight 500, "On" with the emerald check or "Off" with none, before any explanation.
- **Lists** (sessions, passkeys): rows inside one Surface box with a 1px line and 8px radius, divided by 1px lines; the row's own action is a 44px text button on the right that turns Raised Surface on hover. "This browser" marks the current session in Text-Safe Emerald.
- **One primary per state.** Every other action is ghost.
- **Destructive actions are never emerald:** the accent means "go ahead". Deleting the account is a ghost button, confirmed on its own page with a standing caution, and reached only through an emailed link.
- **Codes:** backup codes in a two-column mono grid inside a Surface box with a 1px line and 8px radius. A two-factor key shows as mono groups of four that never break apart, next to a copy button.
- **QR codes** are black on white in both themes, with their quiet zone, because some authenticator apps cannot read an inverted code.

### Skills

- **Risk badge:** a 12px pill that names the scan's highest severity in words, never by color alone. "No findings" takes Emerald Tint and Text-Safe Emerald; low, medium and high climb from a Line to a Foreground border and to weight 600; critical inverts to a Foreground fill with Page text. No badge or message says "safe".
- **Editor:** category and tags above a mono SKILL.md textarea, then Files, then the Check box (Surface, 1px line, 8px radius): the live risk badge, the frontmatter's state, and one row per finding with the rule, its file and line, and severity. Pressing a SKILL.md finding selects its line in the textarea.
- **Files:** a title with the count and size against the 1 MB limit, then the files in a Surface box (1px line, 8px radius) that scrolls past 22rem: one row per file with its mono path, "Executable" in Muted, "Binary, not scanned" and the size in Faint. Below it, ghost "Upload folder" and "Remove files" buttons, and a Muted line saying what the next save does with a folder chosen since the last one.
- **Lists and versions** follow the settings lists; the current version is marked in Text-Safe Emerald, and an old version opens read-only with its scan, its files and its SKILL.md in a terminal block. A skill's page and each version's page carry a ghost "Download .zip" beside the title. Deleting a skill is a ghost button that asks once more in place, with a standing caution. In the list, a published skill's meta line starts with "Public" or "Unlisted" in Text-Safe Emerald.
- **Visibility:** a settings section. State first: "Published, public" or "Published, unlisted" with the emerald check and the page's mono address below, or "Private". Then the three choices as radio rows in one Surface box (1px line, 8px radius, divided by 1px lines), each a 14px label over a 12px Faint hint, and a primary "Save visibility" enabled only once the choice differs. When publishing is not possible yet (no username, a critical finding), the unlisted and public rows are disabled and a standing caution says why.

### Community

What users publish lives apart from the catalog and says so.

- **Community label:** a pill with a 1px line, 12px Muted text and the Phosphor `UsersThree` icon, beside a page's title, never above it. `/community` needs none: its title is the label.
- **Cards:** the skill card's shape without stats: the mono name and the category pill, the description clamped to three lines, then "by <handle> · <date>" in 12px Faint, the handle mono and Muted. Dates are absolute ("23 Oct 2026"), because the pages are cached for hours.
- **`/community`:** the 1280px grid page: the title, a one-paragraph intro that says nobody reviews these skills, then the search field, the category chips (only when more than one category is present) and the grid. Its empty state is the dashboard's: icon, title, one sentence, a ghost button.
- **Profile (`/u/<handle>`):** the mono handle with the Community label, the bio in Muted, the count in 12px mono Faint, then the cards.
- **Skill page (`/u/<handle>/<name>`):** the 896px reading page. The mono title with the category pill and the Community label; the description at 18px; a meta row with the author (a link only when the skill is public), the version and date, and the risk badge. Then a standing caution, Install (a ghost "Download .zip" beside the title, and the real curl and unzip command in a terminal block), Scan and Files in Surface boxes, SKILL.md as written in a terminal block (real file content, as the Terminal Block rule asks, with bidirectional controls written out as `[U+202E]`), and a footer with the tags and, on a public skill, "Propose it for the curated catalog". An author's text is never rendered as Markdown: the page shows what Claude reads.

### Moderation

- **Report links:** "Report this skill" and "Report this profile" are 14px Muted links with the Phosphor `Flag` icon at 14px, 44px tall: on a skill's page in its footer, before "Propose it for the curated catalog"; on a profile below the grid, above a 1px line. They do not prefetch, so a Community page still sends nothing after load.
- **Report page (`/dashboard/report`):** the 448px auth width, like the account-deletion confirmation. The title "Report a skill" or "Report a profile" and a line naming what is reported in mono; then the reasons as radio rows in one Surface box (1px line, 8px radius, divided by 1px lines), a textarea, the good-faith checkbox, and a primary "Send report". Success replaces the form with the success message and a ghost "Back to the page". Signed out, a standing caution says to sign in or write to the contact address.
- **Admin page (`/dashboard/admin`):** the settings layout: Reports, Take down, Suspended accounts. Each report opens with its reason as a 14px heading, a 12px Faint line naming the target (mono, linked while shown) and its sender, and the sender's words as text in a Surface box. Its decision is radio rows with a 12px Faint hint each; removing or suspending adds the ground as two radio rows and a "Reason" textarea. Every decision button is ghost, because removing and suspending are destructive. Suspended accounts follow the settings lists, with "Lift suspension" as the row action.
- **A removed skill** shows "Removed from the site" first in its Visibility section, then the reason the owner was given, in Muted.

### Menus

- **Pattern:** a disclosure. A button with `aria-expanded` and `aria-controls` opens a panel below it, aligned to its right edge. Not `role="menu"`: the items are plain links and buttons reached with Tab.
- **Panel:** solid Surface, 1px line, 14px radius, the floating shadow (The No-Nesting Rule), 6px padding. A 1px line separates who is signed in from the actions.
- **Items:** at least 44px tall, 8px radius, 14px Foreground, Raised Surface on hover.
- **Motion:** opens with a 200ms fade and a scale from 0.95, on `--ease-out-quint`, through `@starting-style`; closes at once. Escape closes it and returns focus to its button; a press outside, or focus leaving it, closes it too.
- **Account button:** a 44px circle on Raised Surface with a 1px line and the user's initial (14px, weight 600). An initial, never a GitHub avatar: loading one would send every page view to a third party.

### Navigation

- A sticky header on thin material: the mono wordmark on the left, then Browse skills, Community (from `md`, once sign-up opens), Recommend and Report (from `sm`), the GitHub source link, the theme toggle and the account control. The current section carries `aria-current`.
- **Account control:** a "Sign in" link while sign-up is open, or the account button in a browser that has signed in. Its 44px slot is reserved before hydration, so the row never shifts. While sign-up is open, the GitHub link shows only from `sm`, so the row fits 375px.
- **Footer:** the licence line, the operator's identification in 12px Faint, and links at least 44px tall.

### Terminal Block

- A fixed dark panel with a mono title bar and a copy button, for real commands and real file content only, never a staged transcript.

### Focus

- Every focusable element except text inputs shows a 2px emerald outline offset by 2px on `:focus-visible`. Inputs mark focus with an emerald border instead.

## Do's and Don'ts

### Do:

- **Do** use the token utilities (`bg-surface`, `text-muted`, `border-line`, `text-accent-strong`). Components hold no raw hex; the Open Graph image is the one exception, because it renders outside the stylesheet. A QR code uses plain black and white, not the theme.
- **Do** put custom hover CSS inside `@media (hover: hover)`, as the utilities in `globals.css` do, so states don't stick after a tap.
- **Do** transition the individual `scale` and `translate` properties, as the `press` utility does. Tailwind v4 moves elements with those properties, not with `transform`.
- **Do** wrap entrance animation in `Reveal`, which honours reduced motion and stays visible without JavaScript.
- **Do** use Phosphor icons: 12 to 16px beside text, 18 to 22px in controls and the header, 36 to 40px in empty states; `aria-hidden` when decorative.
- **Do** give every new control a 44px hit area: its own size, or a pseudo-element halo for a small icon button.

### Don't:

- **Don't** add a second accent color.
- **Don't** set accent-colored text in the plain accent on the Emerald Tint; use Text-Safe Emerald.
- **Don't** give a resting card a shadow.
- **Don't** introduce a sixth radius.
- **Don't** put `.press` on small icon targets: the shrink takes their hit-area halo with it.
