# Runbook

How to operate the production site. Hosting: Vercel, project `claude-skills-library`. Production: https://claude-skills-library-psi.vercel.app.

## Deploy

- A push to `main` builds and deploys to production. Any other branch pushed to GitHub gets a preview deployment.
- To ship: run `npm test && npm run lint && npx tsc --noEmit && npm run build`, merge the branch into `main`, push. There is no other deploy step.

## Verify a deploy

1. In Vercel, the deployment for the `main` commit reaches **Ready**. A failed build leaves the previous deployment live.
2. Open `/`, `/skills`, one `/skills/<slug>` page and `/skills.json`.
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

## Environment variables

| Name | Must be set in | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Vercel project settings, for Production and Preview; `.env.local` for development | Raises the GitHub API limit from 60 to 5,000 requests per hour. Needs no scopes. Read on the server only. |

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

### Wrong or harmful catalog entry

Fix the file in `src/data/skills/`, or delete it together with its import and array entry in `src/data/skills/index.ts`, then push to `main`. If the entry's source is malicious or hijacked, remove it before anything else: `/install-all.txt` would ask Claude Code to install it.
