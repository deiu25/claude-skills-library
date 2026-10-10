---
paths:
  - "src/components/**"
  - "src/app/**/*.tsx"
  - "src/app/globals.css"
---

# UI work

DESIGN.md (repo root) is the visual spec, and its tokens mirror `src/app/globals.css`. Read the section you are touching before you change how something looks.

- Style with token utilities: `bg-surface`, `text-muted`, `border-line`, `bg-accent`, `text-accent-strong`. No raw hex outside `opengraph-image.tsx`.
- On the accent tint (`bg-accent-soft`), accent-colored text uses `text-accent-strong`: `text-accent` falls below AA there in the light theme.
- Radii: 14px cards and panels, 10px buttons, 8px inputs and small controls, 6px inline code, pills for chips. No new radius.
- Reuse the utilities in `globals.css` before writing new styles: `card`, `btn btn-primary`, `btn btn-ghost`, `chip` and `chip-active`, `input-base`, `terminal`, `material`, `material-thick`, `press`.
- Tailwind v4 moves elements with the `scale` and `translate` properties. Transition those, as `press` does, never `transform`.
- Hover CSS written by hand goes inside `@media (hover: hover)`.
- Entrance animation goes through `Reveal`. Motion settles without overshoot: CSS uses `--ease-out-quint`, and Motion springs are critically damped.
- Every page keeps `SiteHeader`, `<main id="main">` and `SiteFooter`. New controls get a 44px hit area (their own size, or a pseudo-element halo for small icon buttons); decorative icons get `aria-hidden`.
- Before calling UI work done, check both themes and a 375px-wide viewport.
