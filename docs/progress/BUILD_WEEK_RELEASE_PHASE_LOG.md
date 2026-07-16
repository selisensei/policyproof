# Build Week release phase log

## Objective

Freeze validated product behavior and prepare a reproducible, secure, public-ready repository without adding product functionality, dependencies, provider calls, deployment, or publication.

## Architecture decisions

- Frozen product source: `1a6db74cef7331a2432b19c0f8bf6a8d894dd4e4`.
- Release branch: `release/build-week-submission`.
- Runtime metadata aligned to the actually validated Node 24.14.0 and pnpm 11.9.0 environment.
- Native Node scripts perform documentation, hygiene, release, and clean-room orchestration.
- GitHub Actions uses no OpenAI secret and performs no deployment.
- Product behavior, scenarios, rules, provider integration, fingerprints, and receipts remain frozen.

## Implementation

- Added MIT licensing, changelog, code-freeze record, security policy, and secret-free environment guidance.
- Added public documentation and release manifest.
- Added Markdown-link and release-hygiene checks with focused regression tests.
- Added fail-fast `pnpm release:verify`.
- Added ignored tracked-content clean-room verification.
- Added conservative GitHub Actions Verify, Browser, and Dependency Audit jobs.
- Added production deployment, accessibility, performance, Codex/GPT-5.6, and final submission guidance.

## Regressions and corrections

1. The first clean-room attempt could not launch `pnpm.cmd` with direct Windows child-process execution. The orchestrator now invokes the Windows command processor explicitly with constant arguments and `shell: false`.
2. The first extended clean-room build revealed Turbopack selecting the parent repository because the clean room is necessarily nested under an ignored workspace path. `next.config.ts` now pins Turbopack to `process.cwd()`, with a regression assertion.
3. The first four-minute clean-room window expired while the empty-cache production build was still running. No product check was reported as passed. A longer supervised run completed every gate.
4. The installed pnpm runtime reported 11.9.0 rather than the previous 11.7.0 metadata. Package metadata, CI, tests, and public documentation now use the actually validated version.
5. After the empty-cache clean-room build, the slow Windows filesystem caused Vitest fork-start and 5-second UI-test timeouts without assertion failures. The release configuration now caps Vitest at two workers and allows 15 seconds per test. No test, assertion, scenario, or expected result was removed or weakened.

## Local commits

- `69b345b05e5e844fcc95dad44249ad5ac87179d3` — `chore: prepare PolicyProof public release`
- `e58f4433d2cb2dfbbb4951ed2a172b8a899aa052` — `ci: add reproducible release verification`
- Final documentation commit: reported in the final handoff after creation.

## Validation summary

- Phase 3 baseline: 188/188 Vitest tests and 23/23 Playwright tests passed before release changes.
- Release tests: metadata, security wording, documentation links, hygiene, CI, clean-room contracts, and release-orchestrator success/failure behavior added.
- Clean room: offline frozen install, deterministic verification, build, no-key provider-unavailable status, and production security-header smoke passed.
- Full final counts and command durations are recorded in `TESTING.md` and the final French handoff after the last documentation change.

## Compromises and rejected additions

- CI actions use stable major action tags rather than guessed repository-specific badges.
- The online production dependency audit remains outside `release:verify` because registry availability is not an offline release prerequisite.
- No late Content Security Policy was added without a dedicated regression phase.
- No screenshot, deployment file, analytics, authentication, database, feature, scenario, rule, or dependency was added.

## Owner actions remaining

Repository publication, first remote CI confirmation, Vercel deployment, production validation and captures, physical mobile and screen-reader checks, video and thumbnail, `/feedback` Session ID, and Devpost submission require explicit owner action.
