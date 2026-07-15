# Focused Verifiability Phase 1 Progress Log

## Phase 0 — Validated baseline

- **Objective:** Confirm the competition-hardening baseline before presentation or fingerprint work.
- **Implementation decision:** Preserve the validated history and use only deterministic fixtures and provider mocks.
- **Files changed:** None.
- **Tests run:** Full unit/component, typecheck, lint, production build, Playwright, production audit, focused deterministic/provider-mock contracts, production HTTP smoke, whitespace, tracked-path, ignored-path, credential-pattern, and personal-path checks.
- **Result:** PASS — 16 files / 109 tests, 16 Playwright tests, five focused files / 48 tests, expected routes and security headers, no known production vulnerability, and clean Git state. The first sandboxed pnpm attempt failed on a protected temporary path; the identical command passed with the required runtime permission.
- **Commit:** Not applicable.
- **Blocker or compromise:** Two pre-existing pattern matches occur inside compressed static design blobs; they are not credential fields or executable application configuration.

## Phase 1 — Judge-experience audit

- **Objective:** Identify why exact Northstar evidence is not the first dominant proof moment.
- **Implementation decision:** Add a state-sharing Focused Demo while preserving the complete workspace and Proofroom identity.
- **Files changed:** `DECISIONS.md`, `docs/design/FOCUSED_VERIFIABILITY_AUDIT.md`, and this log.
- **Tests run:** Baseline screenshot inspection at desktop, 1280 × 720, and mobile plus existing responsive Playwright coverage.
- **Result:** PASS — the critical hierarchy and density problems are documented with bounded implementation decisions.
- **Commit:** `4922ddb` — `refactor: focus PolicyProof judge experience`.
- **Blocker or compromise:** Real screen-reader and physical-device checks remain manual release tasks.

## Phase 2 — Focused Demo and Full Workspace

- **Objective:** Create one Northstar-first judge path without removing the advanced workspace.
- **Implementation decision:** Use two presentation levels over one parent state; keep Full Workspace mounted while hidden and unmount only the inactive Focused presentation to avoid duplicate accessible content.
- **Files changed:** Focused presentation component, workspace state owner, Judge Mode tools, global styles, translations, interaction tests, audit, decision log, and progress log.
- **Tests run:** Focused component path, presentation switching, legacy workspace interactions, TypeScript, lint, production build, and screenshot inspection.
- **Result:** PASS — the focused path loads without precomputed outcomes, runs the shared engine, exposes EUR/USD evidence, and returns to the complete workspace with state preserved.
- **Commit:** `4922ddb` — `refactor: focus PolicyProof judge experience`.
- **Blocker or compromise:** An old local server initially served stale UI and a secondary dev server briefly shared the Next cache; the final focused capture used a clean isolated server. Generated captures remain ignored.

## Phase 3 — Review Fingerprint and deterministic rerun

- **Objective:** Prove same-input reproducibility and explain semantic change without a provider request.
- **Implementation decision:** Add a strict versioned payload, dependency-free canonicalization, native Web Crypto SHA-256, explicit same/changed/diverged comparison, and one shared rerun action in both presentation levels.
- **Files changed:** Fingerprint schema and library, fingerprint UI, Focused Demo, Full Workspace Review panel, parent state, audit actions, styles, tests, decision log, fingerprint model, and progress log.
- **Tests run:** Canonicalization, digest mutation, payload comparison, focused rerun, decision preservation/reset, divergence UI, and TypeScript.
- **Result:** PASS in targeted validation — identical Northstar semantics reproduce 7/7 and the same fingerprint; EUR 10,000 → EUR 15,000 changes only `CTRL-APPROVAL`; no provider route is invoked.
- **Commit:** `d13581d` — `feat: add deterministic review fingerprint`.
- **Blocker or compromise:** Receipt integrity remains explicitly postponed to phase 2; the current digest is not a signature or trusted timestamp.

## Phase 4 — Reproducibility hardening and submission alignment

- **Objective:** Protect the Focused Demo and fingerprint story with complete browser regression coverage and judge-ready documentation.
- **Implementation decision:** Make Focused Demo the primary public path, retain Full Workspace as the state-safe advanced path, and exercise all provider behavior through mocks only.
- **Files changed:** Five Playwright specifications, testing and product documentation, architecture and data references, Devpost draft, video script, demo runbook, judge Q&A, screenshot plan, and this log.
- **Tests run:** 18 files / 133 unit, contract, and component tests; standalone TypeScript; ESLint; production build; 19 Chromium tests; production dependency audit; isolated production HTTP smoke; whitespace, dependency, generated-path, credential-pattern, and personal-path scans; three visual passes.
- **Result:** PASS — exact EUR/USD evidence is visible in the focused path, same inputs reproduce 7/7 conclusions and the same fingerprint, EUR 10,000 → EUR 15,000 changes only Approval and the fingerprint, Full Workspace preserves state, and the complete legacy workflow remains covered.
- **Commit:** `test: harden reproducibility workflow` (this checkpoint; hash is reported in the final handoff).
- **Blocker or compromise:** The first final typecheck/build sequence exposed corrupted ignored Next.js development types from a stale local production server sharing `.next`. The process was stopped, the diagnostic artifact was preserved under an ignored name, and every gate passed after official regeneration. Public deployed-device and screen-reader checks remain the builder's manual responsibility.
