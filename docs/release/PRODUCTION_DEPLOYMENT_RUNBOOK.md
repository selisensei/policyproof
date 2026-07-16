# Production deployment runbook

## Scope and safety

This runbook prepares an owner-supervised Vercel deployment. The repository contains no automatic deployment job. Do not place an API key in source control, build logs, screenshots, browser configuration, or public issues.

## Before deployment

1. Confirm the final local branch: `git branch --show-current`.
2. Confirm the tree is clean: `git status --short` should print nothing.
3. Run `pnpm release:verify`.
4. Run the separate online gate `pnpm audit --prod`.
5. Review `LICENSE`, `SECURITY.md`, `README.md`, and `docs/release/RELEASE_MANIFEST.md`.
6. Obtain explicit owner authorization before any push or deployment.

## Create or select the GitHub repository

1. Sign in to the owner's GitHub account.
2. Create a repository or select the repository approved for Build Week.
3. Do not initialize it with another README, license, or `.gitignore` when pushing this existing history.
4. Keep secret scanning and private vulnerability reporting enabled where available.
5. Add the approved remote URL locally only after owner authorization.
6. Push the approved release history; do not force-push or rewrite it.
7. Confirm the GitHub Actions Verify, Chromium critical paths, and Production dependency audit jobs pass.

## Connect Vercel

1. Sign in to Vercel with the owner-approved account.
2. Select **Add New Project** and import the approved GitHub repository.
3. Select the repository root; PolicyProof is not inside a monorepo subdirectory.
4. Confirm the framework is detected as Next.js.
5. Keep the install command as `pnpm install --frozen-lockfile` when Vercel allows an override; otherwise confirm Vercel respects `packageManager` and `pnpm-lock.yaml`.
6. Use Node.js 24 if the Vercel project offers an explicit runtime selector compatible with the repository metadata.
7. Do not add a deployment hook, analytics package, telemetry integration, database, or authentication service.

## Environment configuration

Deterministic Demo must work with no environment variable. First deploy with no `OPENAI_API_KEY` and verify the provider-unavailable boundary.

If the owner later authorizes optional live features:

1. add `OPENAI_API_KEY` only in Vercel project environment settings;
2. scope it to the intended deployment environments;
3. never reveal or copy the value into logs or screenshots;
4. redeploy only after saving the server-side variable;
5. supervise one fictional-data live smoke separately from deterministic validation.

## Deployment checks

Open the production URL in a private-navigation window and verify:

1. the page loads directly with no login and no OpenAI key;
2. Focused Demo is the default and Northstar shows no precomputed outcomes;
3. Run review produces 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING;
4. the EUR/USD excerpts are exact;
5. deterministic rerun reproduces 7 of 7 and the Review Fingerprint;
6. the EUR 15,000 threshold changes only the approval control;
7. a human decision and receipt can be created and verified;
8. JSON, Markdown, and CSV downloads use fictional content and expected filenames;
9. print preview is readable and contains no hidden application chrome;
10. English and French switch without hydration warnings;
11. 390 × 844 mobile reflow has no horizontal page overflow;
12. browser console contains no error, stack trace, hydration warning, or secret;
13. deterministic actions cause no `/api/ai/policy`, `/api/ai/analyze`, or external provider request;
14. `/api/ai/status` reports live mode unavailable when no key is configured;
15. response headers include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`.

Do not add a late Content Security Policy without a separate comprehensive regression pass.

## Rollback

1. In Vercel, identify the last verified deployment from the approved release commit.
2. Use Vercel's rollback or promote-previous-deployment control.
3. Confirm the production alias points to the verified deployment.
4. Repeat the no-key load, Northstar result, receipt, console, network, and header checks.
5. Record the incident and the exact deployed commit before attempting a fix.

Any post-freeze product fix requires a focused regression test and explicit owner approval. Documentation or configuration correction alone does not authorize a business-behavior change.
