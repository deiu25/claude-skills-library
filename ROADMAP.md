# Roadmap: accounts, user skills, marketplace and personal libraries

| | |
|---|---|
| Owner | Badulescu Andrei ([@deiu25](https://github.com/deiu25)) |
| Decided | 2026-10-10 |
| Next phase | P1 |

The curated catalog stays as it is: static, hand-written, reviewed in git. Around it the site gains:
- accounts;
- private skills that users upload;
- a marketplace where authors present and sell skills;
- a personal library of what each user saved, installed globally and installed per project.

This file holds the decisions, the target design, the rules every merge keeps, and the phases. Each phase is one Claude Code session.

## Running a phase

Paste into a new Claude Code session in this repository:

> Read AGENTS.md and ROADMAP.md. Implement only the first phase whose status is `todo`, on a branch `feat/<phase-slug>`. Before calling a Better Auth, Drizzle, Neon or Stripe API, read its current docs; for Next.js, read the bundled docs. Stop when the phase's "Done when" passes, set its status to `done` in ROADMAP.md, and deploy it the way RUNBOOK.md describes.

**Owner** lines name what only the owner can do: accounts, billing, DNS and secrets. A session stops and asks when one of them is missing.

## Status

| Phase | Scope | Status |
|---|---|---|
| P0 | Decisions and docs | done |
| P1 | Database and email/password auth, sign-up closed | done |
| P2 | Header, GitHub sign-in, legal pages, static guards | todo |
| P3 | Account security and data | todo |
| P4 | Own skills (SKILL.md) and security scan | todo |
| P5 | Skill files | todo |
| P6 | Showcase and profiles | todo |
| P7 | Moderation | todo |
| P8 | Sellers (Stripe test mode) | todo |
| P9 | Checkout and entitlements (test mode) | todo |
| P10 | Library and projects | todo |
| P11 | API keys and the sync CLI | todo |
| P12 | CLI pull and update detection | todo |
| P13 | Payments go-live | todo |
| P14 | Reviews and public stacks | todo |
| P15 | Teams | todo |

The order follows the owner's priorities: accounts, then private skills, then presenting and selling, then the lists. P10–P12 need P1 to P5, so they can move ahead of P6–P9. The exception is P12's pull of bought skills, which needs P9. P13 waits for the paperwork, not for P10–P12.

## Decisions

| Topic | Decision |
|---|---|
| Auth | Better Auth, stored in our own database. It covers email and password with verification and reset, GitHub sign-in, TOTP two-factor, passkeys, API keys, admin and organizations |
| Database | Neon Postgres through the Vercel Marketplace, with Drizzle ORM and a `pg` pool registered with `attachDatabasePool`, for interactive transactions. Each preview gets its own Neon branch. Neon's Vercel integration cuts it from production and offers no other parent; the owner accepted that on 2026-10-11 while sign-up is invite-only, and P7 moves previews to a seeded `dev` branch before sign-up opens |
| Email | Resend, with templates as plain TypeScript strings, sent inside `after()` |
| Skill files | Postgres `bytea`, at most 1 MB and 200 files per version. Move to a private Vercel Blob store only if that cap is outgrown |
| Selling | Stripe Connect: Express sellers (Accounts v2), Checkout with destination charges and `application_fee_amount`, and one platform webhook. Built in test mode; going live is its own phase |
| Installed lists | An `npx` CLI authenticated with an API key, plus manual marks in the UI |
| Rate limits | Better Auth's limiter with `storage: "database"`. App endpoints use Upstash Ratelimit and fail closed in production |
| Catalog | Unchanged and curated. What users publish lives in a separate, labelled Community area, and never reaches `/skills.json`, `/llms.txt` or `/install-all.txt` |
| Anonymous visitors | Catalog pages stay prerendered, set no cookie and call no API; Next.js route prefetches are the only requests after load. The header's account control loads only when a `localStorage` flag says the visitor has signed in before |

## Target design

### Code layout

- **`src/lib/db/`:** the client, the schema and the generated auth schema. `drizzle.config.ts` sits at the root and migrations go in `drizzle/`.
- **`src/lib/auth/`:** the Better Auth config, the React client and `session.ts`.
  - `session.ts` is the data access layer: `getSession` (React `cache`) and `requireUser()`, which redirects to sign-in.
- **`src/lib/<domain>/{queries,actions,schemas}.ts`:** one set per domain (skills, library, market, sync).
- **`server-only`:**
  - `queries.ts` and `session.ts` import it.
  - The auth config, `db/` and the schema files must not, because the `auth` CLI and drizzle-kit load them in plain Node.
  - Neither may `src/lib/github.ts`, because its `formatCount` runs in client components.
- **`src/lib/skills/access.ts`:** `canRead(user, skill)`, the one function teams (P15) will change.
- **`src/components/<domain>/`:** the components.
- **No `proxy.ts`.** Every page, action and route handler calls `requireUser()` and checks ownership.
- **Action order:** authorize, validate with zod, mutate, invalidate, return `{ ok: true, … } | { ok: false, error }`.

### Routes

| Path | Rendering |
|---|---|
| Every route that exists today | Unchanged: static or ISR, with `/opengraph-image` rendered on demand. The five catalog pages add `export const dynamic = "error"` in P2 |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/two-factor` | In an `(auth)` route group. Static forms that call `/api/auth` from the browser; `/reset-password` renders per request because it reads the token |
| `/dashboard/**` | Dynamic: skills, library, projects, purchases, sales, settings, admin, org |
| `/community`, `/u/[handle]`, `/u/[handle]/[slug]`, `/u/[handle]/stacks/[slug]` | ISR. `generateStaticParams` returns `[]` and writes call `revalidatePath`. A database error renders an empty state. While sign-up is closed, these routes return `notFound()` |
| `/privacy`, `/terms`, `/terms/marketplace` | Static |
| `/api/auth/[...all]`, `/api/stripe/webhook`, `/api/v1/sync`, `/api/v1/library`, `/api/skills/[id]/download`, `/api/me/export` | Dynamic route handlers |

### Reuse

- **`toInstallAllPrompt`** (`src/lib/report.ts`) accepts any `Skill[]`. Widen it to `Pick<Skill, "name" | "install" | "repo">[]` to export lists, projects and stacks.
- **`getRepoStats`** (`src/lib/github.ts`) is the pattern for GitHub calls: `next: { revalidate }`, `null` on any failure, and `GITHUB_TOKEN` when it is set.
- **`src/components/Markdown.tsx`** renders a user's SKILL.md without raw HTML.
- **`SkillSearch` and `SelectionBar`** already track a selection (`sel`), which becomes "Save selected".
- **`CATEGORY_LABELS`** (`src/data/types.ts`) supplies the Community categories. The slug pattern in `src/lib/selection.ts` (`SLUG_RE`, not exported yet) validates slugs.
- **A catalog entry's `repo` and `repoPath`** match a synced install to that entry.

### Data model

App ids are `uuid`, keys into the auth tables are `text`, times are `timestamptz`, and enums are `text` with a `CHECK`.

| Phase | Tables |
|---|---|
| P1 | Generated by Better Auth: `user`, `session`, `account`, `verification`, `rateLimit` |
| P3 | Generated: `user.username`, `user.displayUsername`, `twoFactor`, `passkey`. Added through `additionalFields`: `user.bio` |
| P4 | `skill`: owner → user `SET NULL`, slug, name, description, category, tags, visibility (`private`, `unlisted`, `public`), status (`draft`, `published`, `removed`); unique (owner, slug).<br>`skill_version`: skill `CASCADE`, version, skill_md, frontmatter `jsonb`, content_hash, risk, findings `jsonb`; unique (skill, version) |
| P5 | `skill_file`: version `CASCADE`, path, content `bytea`, executable; primary key (version, path); a `CHECK` that the path is relative and contains no `..` |
| P7 | `report`: reporter `SET NULL`, target type and id, reason, status (`open`, `actioned`, `dismissed`), resolved by; one open report per reporter and target. The admin plugin adds `user.role`, `banned`, `banReason`, `banExpires` and `session.impersonatedBy` |
| P8 | `seller_account`: user (primary key), Stripe account id (unique), ready, country. `skill` gains `price_cents` (`CHECK > 0`) and `currency` |
| P9 | `purchase`: buyer `SET NULL`, skill `SET NULL`, version, subtotal, tax, application fee, currency, buyer country, Checkout session id (unique), payment intent id (unique), status (`paid`, `refunded`, `disputed`, `lost`); index (buyer, skill).<br>A `paid` row is the entitlement. Fulfilment runs `INSERT … ON CONFLICT (checkout_session_id) DO NOTHING RETURNING id`, and the receipt goes out only when a row comes back.<br>A repeat purchase is refused when checkout is created, never by a constraint the webhook could hit |
| P10 | `project`: owner `CASCADE`, slug, repo hint, public; unique (owner, slug).<br>`library_entry`: user `CASCADE`, kind (`catalog`, `community`, `github`, `web`, `local`), catalog slug, skill, url, label, note; a `CHECK` for exactly one reference per kind; `UNIQUE NULLS NOT DISTINCT`. Own and bought skills are read from `skill` and `purchase`, never copied in.<br>`installation`: user `CASCADE`, scope (`global`, `project`), project `CASCADE`, kind (`skill`, `plugin`), name, source, skill path, catalog slug, skill, hash, hash kind (`git-tree`, `sha256`, `version`), version, origin (`cli`, `manual`), last seen; `CHECK ((scope = 'project') = (project_id IS NOT NULL))`; `UNIQUE NULLS NOT DISTINCT` (user, scope, project, kind, name) |
| P11 | Generated: `apikey` |
| P14 | `review`: skill `CASCADE`, author `SET NULL`, purchase (unique), rating (`CHECK` 1–5), body, hidden |
| P15 | Generated: `organization`, `member`, `invitation`, `session.activeOrganizationId`. `skill` and `project` gain a nullable `organization_id` |

**Account deletion.** It cascades to everything the user owns.
- Skills that never sold are deleted.
- Sold skills become `removed`, so buyers keep their downloads.
- Purchases stay, with the buyer set to null, so the financial record outlives the account.

P3 builds the deletion; P9 extends it once purchases exist.

## Merge rules

Every phase merges to `main`, which is production, so each one keeps these rules:

1. **Sign-up stays closed until the owner launches.**
   - The switch is `ACCOUNTS_OPEN=false` plus `ACCOUNTS_ALLOWLIST`.
   - Both are enforced in `databaseHooks.user.create.before`, which covers every sign-in method.
2. **Migrations only add.**
   - A column is dropped one phase after the code stops using it.
   - The Vercel build command runs `npm run db:migrate` before `next build`, so Neon preview branching stays on.
   - A failed migration fails the deploy and is never skipped.
   - An Instant Rollback does not undo a schema change.
3. **`next build` never needs the database.** It passes with no database variables set, and any read at build time catches its own errors.
4. **Catalog routes keep their static guards.**
   - Catalog pages keep `dynamic = "error"`, and catalog endpoints keep `force-static`.
   - Routes under `/api/` and `/dashboard/` export neither `revalidate` nor `dynamic`. In Next.js 16.2, a `force-static` route handler receives empty request headers, so an API key would vanish.
5. **Community data never reaches the machine endpoints.**
6. **Live Stripe keys arrive only in P13,** behind `PAYMENTS_LIVE`.
7. **A phase is done when:**
   - the gates pass: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and from P2 on, `npm run test:e2e`;
   - every doc the phase contradicts is updated;
   - a visitor-facing change has a CHANGELOG line;
   - its status here reads `done`.

## Phases

### P0 — Decisions and docs
- **Ships:** this file; PRD.md's scope, goals and NFRs; AGENTS.md's boundaries; pointers in ARCHITECTURE.md, PRODUCT.md and README.md.
- **Owner:**
  - Start the paperwork that P13 waits for: an accountant, and a Stripe account with Connect in test mode.
  - Choose the production domain.

### P1 — Database and email/password auth, sign-up closed
- **Ships:**
  - Neon and Drizzle.
  - Better Auth with `emailAndPassword`, required email verification, password reset, and the database rate limit.
  - The generated auth schema and the first migration.
  - `/api/auth/[...all]` through `toNextJsHandler`, with `nextCookies()` last.
  - The `(auth)` pages, and a bare `/dashboard` behind `requireUser()`.
  - `src/lib/email.ts` and the allowlist hook.
  - A `vercel.json` build command that runs the migrations before `next build`, skipping them only when `DATABASE_URL_UNPOOLED` is unset.
  - RUNBOOK.md: the variable table and the database rollback note.
  - `.env.example` with variable names only, tracked through a `!.env.example` exception in `.gitignore`. The file is ignored today, so the README's copy step fails on a fresh clone.
- **Owner:**
  - `vercel integration add neon`, connected to Production and Preview only and without Neon Auth, with preview branching and automatic cleanup.
  - Before merging, set `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `ACCOUNTS_OPEN=false` and `ACCOUNTS_ALLOWLIST` in Production and Preview.
  - Until a domain is verified, Resend's test sender reaches only the owner's own address. That is enough while sign-up is allowlisted.
- **Done when:**
  - `next build` passes with no database variables set.
  - On a preview, an allowlisted address can sign up, verify, sign in and reset its password, and any other address is refused.
  - `curl -sI` on `/` shows no `set-cookie`.
  - ARCHITECTURE.md's invariants describe the new backend.

### P2 — Header, GitHub sign-in, legal pages, static guards
- **Ships:**
  - `AccountMenu`:
    - The "Sign in" link shows only with `NEXT_PUBLIC_ACCOUNTS_OPEN`.
    - The signed-in part loads through `next/dynamic`, and only when the flag is set.
    - The flag is set after sign-in and cleared on sign-out or when the session comes back null.
  - The GitHub provider, with `?error=` messages on the sign-in page, and `account.encryptOAuthTokens` so GitHub tokens are not stored in plain text.
  - `/privacy` and `/terms`, with the owner's legal identity (never invented).
  - `dynamic = "error"` on the five catalog pages.
  - DESIGN.md: rules for form fields, errors and menus, and an updated header line.
  - Playwright, run with `npm run test:e2e`.
- **Owner:** two GitHub OAuth apps, one for localhost and one for production (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`). GitHub callback URLs cannot be wildcards, so previews use email and password.
- **Done when:**
  - An e2e test shows that anonymous catalog pages set no cookie and make no `/api/auth` request.
  - Sign-in, the dashboard and sign-out work.
  - The build output still lists the catalog routes as static or ISR.

### P3 — Account security and data
- **Ships:**
  - The `username` plugin, with a reserved list of handles, and a profile.
  - Linked accounts, active sessions with revoke, and email change.
  - `twoFactor`: TOTP and backup codes, plus `allowPasswordless` for users who sign in only with GitHub.
  - Fixes deferred from the P1 security review:
    - A password set before the email is verified must not survive verification. Today anyone can sign up as an allowlisted address with their own password, and it works once the owner opens the link.
    - Decide whether the verification link should sign in, since it signs in whoever opens it.
    - Pad `/request-password-reset` to a fixed response time; an unknown address answers about a millisecond faster.
  - `@better-auth/passkey`.
  - Account deletion, confirmed by email.
  - `/api/me/export`.
- **Owner:** the production domain is live. Passkeys and OAuth bind to it, and moving domains later breaks every passkey.
- **Done when:**
  - A password sign-in asks for the TOTP code.
  - A backup code works exactly once.
  - Passkey sign-in works on the real domain.
  - Deletion removes the user's rows.
  - The export downloads.

### P4 — Own skills (SKILL.md) and security scan
- **Ships:**
  - `skill` and `skill_version`.
  - `src/lib/skills/{schemas,scan,access}.ts`, with tests:
    - frontmatter checked with zod: a name of up to 64 characters from `[a-z0-9-]`, and a description of up to 1024;
    - scan v1, which flags hidden or bidirectional Unicode, `curl | sh`, a credential read next to a network call, base64 execution, broad `allowed-tools` and destructive commands.
  - Before writing scan rules, search GitHub for existing agent-skill scanners and rule sets to adopt.
  - Dashboard pages to create, edit and delete skills; an editor with live validation; versions; a risk badge.
  - The Upstash rate-limit module for app actions.
  - The slug `stacks` is reserved.
- **Owner:** an Upstash Redis database from the Marketplace.
- **Done when:**
  - The scan flags every fixture.
  - Another user gets a 404 for a private skill.
  - An action replayed with someone else's id fails.

### P5 — Skill files
- **Ships:**
  - `skill_file`.
  - Folder upload through a Server Action:
    - `experimental.serverActions.bodySizeLimit: "2mb"`;
    - at most 1 MB and 200 files;
    - every path validated.
  - The scan over every file.
  - An owner-only zip download, built with `fflate` and sent with `Cache-Control: private, no-store`.
  - `content_hash`, computed the way the `skills` CLI computes it (verify the algorithm).
- **Done when:**
  - A nested folder survives upload and download unchanged.
  - `../x` is refused.
  - The hash matches a real `skills-lock.json` entry.

### P6 — Showcase and profiles
- **Ships:**
  - `/community`, with search, filters and Community labels.
  - `/u/[handle]`.
  - `/u/[handle]/[slug]`: the long description, the file list, the risk badge, install steps, metadata and Open Graph tags.
  - Public and unlisted visibility.
  - A scan gate on publishing. A critical finding blocks publishing, never a private skill.
  - Public listings in the sitemap, with database errors caught.
  - A "Propose to the catalog" link that opens a prefilled `suggest-skill.yml` issue.
- **Done when:**
  - An unpublished listing returns 404.
  - Listing pages are served as ISR.
  - `next build` passes with the database unreachable.

### P7 — Moderation
- **Ships:**
  - What the EU Digital Services Act asks of a hosting service:
    - a `report` table and a report form;
    - a statement of reasons with every removal;
    - an abuse contact.
  - The `admin` plugin with `adminUserIds`, and `/dashboard/admin` to unlist and ban.
  - Preview databases branched from a seeded `dev` branch instead of production, for example with `neondatabase/create-branch-action`.
- **Done when:**
  - A report reaches the admin.
  - A removal sends its reason.
  - A banned user cannot sign in.
- Sign-up can open from this point (`ACCOUNTS_OPEN=true`).

### P8 — Sellers (Stripe test mode)
- **Ships:**
  - `src/lib/stripe.ts`.
  - Express onboarding with Accounts v2, falling back to v1 `controller` settings.
  - Return and refresh routes, and the readiness check.
  - `seller_account`, prices in EUR, and the Express dashboard link.
  - Draft marketplace terms.
- **Owner:**
  - The Connect platform profile and a test `STRIPE_SECRET_KEY`.
  - The fee, once the accountant has advised.
- **Done when:** a test seller shows as ready and a price saves.

### P9 — Checkout and entitlements (test mode)
- **Ships:**
  - A Buy button that checks ownership first.
  - Checkout with a destination charge and the application fee, `consent_collection`, and the waiver of the EU withdrawal right for digital content.
  - `/api/stripe/webhook`:
    - reads the raw `req.text()` into `constructEvent`;
    - handles `checkout.session.completed`, `charge.refunded` and `charge.dispute.*`.
  - One idempotent `fulfillCheckout(sessionId)`, called by the webhook and by the success page.
  - `purchase`.
  - The buyer's Purchased page and download, and a receipt email.
- **Owner:** the webhook endpoint and `STRIPE_WEBHOOK_SECRET`; `stripe listen` when testing locally.
- **Done when:**
  - A test card makes exactly one purchase and one email, even when Stripe resends the event.
  - A non-buyer gets 403.
  - The checkout e2e test passes.

### P10 — Library and projects
- **Ships:**
  - `project`, `library_entry` and `installation`.
  - Save buttons on catalog pages and in the selection bar. They are client-only, so the pages stay static.
  - Adding a skill from a GitHub URL, with its frontmatter fetched the way `getRepoStats` fetches, or from any web URL.
  - Projects and manual install marks.
  - The Saved, Global and Projects views.
  - Export through the widened `toInstallAllPrompt`, where a GitHub URL becomes `npx skills add <url>`.
- **Done when:**
  - Saving keeps catalog pages static.
  - An entry whose catalog slug was removed still renders.
  - The export copies.

### P11 — API keys and the sync CLI
- **Ships:**
  - `@better-auth/api-key`, with an explicit rate limit. Its default was reported as 10 requests per key per day, which would break the CLI; confirm it in the plugin's docs.
  - A keys page that shows each key once.
  - `POST /api/v1/sync`, validated with zod. It replaces the snapshot for one scope or project, and touches only rows with `origin = 'cli'`.
  - `GET /api/v1/library`.
  - `cli/`: a zero-dependency ESM package for Node 20+, with `login` and `sync [--project <name>] [--dry-run]`.
- **What the CLI reads:**
  - `~/.claude/skills`, skipping `learned/`, `synced/`, hidden folders, `*-workspace` folders and nested SKILL.md files;
  - `~/.agents/.skill-lock.json`;
  - `~/.claude/plugins/installed_plugins.json`, through each `installPath` and the marketplace source;
  - the project's `.claude/skills` and `skills-lock.json`.
- **How the CLI behaves:**
  - It stores its config with mode 0600.
  - It names a project by its git remote `owner/repo`, or by the folder name.
  - It never sends an absolute path.
  - It matches catalog entries by `repo` and `repoPath`.
  - It does not install a bare `sync` command.
- **Done when:**
  - The `--dry-run` payload contains no home path.
  - Two syncs in a row leave the same rows.
  - A revoked key gets 401.
  - 20 syncs in one day succeed.

### P12 — CLI pull and update detection
- **Ships:**
  - `pull <handle>/<slug>` for own and bought skills, and `check`.
  - "Outdated" badges:
    - For global `npx skills` installs, `skillFolderHash` appears to be the GitHub tree SHA of the skill folder (confirm in the `skills` CLI source). One recursive tree call per repository, cached for an hour with `GITHUB_TOKEN`, covers them all.
    - Plugins compare `version` with their marketplace.
    - Platform skills compare `content_hash`.
    - `npx skills` installs inside projects show "unknown".
- **Owner:** an npm account with two-factor, then `npm publish` from `cli/`.
- **Done when:**
  - A stale lock entry shows as outdated.
  - `pull` installs into `~/.claude/skills/<slug>`.

### P13 — Payments go-live
Any time after P9, once the paperwork is done.
- **Ships:**
  - Refund and dispute handlers that revoke access.
  - The seller's sales page and the fee setting.
  - `automatic_tax`, as the accountant decides.
  - The final legal texts:
    - marketplace terms;
    - a seller agreement covering the licence granted, the fact that plaintext cannot be copy-protected, and takedowns;
    - the refund and withdrawal policy.
  - The `PAYMENTS_LIVE` flag.
- **Owner:**
  - The accountant's sign-off and any registrations.
  - A paid Vercel plan, because Hobby is for non-commercial use.
  - Live keys and the live webhook.
- **Done when:**
  - A refund in the Stripe Dashboard turns the download into a 403.
  - A live €1 purchase works end to end.

### P14 — Reviews and public stacks
- **Ships:**
  - `review`, from verified buyers only, one per purchase.
  - Ratings on listings and in Community, revalidated on each write.
  - A project published as `/u/[handle]/stacks/[slug]`, with an install-all prompt.
- **Done when:**
  - A non-buyer is refused.
  - A buyer can review only once.
  - A stack page renders and its prompt copies.

### P15 — Teams
- **Ships:**
  - The `organization` plugin, email invitations and roles.
  - `organization_id` on `skill` and `project`.
  - `canRead` extended to teams.
  - An organization library view.
- **Done when:**
  - A member can read the organization's private skill.
  - A removed member is refused on their next request.

## Verification

Every phase checks the following, on top of its "Done when":

- The gates in merge rule 7 pass.
- The build output still lists the catalog routes as static or ISR.
- `curl -sI` against `/` and `/skills` shows no `set-cookie`. On a protected preview, send the deployment-protection bypass token.
- The phase's flows run on the Vercel preview, on its own Neon branch.
- After the merge, the production deployment reaches READY and a smoke check passes.

## Risks

- **Tax.** EU VAT rules presume that a platform selling electronic services is itself the supplier (Article 9a, Implementing Regulation 282/2011). That points to VAT on the full price for EU consumers, paid through OSS, and to long record keeping. P13 needs an accountant's sign-off, and the fee waits for that advice.
- **Stripe reach.** From a platform in the EEA, cross-border payouts reach sellers only in the US, UK, EEA, Canada and Switzerland, and only without `on_behalf_of`. Stripe acting as merchant of record does not support Connect. P8 confirms both.
- **Domain.** Passkeys, OAuth callbacks and the email sender all bind to it. Choose it before P3.
- **Supply chain.** A bought skill runs code on the buyer's machine. The scan, reports and a clear disclaimer reduce the risk. Plaintext cannot be copy-protected, and the seller terms must say so.
- **Packages (better-auth 1.7, checked 2026-10-10).**
  - The CLI is the `auth` package; `@better-auth/cli` is stale.
  - Generate the schema with `npx auth@latest generate --config src/lib/auth/auth.ts --output src/lib/db/auth-schema.ts`, then run drizzle-kit.
  - Passkeys and API keys ship as separate `@better-auth/*` packages.
  - Migrations run through `scripts/migrate.mjs` on `DATABASE_URL_UNPOOLED`: `drizzle-kit migrate` 0.31 exits 1 without printing the error (checked in P1).
  - The auth base URL comes from Vercel's system variables, so `BETTER_AUTH_URL` is not needed (checked in P1).
  - `pg` 8 reads Neon's `sslmode=require` as `verify-full` and logs a security warning, at error level, on every cold start. `pg` 9 turns `require` into encryption without certificate checks, so set `sslmode=verify-full` before upgrading (seen in P1).
