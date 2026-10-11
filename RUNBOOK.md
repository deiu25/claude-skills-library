# Runbook

How to operate the production site. Hosting: Vercel, project `claude-skills-library`. Production: https://claude-skills-library-psi.vercel.app.

## Deploy

- A push to `main` builds and deploys to production. Any other branch pushed to GitHub gets a preview deployment.
- To ship: run `npm test && npm run lint && npx tsc --noEmit && npm run build`, merge the branch into `main`, push. There is no other deploy step.
- The build command in `vercel.json` applies pending migrations (`npm run db:migrate`) before `next build` whenever `DATABASE_URL_UNPOOLED` is set. A failed migration fails the deploy. Previews migrate their own Neon branch.

## Verify a deploy

1. In Vercel, the deployment for the `main` commit reaches **Ready**. A failed build leaves the previous deployment live.
2. Open `/`, `/skills`, one `/skills/<slug>` page and `/skills.json`. `curl -sI` on `/` and `/skills` shows no `set-cookie`.
3. Skill cards show GitHub stats. To count entries without them:

```bash
curl -s https://claude-skills-library-psi.vercel.app/skills.json \
  | python3 -c 'import json,sys; s=json.load(sys.stdin)["skills"]; print(sum(1 for x in s if x["repo"] and x["stars"] is None), "of", sum(1 for x in s if x["repo"]), "without stats")'
```

Anything above 0 points to "GitHub stats missing" below.

## Roll back

1. In Vercel, open **Deployments**, pick the last good production deployment and choose **Instant Rollback**. From the CLI: `vercel rollback <deployment-url>`.
2. After a rollback Vercel stops assigning the production domain automatically: later pushes to `main` build, but do not go live.
3. Fix forward on a branch, merge into `main`, then promote the new deployment (**Promote** in the dashboard, or `vercel promote <deployment-url>`). Promoting turns automatic production deploys back on.

On the Hobby plan, Instant Rollback reaches only the deployment right before the current one. For anything older, `git revert` the bad commit and push.

A rollback never undoes a migration. Migrations only add tables and columns, so the previous deployment keeps working on the newer schema. To undo a schema change, write a new migration and ship it.

## Environment variables

| Name | Must be set in | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Vercel project settings, for Production and Preview; `.env.local` for development | Raises the GitHub API limit from 60 to 5,000 requests per hour. Needs no scopes. Read on the server only. |
| `DATABASE_URL` | Added by the Neon integration for Production and Preview, never Development: `vercel env pull` would copy production credentials into `.env.local`. Each preview gets its own branch's value | Pooled Postgres connection the app queries through. |
| `DATABASE_URL_UNPOOLED` | Added by the Neon integration | Direct connection, used only by `npm run db:migrate`. |
| `BETTER_AUTH_SECRET` | Production and Preview; `.env.local` | Signs sessions and email links. At least 32 random characters: `openssl rand -base64 32`. Changing it signs everyone out and voids open links. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Production and Preview | Send verification and reset emails. Resend's test sender `onboarding@resend.dev` delivers only to the Resend account owner's address. |
| `ACCOUNTS_OPEN` | Production and Preview | `true` opens sign-up to everyone. Any other value keeps it closed. |
| `ACCOUNTS_ALLOWLIST` | Production and Preview | Comma-separated addresses that may sign up while sign-up is closed. |

The Neon integration also adds `PG*` and `POSTGRES_*` variables; the app reads only the two above. Auth takes its base URL from the request host, checked against Vercel's own `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_BRANCH_URL` and `VERCEL_URL`, so no `BETTER_AUTH_URL` is needed.

A deployment keeps the variables it was built with. After adding or changing one, redeploy for it to take effect.

To rotate the token: create a new token on GitHub, replace the value in Vercel, redeploy, then revoke the old token.

## Incidents

### GitHub stats missing

Cards show no stars, or a skill page says "GitHub stats are temporarily unavailable".

- **Cause:** the GitHub API refused or failed the request, usually because of the rate limit. `getRepoStats` returns `null` and the pages degrade; nothing else breaks.
- **Check:** `GITHUB_TOKEN` is set in Vercel for Production, and the token is still valid.
- **Recover:** redeploy after fixing the token. Otherwise the first request after the next 6-hour window triggers a background refresh, and later requests get the new stats.

### Build fails

The previous production deployment stays live. Read the build log in Vercel, reproduce it with `npm run build`, and fix it on a branch.

If the log stops at `npm run db:migrate`, the migration failed and its error is printed just above. Reproduce it against a Neon branch with `DATABASE_URL_UNPOOLED=<branch url> npm run db:migrate`, never against production.

### Account requests fail

Sign-in or sign-up answers 500. The log line `Auth request failed: <error> <code>` names the cause without the query's parameters: a Postgres error code such as `23505`, or a connection code such as `ECONNREFUSED`. Check that the Neon database is up and `DATABASE_URL` is set for that environment.

### Account emails do not arrive

The server log says `Email not sent:` with the reason. Check that `RESEND_API_KEY` and `EMAIL_FROM` are set for that environment. While `EMAIL_FROM` uses Resend's test sender, mail reaches only the Resend account owner.

### Wrong or harmful catalog entry

Fix the file in `src/data/skills/`, or delete it together with its import and array entry in `src/data/skills/index.ts`, then push to `main`. If the entry's source is malicious or hijacked, remove it before anything else: `/install-all.txt` would ask Claude Code to install it.
