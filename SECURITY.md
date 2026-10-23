# Security Policy

## Supported versions

The site deploys continuously from `main`. Only the current production deployment at https://skillcellar.com and the latest commit on `main` receive security fixes.

## Reporting a vulnerability

Report vulnerabilities privately through GitHub: open https://github.com/deiu25/claude-skills-library/security/advisories/new, or choose **Report a vulnerability** on the repository's **Security** tab. Do not open a public issue, pull request or discussion about a security problem.

Please include what you found, where (URL, file or commit), the steps to reproduce it, and the impact you expect.

## What to expect

- An acknowledgement within 7 days.
- Updates while the report is investigated and fixed.
- Credit in the published advisory once the fix is live, unless you would rather stay anonymous.
- Coordinated disclosure: please allow up to 90 days for a fix before you publish details.

## Scope

In scope:

- The site and its endpoints, including `/skills.json`, `/llms.txt` and `/install-all.txt`.
- This repository's code, including how `GITHUB_TOKEN` is handled.
- The catalog itself: an entry whose source repository is malicious, hijacked or impersonating another project. `/install-all.txt` asks Claude Code to install every listed skill, so report such an entry privately as above and it will be removed first.

Out of scope: vulnerabilities inside the third-party skills the catalog lists. Report those to their maintainers. A skill someone published in Community that is malicious or breaks the terms is not a vulnerability of the site: use "Report this skill" on its page, or write to the contact address in the [terms of use](https://skillcellar.com/terms).
