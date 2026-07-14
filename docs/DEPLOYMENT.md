# PolicyProof Deployment Guide

This guide prepares a supervised Vercel deployment. It does not authorize or perform one.

## Before connecting a repository

1. Confirm all quality commands in `TESTING.md` pass from a clean local checkout.
2. Confirm `.env.local`, `.next/`, `node_modules/`, `test-results/`, `playwright-report/`, and `.vercel/` are ignored.
3. Run the secret scan in `docs/submission/REPOSITORY_REVIEW.md`.
4. Select a license and review the public README.

## Vercel configuration

- Framework preset: Next.js
- Runtime: Node.js 24
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output: Next.js default
- Root directory: repository root

Deterministic mode requires no environment variable. Live mode requires `OPENAI_API_KEY` as a server-only Vercel environment variable. Enter it only in Vercel project settings; never place it in source, chat, screenshots, or build arguments. Configure Preview and Production separately if both need supervised Live testing.

## Runtime and route expectations

- `/` is statically rendered and hydrates browser-only locale and review state safely.
- `/api/ai/status` is dynamic and returns only `{ available, model }`; it never returns a key.
- `/api/ai/policy` and `/api/ai/analyze` are dynamic server routes.
- OpenAI requests use a 30-second application timeout and zero automatic SDK retries while the first failure is being diagnosed.
- Local documents are limited to ten UTF-8 `.txt`, `.md`, or `.json` files of 1 MB each. Browser state is temporary.
- Security headers deny framing, MIME sniffing, camera, microphone, and geolocation access and set a strict referrer policy.

## Post-deployment smoke test

1. Open the public URL in a private browser window.
2. Confirm the value proposition, five steps, and `Human review remains required` statement are visible.
3. Leave Deterministic demo selected, run at EUR 10,000, and confirm 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING.
4. Inspect the EUR/USD contradiction, record a fictional reviewer decision, and test print/JSON receipt actions.
5. Switch English/French and confirm state and the HTML language are preserved.
6. Open `/api/ai/status` and confirm it contains only availability and model metadata.
7. Verify response headers include `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`.
8. Repeat the responsive and keyboard checks in `TESTING.md`.

## Supervised Live GPT-5.6 verification

1. Use only the bundled fictional policy and fictional text records.
2. Confirm Live mode is enabled without inspecting or displaying the key.
3. Make one policy-compilation request and record only the safe category/reference shown in the browser plus the fixed redacted server diagnostic fields.
4. Review every proposed control before approval; generated controls are never approved automatically.
5. If compilation succeeds, make one fictional analysis request and verify every excerpt exists in its submitted source.
6. Do not claim Live success unless both the provider response and source traceability are manually verified.

## Rollback

If a deployment fails, use Vercel's previous known-good deployment promotion or redeploy the last reviewed commit. Do not delete local work or rotate credentials merely to hide an application error. Disable or remove the Live environment variable if provider access must be stopped; deterministic mode remains usable without it.

## Known limitations

There is no persistence, authentication, PDF/OCR support, database, or production audit store. A Content Security Policy is not enabled yet and must be tested against the deployed Next.js scripts before adoption. Vercel function duration and request-body limits must be confirmed on the selected account plan before public Live analysis.
