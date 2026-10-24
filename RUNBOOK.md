# Runbook

How to operate the production site. Hosting: Vercel, project `claude-skills-library`. Production: https://skillcellar.com.

## Deploy

- A push to `main` builds and deploys to production, and a push to any other branch builds a preview. Vercel cancels the build when the commits since that branch's last successful deployment change only root-level Markdown, `e2e/`, `.claude/` or `.github/` (`scripts/vercel-ignore-build.sh`, run as `vercel.json`'s `ignoreCommand`): the deployment shows as Canceled and the previous one stays live. A branch's first push and a redeploy always build.
- To ship: run `npm test && npm run lint && npx tsc --noEmit && npm run build && npm run test:e2e`, merge the branch into `main` and push. There is no other deploy step. The e2e suite builds and serves the site on port 3000 itself, so stop any dev server first. Once a branch is merged or dropped, delete it on GitHub (`git push origin --delete <branch>`) and delete its preview database, a branch of `dev` that every pushed branch gets: `neon branches delete preview/<branch> --project-id <Neon project id>`, or on the Neon console's Branches page. Neon would otherwise keep it until Vercel's retention policy deletes the branch's last preview, 30 days or more later, and the project allows 10 database branches: on 2026-10-22, with 10, every new preview failed with "Resource provisioning failed". The previews themselves stay, without a database, until retention removes them. Neon's Branches page should then list only `main`, `dev` and branches in progress.
- The build command in `vercel.json` applies pending migrations (`npm run db:migrate`) before `next build` whenever `DATABASE_URL_UNPOOLED` is set. A failed migration fails the deploy. Previews migrate their own Neon branch.
- `vercel.json` also schedules `/api/cron/cleanup` once a day (Hobby runs it within the hour of 03:00 UTC). It deletes expired sessions and email links, rate-limit rows unused for a day, skills left without an owner, accounts not confirmed within 7 days, ended username holds and reports decided more than a year ago, and answers 401 until `CRON_SECRET` is set in Production.

## Preview databases

Neon's Vercel integration gives each preview its own database branch, cut from the Neon project's default branch. That branch is `dev`: made-up accounts and skills from `scripts/seed-dev.mjs`, never a copy of production, which /privacy promises. Production uses `main`, the integration's production branch (Neon console → Integrations → Vercel → Settings → Production branch); changing the default branch leaves it there.

- `dev` holds `dev-admin` (`admin@example.com`, the admin `ADMIN_USER_IDS` names in Preview) and `dev-author` (`author@example.com`, with a public and an unlisted skill). Neither has a password. To sign in on a preview, give one a password on that preview's own branch, as the phase checks do; never on `dev` itself.
- After a merge that adds a migration, bring `dev` up to date so previews build faster: `DATABASE_URL_UNPOOLED="$(neon connection-string dev --project-id <Neon project id>)" npm run db:migrate`, from an up-to-date `main`.
- To make `dev` again: `neon branches create --project-id <Neon project id> --name dev --parent main --schema-only` copies production's tables without their rows, and leaves drizzle's ledger empty. Record the migrations production already has, so the next migrate applies only newer ones: on `dev`, `insert into drizzle.__drizzle_migrations (hash, created_at) values ('recorded by hand', <the "when" of main's newest entry in drizzle/meta/_journal.json>)`. Then seed it with `DATABASE_URL_UNPOOLED=<dev's connection string> node scripts/seed-dev.mjs`, which refuses a database holding any account outside example.com, and set it as the default: `neon branches set-default dev --project-id <Neon project id>`.
- Never set `main` as the default branch while previews are on: every new preview would get a copy of production's accounts.

## Verify a deploy

1. In Vercel, the deployment for the `main` commit reaches **Ready**. A failed build leaves the previous deployment live.
2. Open `/`, `/skills`, one `/skills/<slug>` page and `/skills.json`. `curl -sI` on `/` and `/skills` shows no `set-cookie`.
3. Skill cards show GitHub stats. To count entries without them:

```bash
curl -s https://skillcellar.com/skills.json \
  | python3 -c 'import json,sys; s=json.load(sys.stdin)["skills"]; print(sum(1 for x in s if x["repo"] and x["stars"] is None), "of", sum(1 for x in s if x["repo"]), "without stats")'
```

Anything above 0 points to "GitHub stats missing" below.

## Roll back

