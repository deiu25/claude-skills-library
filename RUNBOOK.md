# Runbook

How to operate the production site. Hosting: Vercel, project `claude-skills-library`. Production: https://skillcellar.com.

## Deploy

- A push to `main` builds and deploys to production, and a push to any other branch builds a preview. Vercel cancels the build when the commits since that branch's last successful deployment change only root-level Markdown, `e2e/`, `.claude/` or `.github/` (`scripts/vercel-ignore-build.sh`, run as `vercel.json`'s `ignoreCommand`): the deployment shows as Canceled and the previous one stays live. A branch's first push and a redeploy always build.
- To ship: run `npm test && npm run lint && npx tsc --noEmit && npm run build && npm run test:e2e`, merge the branch into `main` and push. There is no other deploy step. The e2e suite builds and serves the site on port 3000 itself, so stop any dev server first. Once a branch is merged or dropped, delete it on GitHub (`git push origin --delete <branch>`) and delete its preview database, a copy of production that every pushed branch gets: `neon branches delete preview/<branch> --project-id <Neon project id>`, or on the Neon console's Branches page. Neon would otherwise keep it until Vercel's retention policy deletes the branch's last preview, 30 days or more later, and /privacy promises it is gone within a day after the change goes live or is dropped. The previews themselves stay, without a database, until retention removes them. Neon's Branches page should then list only `main` and branches in progress. On 2026-10-22, with 10 database branches, every new preview failed with "Resource provisioning failed".
- The build command in `vercel.json` applies pending migrations (`npm run db:migrate`) before `next build` whenever `DATABASE_URL_UNPOOLED` is set. A failed migration fails the deploy. Previews migrate their own Neon branch.
- `vercel.json` also schedules `/api/cron/cleanup` once a day (Hobby runs it within the hour of 03:00 UTC). It deletes expired sessions and email links, rate-limit rows unused for a day and skills left without an owner, and answers 401 until `CRON_SECRET` is set in Production.

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
| `NEXT_PUBLIC_ACCOUNTS_OPEN` | Production and Preview, changed together with `ACCOUNTS_OPEN` | `true` shows the header's "Sign in" and "Community" links. It is built into the pages, so it changes only with a redeploy. |
| `CRON_SECRET` | Production only | Vercel Cron sends it as `Authorization: Bearer <secret>`; without it the daily cleanup refuses to run. At least 32 random characters: `openssl rand -base64 32`. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Added by the Upstash for Redis integration for Production and Preview; `UPSTASH_REDIS_REST_URL` and `_TOKEN` work too | Rate limits for Server Actions, such as saving a skill, and for skill downloads. They fail closed in production: without them, or with Redis down, every save answers "Saving is unavailable for a moment", every download answers 503, and the log says `Rate limit refused a request` or `Rate limit check failed`. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Production only, from the production OAuth app; `.env.local` from a second app for `localhost:3000`. Never Preview: GitHub callback URLs cannot be wildcards | Turn on GitHub sign-in. Each app's callback URL is `<origin>/api/auth/callback/github`. Without both variables the sign-in pages show no GitHub button. |

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

If the log stops at `npm run db:migrate`, the migration failed and its error is printed just above. Reproduce it against a Neon branch made from production with `DATABASE_URL_UNPOOLED=<branch url> npm run db:migrate`, never against production itself. That branch is a copy of production: delete it within a day after the fix ships, as /privacy promises.

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