1. In Vercel, open **Deployments**, pick the last good production deployment and choose **Instant Rollback**. From the CLI: `vercel rollback <deployment-url>`.
2. After a rollback Vercel stops assigning the production domain automatically: later pushes to `main` build, but do not go live.
3. Fix forward on a branch, merge into `main`, then promote the new deployment (**Promote** in the dashboard, or `vercel promote <deployment-url>`). Promoting turns automatic production deploys back on.

On the Hobby plan, Instant Rollback reaches only the deployment right before the current one. For anything older, `git revert` the bad commit and push.

A rollback never undoes a migration. Migrations only add tables and columns, so the previous deployment keeps working on the newer schema. One exception: `0004` rewrote `skill_version.content_hash` as a folder hash, so a deployment from before P5 stores a new version on every save, unchanged or not, and without the skill's files. To undo a schema change, write a new migration and ship it.

## Environment variables

| Name | Must be set in | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Vercel project settings, for Production and Preview; `.env.local` for development | Raises the GitHub API limit from 60 to 5,000 requests per hour. Needs no scopes. Read on the server only. |
| `DATABASE_URL` | Added by the Neon integration for Production and Preview, never Development: `vercel env pull` would copy production credentials into `.env.local`. Each preview gets its own branch's value | Pooled Postgres connection the app queries through. |
| `DATABASE_URL_UNPOOLED` | Added by the Neon integration | Direct connection, used only by `npm run db:migrate`. |
| `BETTER_AUTH_SECRET` | Production and Preview; `.env.local` | Signs sessions and email links, and encrypts two-factor secrets, backup codes and GitHub tokens. At least 32 random characters: `openssl rand -base64 32`. Replacing it signs everyone out, voids open links and makes what it encrypted unreadable, so two-factor users could not finish a password sign-in. To rotate, set `BETTER_AUTH_SECRETS=1:<new secret>` and keep the old value here: the first entry signs and encrypts, the old one still decrypts. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Production and Preview | Send verification and reset emails. Resend's test sender `onboarding@resend.dev` delivers only to the Resend account owner's address. |
| `ACCOUNTS_OPEN` | Production and Preview | `true` opens sign-up to everyone, and with it the Community pages and downloads of published skills; any other value keeps all three closed, and the Community pages answer 404. Those pages are cached, so they follow a change only after a redeploy. |
| `ACCOUNTS_ALLOWLIST` | Production and Preview | Comma-separated addresses that may sign up while sign-up is closed. |
| `ADMIN_USER_IDS` | Production (the owner's user id) and Preview (`dev-admin`, the seeded admin) | Comma-separated user ids that may open `/dashboard/admin` and moderate. Anyone else gets a 404 there. Not a secret; a user's id is in their data export. |
| `NEXT_PUBLIC_ACCOUNTS_OPEN` | Production and Preview, changed together with `ACCOUNTS_OPEN` | `true` shows the header's "Sign in" and "Community" links. It is built into the pages, so it changes only with a redeploy. |
| `CRON_SECRET` | Production only | Vercel Cron sends it as `Authorization: Bearer <secret>`; without it the daily cleanup refuses to run. At least 32 random characters: `openssl rand -base64 32`. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Added by the Upstash for Redis integration for Production and Preview; `UPSTASH_REDIS_REST_URL` and `_TOKEN` work too | Rate limits for Server Actions, such as saving a skill, and for skill downloads. They fail closed in production: without them, or with Redis down, every save answers "Saving is unavailable for a moment", every download answers 503, and the log says `Rate limit refused a request` or `Rate limit check failed`. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Production only, from the production OAuth app; `.env.local` from a second app for `localhost:3000`. Never Preview: GitHub callback URLs cannot be wildcards | Turn on GitHub sign-in. Each app's callback URL is `<origin>/api/auth/callback/github`. Without both variables the sign-in pages show no GitHub button. |
| `STRIPE_SECRET_KEY` | Production and Preview, as a sensitive variable; on the command line for `next dev` | The secret key of the Stripe sandbox "SkillCellar" (Stripe Dashboard → that sandbox → Developers → API keys). Only a test-mode key (`sk_test_`, `rk_test_`) is used: a live key turns selling off and logs `Selling is off: STRIPE_SECRET_KEY is not a test-mode key.` until P13. Without it there is no Sales page and no Price section. |

The Neon integration also adds `PG*` and `POSTGRES_*` variables; the app reads only the two above. Auth takes its base URL from the request host, checked against Vercel's own `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_BRANCH_URL` and `VERCEL_URL`, so no `BETTER_AUTH_URL` is needed.

A deployment keeps the variables it was built with. After adding or changing one, redeploy for it to take effect.

To rotate the token: create a new token on GitHub, replace the value in Vercel, redeploy, then revoke the old token. The GitHub client secret rotates the same way, inside the OAuth app.

## Incidents

### GitHub stats missing

Cards show no stars, or a skill page says "GitHub stats are temporarily unavailable".

- **Cause:** the GitHub API refused or failed the request, usually because of the rate limit. `getRepoStats` returns `null` and the pages degrade; nothing else breaks.
- **Check:** `GITHUB_TOKEN` is set in Vercel for Production, and the token is still valid.
- **Recover:** redeploy after fixing the token. Otherwise the first request after the next 6-hour window triggers a background refresh, and later requests get the new stats.

### Build fails

The previous production deployment stays live. Read the build log in Vercel, reproduce it with `npm run build`, and fix it on a branch.

If the log stops at `npm run db:migrate`, the migration failed and its error is printed just above. Reproduce it against a Neon branch made from production with `DATABASE_URL_UNPOOLED=<branch url> npm run db:migrate`, never against production itself. That branch is a copy of production: delete it within a day after the fix ships or is dropped, as /privacy promises.

### Account requests fail

Sign-in or sign-up answers 500. The log line `Auth request failed: <error> <code>` names the cause without the query's parameters: a Postgres error code such as `23505`, or a connection code such as `ECONNREFUSED`. Check that the Neon database is up and `DATABASE_URL` is set for that environment.

### Account emails do not arrive

The server log says `Email not sent:` with the reason. Check that `RESEND_API_KEY` and `EMAIL_FROM` are set for that environment. While `EMAIL_FROM` uses Resend's test sender, mail reaches only the Resend account owner.

### GitHub sign-in fails

The sign-in page shows a message, and its URL ends in `?error=<code>`. GitHub itself showing "redirect_uri is not associated with this application" means the OAuth app's callback URL does not match the domain exactly. `SIGN_UP_CLOSED` and `email_not_verified` are refusals working as intended. Any other code: check that both `GITHUB_*` variables are set for Production and that the deployment was built after they were, then read the runtime log around the callback request.

### Locked out of two-factor

A user who lost both the authenticator app and the backup codes cannot finish a password sign-in, and GitHub or a passkey, if they have one, still works. Only after the account's own address confirms the request by email, in the Neon console delete the user's `two_factor` row and set `user.two_factor_enabled` to false. Ten wrong codes in a row lock the check for 15 minutes on their own.

### Moving the production domain

Passkeys bind to the host that registered them, so every passkey stops working on the new domain; users sign in another way and add one again. Better Auth answers only on the hosts in `allowedHosts`, which take the production host from `VERCEL_PROJECT_PRODUCTION_URL` (Vercel picks the shortest custom domain) when a deployment is built. So, in this order:

1. Add `https://<new domain>/api/auth/callback/github` to the GitHub OAuth app, keeping the old one.
2. Add the domain to the project in Vercel, and `www.<new domain>` as a 308 redirect to it.
3. Update `SITE_URL` in `src/lib/site.ts` and deploy. From this deploy on, accounts work on the new domain and stop working on the old one.
4. As soon as that deploy is Ready, set the old domain to redirect (308) to the new one in the project's domain settings.

### Wrong or harmful catalog entry

Fix the file in `src/data/skills/`, or delete it together with its import and array entry in `src/data/skills/index.ts`, then push to `main`. If the entry's source is malicious or hijacked, remove it before anything else: `/install-all.txt` would ask Claude Code to install it.

### Reports and moderation

Moderation happens at `/dashboard/admin`, for the ids in `ADMIN_USER_IDS`; the dashboard links to it. Every decision there emails its reason to the account it affects and the outcome to whoever reported, and marks the Community pages stale, so nothing needs a redeploy.

- **A report from the form** arrives as an email to every admin and waits under Reports. Choose "Remove the skill", "Suspend its author" (or "Suspend the account" for a profile) or "Dismiss the report". Removing or suspending asks for the ground and the reason, which the account receives word for word: say what breaks which rule, and for illegal content, name the law.
- **A report by email** to the contact address: answer at once that it arrived, as the terms promise. If it holds, paste the skill's address or the account's `@username` into Take down, which emails the author the reason; then write to whoever reported with the outcome. If it does not hold, write to them that you will not act and why.
- **A harmful skill nobody reported:** Take down, with the skill's address. Take down reaches only published skills; an account is named only as `@username`, so a pasted profile address suspends nobody.
- **Contesting a decision:** the author or the reporter writes to the contact address. Review it, and answer. To lift a suspension, use "Lift suspension" under Suspended accounts. To restore a removed skill, in the Neon console run `update skill set status = 'draft', visibility = 'private', removal_reason = null where id = '<id>'`, then tell its author they can publish it again; the id is in its download address, `/api/skills/<id>/download`.
- A suspension and a removal have no end date until you lift or undo them. A suspended account cannot sign in to export or delete its data, so do either for it on request, within a month, as /privacy promises:
  - Act only on a request sent from the account's own address.
  - **A copy of its data:** "Download its data" on its row under Suspended accounts gives the JSON its own export would. The download addresses in it need the owner signed in, so fetch each version it lists from `/api/admin/export/<user id>?skill=<skill id>&version=<n>`, signed in as an admin, and email the JSON and the zips to the account's address.
  - **Deleting it:** in the Neon console on `main`, find its id (`select id from "user" where email = '<address>'`). If it set up selling, `select stripe_account_id from seller_account where user_id = '<id>'` names its Stripe account: close that first, as "Selling" below says, because the statements delete the only record of it. Then run the statements below with the id in place of `<id>`. They do what deleting the account in settings does: hold its username for 90 days, keep its newest three holds, and delete its skills, its email links and the account. The first statement stops the whole block unless the account is suspended. Its skills are hidden already, so no page needs a refresh.

```sql
begin;
do $$ begin
  if not exists (select 1 from "user" where id = '<id>' and banned) then raise exception 'not a suspended account'; end if;
end $$;
insert into username_hold (username, user_id, held_until)
  select username, id, now() + interval '90 days' from "user" where id = '<id>' and username is not null
  on conflict (username) do update set user_id = excluded.user_id, held_until = excluded.held_until;
delete from username_hold where user_id = '<id>' and username not in
  (select username from username_hold where user_id = '<id>' order by held_until desc limit 3);
delete from skill where owner_id = '<id>';
delete from verification where value = '<id>' or value like '%"id":"<id>"%';
delete from "user" where id = '<id>';
commit;
```

### Selling

Selling runs in the Stripe sandbox "SkillCellar", under the company's Stripe account. Its Connect settings are the dashboard's, not the repository's: the platform profile (buyers purchase from the platform, which pays sellers and answers for refunds and chargebacks), the onboarding branding, and Onboarding options → Countries, which must match `src/lib/market/countries.ts`.

- `Seller onboarding failed: <code>` or `Stripe account check failed: <code>`: Stripe refused or did not answer, or the database failed. A Stripe code shows in the sandbox's Workbench → API activity, and `StripeConnectionError` means Stripe did not answer. A five-character Postgres code or a network code such as `ETIMEDOUT` comes from the database; another error's name, from the database driver or the site's code.
- `Stripe account not closed: acct_… <code>` (the Stripe account of a deleted user, which could not be closed, or a second account a parallel request opened) or `Seller account not stored: acct_… <code>` (Stripe opened an account the database then failed to record): if `select user_id from seller_account where stripe_account_id = 'acct_…'` finds no row, close that connected account through the API, `POST /v2/core/accounts/acct_…/close` with `applied_configurations: ["recipient"]`, as `closeSellerAccount` does; a seller's retry the same day may have stored it since. Hobby keeps these logs for an hour, `Stripe account not closed: unknown account` means the database read failed, so the log has no id, and an account Stripe opened while its answer was lost is not logged at all: a seller who tries again on a later day gets a new one. So close the same way any connected account in the sandbox that no `seller_account` row names and that was opened before today (UTC).
- A seller whose Sales page says "This Stripe account can no longer be used" (it was closed, or `STRIPE_SECRET_KEY` now points at another sandbox): `delete from seller_account where user_id = '<id>'` lets them start again from the next day (UTC). The request that opens an account is keyed by user, country and day, and Accounts v2 hands back the same account for a key for 30 days.

### Edge rate limit

A Vercel Firewall rule, "Downloads and sitemap rate limit", answers 429 when one IP sends more than 20 requests a minute to `/api/skills/*/download` or `/sitemap.xml`, before a function runs, so a flood spends neither function time nor the Upstash commands the Server Actions' limits share. Hobby allows one such rule per project. The rule lives in the dashboard, not in the repository: Firewall shows whether it exists, and until it does a flood reaches the functions and Upstash. To create it: Firewall → Configure → New Rule; If Request Path matches the regular expression `^/(api/skills/[^/]+/download|sitemap\.xml)$`, Then Rate Limit, Fixed Window, 60 seconds, 20 requests, key IP, action 429; Save, then Review Changes and Publish. Firewall → the rule shows what it blocked.
