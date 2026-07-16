# PolicyProof Testing Strategy

## Purpose

Tests must protect PolicyProof's central trust claim: each conclusion is traceable to supplied evidence or clearly identified as unsupported. Automated model tests use mocks and contracts only; they do not prove live-model accuracy.

## Required quality gates

```shell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
```

The final review also includes a local production HTTP smoke test, secret-pattern scan, dependency review, ignored-file review, Git status review, and manual screenshot inspection. The smoke test may call `/` and `/api/ai/status`; it must not call an authenticated or paid OpenAI endpoint.

## Automated coverage

### Deterministic domain

- Runtime schemas and stable fictional fixtures
- Seven controls with 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING at EUR 10,000
- Approval threshold changes from FAIL to PASS at EUR 15,000
- Disabled controls are excluded
- Evidence is exact or a missing-evidence item is explicit
- Result summaries and filters preserve count and order
- Overrides require comments; confirmations do not
- Receipt identifiers are reproducible for the same timestamp and timestamps are schema-valid
- Receipt policy/mode/language/control metadata, outcome summary, concise copy text, and JSON serialization

### Review intelligence

- Outcome composition is derived from all current results and remains filterable
- Evidence coverage distinguishes supporting, contradictory, missing, and not-applicable relations
- Chronology uses valid dates extracted from the fictional case documents and preserves source links
- Threshold sensitivity compares the actual purchase amount with the active approval threshold
- Evidence integrity reports exact-source, explicit-missing, or needs-review states without inventing a confidence percentage
- Reviewer queue order prioritizes unresolved FAIL, MISSING, WARNING, and PASS results, then severity and stable source order
- Local search covers controls, explanations, sources, locators, and exact excerpts without a server request
- Run comparison retains only one minimal versioned snapshot and identifies changed controls
- Missing, malformed, blocked, or cleared browser storage falls back safely without changing the current review
- Markdown receipt serialization uses the same validated state as JSON and print output

### Mocked GPT-5.6 integration

- Official SDK `responses.parse` request shape, `gpt-5.6`, Zod Structured Outputs, and `output_parsed`
- Valid policy compilation and case analysis
- Malformed output and missing required fields
- Missing `output_parsed`, refusal, and incomplete output
- Unknown source identifiers, hallucinated excerpts, and excerpts absent from the submitted document
- Embedded misleading document instructions treated as untrusted evidence
- 400 schema, 401 authentication, 403 permission/model access, 429 quota, 429 rate limit, 5xx provider, connection, and timeout failures
- Safe correlation/request identifiers and credential redaction
- Duplicate browser policy-submission protection
- Final-analysis capture persists the structured response before cleanup and waits for a simulated 30-second response
- Saved analysis reload, exact source excerpts, source locators, known control relations, and secret-field exclusion
- Approved live controls, extracted facts, seven deterministic outcomes, human decision, and Live-mode receipt in one mocked end-to-end pipeline
- When the ignored final live artifact exists locally, `tests/live-artifact.test.ts` reloads it independently and applies the same schema, evidence, and deterministic-result gates; otherwise that single environment-specific test is skipped

### Evaluation contracts

Version-controlled fictional fixtures cover:

- current seven-rule policy, exception, ambiguity, threshold, documentary requirement, and empty input;
- compliant, mixed, missing, contradictory, unsupported-currency, same-initiator/approver, and misleading-instruction document cases;
- reusable assertions for schema validity, source identifiers, exact excerpts, deterministic parameters, and required evidence.

These are contract tests, not evidence that a live model will always produce the expected output.

### Local document selection

- `.txt`, `.md`, and `.json` extensions only
- Compatible declared MIME types when present
- 1 MB per file and 10 files per selection/workspace
- Empty, binary, malformed JSON, duplicate-name, and excessive-name rejection
- Invalid decoding markers, null characters, lines over 20,000 characters, and misleading-filename handling
- UTF-8 content and inert HTML-like text
- Type inference, selection, removal, and reset behavior

### Component and localization

- Five-step navigation and focused panel state
- Loading, running, result and open-decision filtering, keyboard result selection, evidence inspection, decision, receipt, rerun, and reset
- English/French selector visibility and immediate translation
- Main navigation, buttons, statuses, validation, accessibility labels, and displayed receipt translation
- Locale changes preserve controls, results, decisions, comments, and exact source evidence
- The document `lang` attribute follows the selected interface locale
- Hydration-safe persisted locale behavior
- Guided-demo progress survives locale changes and reflects real workspace actions
- Live control proposals remain proposed, edited, approved, or rejected through explicit human actions
- Evidence excerpt/reference copy feedback and receipt copy/JSON download controls use current structured state

### Browser and responsive behavior

Playwright covers the complete deterministic path, case overview, filterable outcome composition, evidence coverage selection, chronology, threshold sensitivity, local search and empty results, reviewer queue navigation, exact currency evidence, override validation, JSON and Markdown receipt export, threshold recalculation, previous-run comparison and reset, decision reset notice, keyboard result navigation, persisted French locale, concise mobile inline evidence, reduced motion, print media, safe mocked provider failure, and absence of main-page horizontal overflow.

Ignored screenshots are generated for:

- English and French at 1440 px;
- English at 1280, 1024, 768, and 390 px;
- French at 390 px;
- mixed-status matrix, evidence inspector, validation error, and decision receipt.
- API unavailable and safely mocked provider-error states.

The Proofroom visual harness creates a consistent nine-screen matrix for Policy, Controls, Documents, Review, Decision, receipt, French Review, English mobile Review, and French mobile Review. Its final pass also captures empty Review, threshold change, print-only receipt, compilation loading, and a safely mocked provider error. All files remain ignored under `test-results/proofroom-integration/`.

The review-intelligence harness adds exact-size 1440 × 900, 1280 × 720, 1024 × 768, and 390 × 844 workspace captures plus focused Case Overview, Outcome Composition, Evidence Coverage, Chronology, Threshold Sensitivity, Decision, receipt, run-comparison, and English/French responsive states. These captures remain ignored under `test-results/review-intelligence/`.

## Review-intelligence checkpoint — 2026-07-14

- `pnpm test`: PASS — 14 files, 88 tests
- `pnpm typecheck`: PASS — no TypeScript errors
- `pnpm lint`: PASS — no ESLint errors or warnings
- `pnpm build`: PASS — optimized production build and expected route classification
- `pnpm test:e2e`: PASS — 10 Chromium tests, including three review-intelligence journeys
- Focused blocked-storage tests: PASS — malformed, unavailable, write-blocked, and remove-blocked storage paths fail safely
- Visual pass 1: PASS with issues identified — guide obstruction and initial hierarchy were corrected
- Visual pass 2: PASS with issue identified — mobile threshold overlap was corrected
- Visual pass 3: PASS — desktop, tablet, mobile, English, French, decision, receipt, threshold change, and run comparison inspected

These are implementation checkpoints. The final release-gate results are recorded only after documentation, the fourth visual pass, and the production smoke test are complete.

## Review-intelligence final release gate — 2026-07-14

- `pnpm test`: PASS — 14 files, 89 tests, 16.01 s
- `pnpm typecheck`: PASS — no TypeScript errors
- `pnpm lint`: PASS — no ESLint errors or warnings
- `pnpm build`: PASS — compiled in 4.0 s; static `/` and dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze`
- `pnpm test:e2e`: PASS — 11 Chromium tests, 29.2 s
- `pnpm audit --prod`: PASS — no known vulnerabilities
- `git diff --check`: PASS — no whitespace errors; Windows emitted informational LF-to-CRLF warnings
- Production smoke test: PASS — `GET /` and `GET /api/ai/status` returned 200; PolicyProof content, model `gpt-5.6`, boolean availability, `nosniff`, and `DENY` were verified; port 3200 was released
- Safe content scan: PASS — 120 non-ignored candidate files considered, 0 potential secret-pattern files, 0 personal absolute-path files
- Generated-path review: PASS — no `.env.local`, `node_modules/`, `.next/`, `test-results/`, `playwright-report/`, `coverage/`, or `.vercel/` path is tracked
- Dependency review: PASS — no change to `package.json`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml`
- Visual pass 4: PASS — 15 ignored captures covering English/French desktop, 1280 px, 390 px, all review-intelligence panels, decision, receipt, threshold rerun, run comparison, and effective 200% zoom

The fourth pass initially exposed that the header primary action disappeared below 760 CSS pixels while the footer offered only Continue. PolicyProof now reuses the same primary action in the mobile/high-zoom footer. The focused Playwright pass then completed 4/4 tests. Two subsequent jsdom-only failures were test-query ambiguities because jsdom does not evaluate CSS media queries; the helper now selects the desktop action explicitly, while Playwright verifies both responsive action locations.

No authenticated or paid OpenAI endpoint was called by the review-intelligence implementation or final release gates.

## Latest recorded results — 2026-07-14

Pre-change baseline preserved before overnight work:

- `pnpm test`: PASS — 10 files, 49 tests
- `pnpm typecheck`: PASS
- `pnpm lint`: PASS
- `pnpm build`: PASS
- `pnpm test:e2e`: PASS — 2 Chromium tests

The pre-redesign release candidate is preserved in checkpoint commit
`ed5db89d9fcc4b9f1bc5e608950d25b4b795d598`.

Judge-ready redesign verification:

- `pnpm test`: PASS — 11 files, 67 tests
- `pnpm typecheck`: PASS — no TypeScript errors
- `pnpm lint`: PASS — no ESLint errors or warnings
- `pnpm build`: PASS — static `/` and dynamic `/api/ai/status`, `/api/ai/policy`, `/api/ai/analyze`
- `pnpm test:e2e`: PASS — 4 Chromium tests covering the 12-step deterministic judge path, responsive layouts, keyboard navigation, print media, API-unavailable state, and a safely mocked provider error
- `pnpm audit --prod`: PASS — no known vulnerabilities
- `git diff --check`: PASS — no whitespace errors (Git reported informational LF-to-CRLF conversion warnings on Windows)
- Production smoke test: PASS — `GET /` returned 200 and contained PolicyProof; `GET /api/ai/status` returned model `gpt-5.6` and a boolean availability field; `nosniff` and `DENY` headers were present; port 3200 was released
- Mocked provider-error smoke test: PASS — Playwright displayed only the safe authentication category and mocked request reference
- Secret-pattern scan: PASS — 85 candidate files scanned, 0 potential secret matches
- Dependency review: PASS — no dependency manifest or lockfile change; five existing production packages
- Ignored-file review: PASS — `.env.local`, `.next/`, `node_modules/`, `test-results/`, `playwright-report/`, `coverage/`, and `.vercel/` remain ignored
- Public-documentation path review: PASS — no local Windows path or builder username detected
- Screenshot iteration 1: PASS — 16 ignored captures across the five workflow steps and required viewport widths; navigation ambiguity was corrected
- Screenshot iteration 2: PASS — 16 ignored captures; development indicators, result context, and the mobile guide were refined
- Screenshot iteration 3: PASS — 16 ignored captures; the compact case strip and explicit 12-step judge path were verified
- Final English/French screenshot review: PASS — 16 ignored captures covering desktop and mobile layouts, controls, documents, evidence workbench, validation, receipt, API-unavailable state, and mocked error; final public captures still require production recapture

No authenticated or paid OpenAI endpoint was called by these checks.

## Controlled live validation — 2026-07-14

- Policy compilation: PASS — HTTP 200, seven structured controls, 16,139 ms, followed by explicit human approval
- Final document analysis: PASS — HTTP 200, five findings, 14 evidence items, 23,054 ms, zero SDK retries
- Exact-source verification: PASS — 14/14 excerpts and 14/14 locators verified; zero invented excerpts
- Deterministic comparison: PASS — 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING across the seven approved controls
- Saved-artifact reload: PASS — Zod schema, sources, fact values, relations, mappers, engine, secret exclusion, and SHA-256 fingerprint verified
- Interface replay: PASS — captured response produced all seven statuses, EUR/USD evidence, a confirmed human decision, and a Live-mode receipt without another provider call
- Full structured artifact: intentionally ignored at `test-results/live-gpt56/final-case-analysis.json`
- Sanitized report: `docs/evaluation/LIVE_GPT56_VALIDATION.md`

Four provider requests were used across the complete supervised investigation: one 401 policy attempt, one successful policy compilation, one successful analysis whose body was lost by the original browser-lifecycle race, and one successful final analysis captured by the corrected zero-retry harness. No further provider request is authorized or required for this validation.

Final post-report release gates:

- `pnpm test`: PASS — 13 files, 81 tests
- `pnpm typecheck`: PASS — no TypeScript errors
- `pnpm lint`: PASS — no ESLint errors or warnings
- `pnpm build`: PASS — static `/` and dynamic `/api/ai/status`, `/api/ai/policy`, `/api/ai/analyze`
- `pnpm test:e2e`: PASS — 4 Chromium tests; `test-results/live-gpt56/` was preserved
- `pnpm audit --prod`: PASS — no known vulnerabilities
- Production smoke test: PASS — root 200, PolicyProof content, `nosniff`, `DENY`, available `gpt-5.6`, and port 3200 released

## Proofroom design integration — 2026-07-14

- `pnpm test`: PASS — 13 test files, 81 tests
- `pnpm typecheck`: PASS — no TypeScript errors
- `pnpm lint`: PASS — no ESLint errors or warnings
- `pnpm build`: PASS — optimized Next.js production build; static `/` and dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze`
- `pnpm test:e2e`: PASS — 7 Chromium tests, including the 12-step deterministic judge path, the nine-screen visual matrix, final state captures, responsive EN/FR checks, keyboard navigation, reduced motion, print media, and a safely mocked provider error
- `pnpm audit --prod`: PASS — no known vulnerabilities
- `git diff --check`: PASS — no whitespace errors; Windows reported informational LF-to-CRLF conversion warnings
- Production smoke test: PASS — `GET /` and `GET /api/ai/status` returned 200; PolicyProof content, `gpt-5.6`, boolean availability, `nosniff`, and `DENY` were verified; port 3200 was released
- Screenshot pass 1: PASS — 9 required captures inspected; duplicate context, first-run folio persistence, premature receipt, overlay obstruction, and mobile density were identified
- Screenshot pass 2: PASS — 9 required captures inspected; desktop alignment was confirmed and mobile header/evidence density received a second correction
- Screenshot pass 3: PASS — 9 required captures plus 5 final state captures inspected; English/French desktop and mobile, empty, threshold, print, loading, and safe error states were approved locally
- Reduced-motion review: PASS — Playwright emulation verified effectively zero animation and transition durations while exact evidence remained available
- Dependency review: PASS — no package manifest, workspace file, or lockfile changed; no dependency was added, removed, or upgraded
- Safe changed-file scan: PASS — 29 implementation files scanned, 0 potential secret matches and 0 personal absolute-path matches
- Ignored-file review: PASS — `.env.local`, `node_modules/`, `.next/`, `test-results/`, `playwright-report/`, `coverage/`, and `.vercel/` remain excluded from commits

No authenticated or paid OpenAI request was made during the Proofroom design integration. Provider loading and failure states were exercised with Playwright route mocks only.

## Practical accessibility review

Automated and browser checks currently verify semantic headings, named controls, field labels and descriptions, live status and alert regions, text status labels, visible focus, keyboard activation, responsive overflow, locale-aware accessible names, and document language changes.

Still required manually before submission:

- Navigate the entire deployed workflow using keyboard only.
- Spot-check with a screen reader in English and French.
- Confirm focus remains obvious at browser zoom levels up to 200%.
- Review status contrast and meaning without relying on color.
- Confirm long French labels and generated control text remain readable.
- Repeat the check on the deployed production URL.

Do not claim full WCAG compliance.

## Supervised live-model checklist

1. Use only the fictional policy and documents.
2. Configure the key outside source control without sharing or displaying it.
3. Make one policy-compilation attempt and record the safe browser category/reference.
4. Review only the fixed safe server diagnostic fields; do not log prompts, documents, headers, or credentials.
5. If compilation succeeds, inspect every proposed control before approval.
6. If analysis is run, verify every exact excerpt exists in the submitted fictional source.
7. Record disagreements and make only evidence-backed changes.
8. Rerun every quality gate after any change.

## Manual deterministic acceptance

1. Open the application in deterministic mode.
2. Load the demo and verify seven enabled controls and five documents.
3. Run at EUR 10,000 and verify 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING.
4. Filter FAIL and inspect the unchanged EUR/USD currency excerpts.
5. Reject Currency consistency with a comment and inspect the receipt.
6. Switch to French and back; verify state and evidence remain unchanged.
7. Change the threshold to EUR 15,000 and rerun.
8. Verify Approval threshold is PASS and prior decisions were visibly reset.
9. Reset controls and verify defaults and empty review state.

## Competition-hardening coverage — 2026-07-15

The scenario release adds strict automated coverage for:

- valid Northstar, Meridian, and Atlas fixtures;
- duplicate IDs, unknown references, non-verbatim excerpts, and stale-state reset;
- exact runtime outcome profiles, evidence coverage, chronology, reviewer queue, and receipts;
- Case Library selection, destructive-switch confirmation, language preservation, and semantic buttons;
- current-session comparison with no score or ranking;
- manual Judge Mode entry, exit, steps, no auto-decision, and no GPT request;
- GPT-5.6/TypeScript/Human architecture text equivalent;
- verified, missing, and rejected evidence-trust explanations;
- bounded schema-validated safe audit events and clear action;
- UTF-8 CSV headers, commas, quotes, line breaks, Unicode, decisions, and comments;
- Meridian, Atlas, scenario switching, 390 px mobile, keyboard, reduced motion, 768 px tablet, and effective 200% zoom in Playwright.

`tests/e2e/competition-hardening.spec.ts` writes only to ignored `test-results/competition-hardening/`. These captures are development review artifacts and must not be committed.

Manual checks still required before public submission:

1. real screen-reader pass on the deployed site;
2. real browser 200% zoom and mobile-device pass;
3. deployed print preview and downloaded JSON/Markdown/CSV inspection;
4. production-host headers and deterministic smoke test;
5. public video and screenshot review for credentials, paths, or private tabs.

## Competition release gate — 2026-07-15

Fresh final local results:

- `pnpm test`: PASS — 16 test files, 109 tests.
- focused mocked OpenAI and scenario contracts: PASS — 4 test files, 38 tests.
- `pnpm typecheck`: PASS — no TypeScript errors.
- `pnpm lint`: PASS — no ESLint errors or warnings.
- `pnpm build`: PASS — optimized Next.js build; static `/` and dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze`.
- `pnpm test:e2e`: PASS — 16 Chromium tests.
- `pnpm audit --prod`: PASS — no known vulnerabilities.
- production smoke test: PASS — root and `/api/ai/status` returned 200; PolicyProof content, `gpt-5.6`, boolean availability, `nosniff`, and `strict-origin-when-cross-origin` were verified.

No live OpenAI request was made during competition hardening. All provider behavior in this phase was mocked, and the previously validated live-model evidence remains documented separately.

## Focused verifiability release gate — 2026-07-15

Fresh results after the final application and browser-test changes:

- `pnpm test`: PASS — 18 test files, 133 tests, 23.41 s (25.1 s command wall time).
- `pnpm typecheck`: PASS — no TypeScript errors, 10.8 s command wall time.
- `pnpm lint`: PASS — no ESLint errors or warnings, 14.1 s command wall time.
- `pnpm build`: PASS — compiled in 5.4 s, completed its TypeScript phase in 8.4 s, and finished in 19.8 s command wall time; static `/` and dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze` were produced.
- `pnpm test:e2e`: PASS — 19 Chromium tests, 50.1 s (52.4 s command wall time).
- `pnpm audit --prod`: PASS — no known vulnerabilities, 1.5 s command wall time.
- Production smoke test: PASS — root and `/api/ai/status` returned 200; PolicyProof content, model `gpt-5.6`, boolean availability, `nosniff`, `DENY`, and `strict-origin-when-cross-origin` were verified; the isolated port 3400 server was stopped.
- `git diff --check`: PASS — no whitespace errors; Git emitted only informational LF-to-CRLF notices on Windows.
- Safe changed-file scan: PASS — 21 candidate files, 0 potential secret-pattern files, and 0 personal absolute-path files.
- Generated-path review: PASS — no `.env.local`, `node_modules/`, `.next/`, `test-results/`, `playwright-report/`, `coverage/`, or `.vercel/` path is tracked.
- Dependency review: PASS — no change to `package.json`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml`.
- Visual pass 1: PASS after correction — the first isolated capture exposed stale local-server/CSS output and hidden duplicate DOM; the final focused hierarchy preserves one accessible presentation and state-safe Full Workspace access.
- Visual pass 2: PASS — same-input reproduction, matching fingerprints, threshold mutation, changed fingerprint, and exact EUR/USD evidence were inspected.
- Visual pass 3: PASS — 1440, 1280, 1024, 768, and 390 px; English and French; effective 200% zoom; reduced motion; keyboard focus; and Full Workspace state preservation were inspected.

Focused Playwright coverage proves the Northstar-first presentation, exact evidence, 7/7 same-input rerun, matching and changed fingerprints, threshold causal explanation, divergence visibility, bilingual behavior, responsive layouts, keyboard operation, reduced motion, print output, and state-safe presentation switching. Existing browser suites still cover Meridian, Atlas, decisions, receipts, JSON/Markdown/CSV actions, case switching, review intelligence, mocked provider failures, and the complete workspace.

The first final `typecheck` and the following build attempt failed because an old PolicyProof `next start` process and a previously generated `.next/dev/types` directory shared the same Next.js cache. Inspection found duplicated and truncated generated declarations, not a source-code error. The identified port 3200 process chain was stopped, the corrupted generated directory was preserved under an ignored diagnostic name, and the official build regenerated a clean cache. The subsequent build, standalone typecheck, lint, Playwright run, and production smoke test all passed.

No authenticated or paid OpenAI request was made. Provider behavior remained mocked, the same-input rerun remained inside the deterministic TypeScript boundary, `.env.local` was not opened or read, and generated screenshots and smoke logs remain ignored under `test-results/focused-verifiability/`.

## Verifiable-receipt phase baseline — 2026-07-16

- `pnpm test`: PASS — 18 files, 133 tests, 55.58 s.
- `pnpm typecheck`: PASS — no TypeScript errors, 31.1 s command wall time.
- `pnpm lint`: PASS — no ESLint errors or warnings, 91.0 s command wall time.
- `pnpm build`: PASS — compiled in 26.6 s and produced the expected five routes, 53.6 s command wall time.
- `pnpm test:e2e`: PASS — 19 Chromium tests, 95.1 s command wall time.
- `pnpm audit --prod`: PASS — no known vulnerabilities.
- Production smoke: PASS — root and status route returned 200; PolicyProof, `gpt-5.6`, boolean availability, `nosniff`, and `DENY` were verified; the temporary port 3400 server was stopped.
- Ancestry: PASS — `git merge-base --is-ancestor eb120feaca78bf3cdbc71b7b7198045f86a44852 HEAD` returned success.
- Safety scans: PASS — 139 tracked text files, zero potential secret-pattern files, zero personal absolute-path files, zero forbidden generated paths tracked, and all required generated paths ignored.

No live OpenAI request was made and `.env.local` was not read. These are baseline results; final phase results are recorded only after the receipt-integrity implementation and browser paths are complete.

## Verifiable receipt final release gate — 2026-07-16

Fresh results after the final application, unit, browser, documentation, and screenshot changes:

- `pnpm test`: PASS — 20 test files, 161 tests, Vitest duration 22.77 s; 24.7 s command wall time.
- `pnpm typecheck`: PASS — no TypeScript errors; 4.4 s command wall time.
- `pnpm lint`: PASS — no ESLint errors or warnings; 10.6 s command wall time.
- `pnpm build`: PASS — compiled in 3.8 s, completed its TypeScript phase in 7.3 s, and finished in 16.0 s command wall time. Routes: static `/` and `/_not-found`; dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze`.
- `pnpm test:e2e`: PASS — 23 Chromium tests in 52.0 s; 53.9 s command wall time.
- `pnpm audit --prod`: PASS — no known vulnerabilities; 1.6 s command wall time.
- `git diff --check`: PASS.
- Production smoke: PASS — `/` and `/api/ai/status` returned 200; product text, model `gpt-5.6`, boolean availability, `nosniff`, and `DENY` were verified; the isolated port 3400 server was stopped.
- Receipt model: PASS — strict versions, cross-references, canonical ordering, UTF-8, Unicode, line endings, finite-number handling, cycles, native SHA-256, stability, and Review Fingerprint separation.
- Receipt verification: PASS — current and exported JSON valid; one-character comment, result, evidence, timestamp, stored hash, audit, decision, language, policy version, receipt ID, and Review Fingerprint modifications detected; unsupported, malformed, and missing-integrity inputs handled explicitly; no verification network request.
- Regression paths: PASS — Northstar 3/2/1/1 and exact EUR/USD evidence; 7/7 same-input rerun; EUR 10,000 → EUR 15,000 approval-only change; Meridian 7 PASS; Atlas 4 PASS / 1 FAIL / 2 MISSING; mocked policy, analysis, and provider failure paths; print, JSON, Markdown, and CSV.
- Accessibility/responsive: PASS in automated browser checks — keyboard focus, English/French, 1280 × 720, 1440 × 900, 1024 × 768, 390 × 844, effective 200% zoom, reduced motion, and no horizontal overflow.
- Visual review: PASS — three ignored passes under `test-results/verifiable-receipt/`; fixed-header full-page stitching artifacts were replaced with clean component captures.
- Dependencies: unchanged — no package or lockfile modification.
- Ancestry: PASS — `git merge-base --is-ancestor eb120feaca78bf3cdbc71b7b7198045f86a44852 HEAD` returned success.

No live or paid OpenAI request was made. `.env.local` was not opened or read. Generated screenshots, Playwright traces, build output, dependencies, and smoke logs remain ignored and untracked.

## Competition evaluation phase 3 gate — 2026-07-16

Fresh implementation-gate results before the final documentation commit:

- `pnpm test`: PASS — 25 test files, 188 tests, Vitest duration 24.82 s.
- `pnpm typecheck`: PASS — no TypeScript errors.
- `pnpm lint`: PASS — no ESLint errors or warnings.
- `pnpm build`: PASS — compiled in 4.0 s, completed TypeScript in 7.8 s, and produced the unchanged five routes: static `/` and `/_not-found`; dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze`.
- `pnpm test:e2e`: PASS — 23 Chromium tests in 55.5 s.
- `pnpm audit --prod`: PASS — no known production vulnerabilities.
- `pnpm eval:competition`: PASS twice — 3/3 scenarios, 21/21 controls and conclusions, 3/3 profiles, exact evidence, isolation, deterministic reproduction, threshold sensitivity, fingerprints, receipts, 7/7 mutations, 10/10 adversarial cases, zero network calls, zero unexpected failures.
- `pnpm demo:verify`: PASS twice — full evaluation, 3 targeted files / 23 targeted tests, TypeScript, and exact final line `PolicyProof demo verification: PASS`.
- Deterministic reports: PASS — Markdown and JSON Git object hashes remained identical across consecutive runs.
- Production smoke: PASS — `/` and `/api/ai/status` returned 200; `gpt-5.6`, boolean availability, `nosniff`, and `DENY` were verified; port 3400 was released.
- `git diff --check`: PASS.
- Dependencies: no package version or lockfile change; only two necessary package scripts were added.
- Product regression: PASS — Northstar 3/2/1/1 with exact EUR/USD evidence and threshold behavior; Meridian 7 PASS; Atlas 4 PASS / 1 FAIL / 2 MISSING; Focused Demo, Full Workspace, English/French, keyboard, reduced motion, mobile, 200% zoom, print, JSON, Markdown, and CSV paths remain covered by the unchanged 23-test Playwright suite.

The first smoke approach failed before product verification because an extra pnpm argument made Next.js interpret `--port` as a directory. The corrected `Start-Process` server then became ready but was unreachable from the parent PowerShell network context. A same-process Node orchestrator preserved the identical production build, completed both HTTP checks, and released the port. No application change or weakened assertion was required.

No live or paid OpenAI request was made. Historical GPT-5.6 evidence was not rerun. `.env.local` was not opened or read. Evaluation network clients were blocked and recorded zero calls. No new product screen, route, dependency, push, deployment, merge, or publication was introduced.

## Build Week release hardening gate — 2026-07-16

Fresh results after the release tooling, CI, public documentation, runtime metadata, Turbopack root, and stable Vitest concurrency changes:

- `pnpm test`: PASS — 27 test files, 201 tests, Vitest duration 87.46 s. The release environment uses two workers and a 15-second test timeout; no assertion or expected result was removed.
- `pnpm typecheck`: PASS — no TypeScript errors.
- `pnpm lint`: PASS — no ESLint errors or warnings.
- `pnpm build`: PASS — compiled in 22.6 s, completed its TypeScript phase in 8.8 s, and produced five unchanged routes: static `/` and `/_not-found`; dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze`.
- `pnpm test:e2e`: PASS — 23 Chromium tests in 1.8 minutes. The suite covers Northstar, Meridian, Atlas, Focused Demo, Full Workspace, English/French, keyboard, reduced motion, mobile, effective 200% zoom, print, JSON, Markdown, CSV, mocked provider failure, fingerprints, and receipt verification.
- `pnpm audit --prod`: PASS — no known production vulnerabilities.
- `pnpm eval:competition`: PASS twice — 3/3 scenarios, 21/21 controls and conclusions, 3/3 profiles, 34 evidence references, exact excerpts, isolation, deterministic reproduction, threshold sensitivity, fingerprints, receipts, 7/7 mutations, 10/10 adversarial cases, zero attempted external calls, and zero unexpected failures. Markdown and JSON report SHA-256 hashes were identical across both runs.
- `pnpm demo:verify`: PASS — evaluation, 3 targeted files / 23 targeted tests, TypeScript, and exact final line `PolicyProof demo verification: PASS`.
- `pnpm release:docs`: PASS — 60 tracked Markdown files.
- `pnpm release:hygiene`: PASS — 203 tracked files.
- Clean-room verification: PASS — `git archive HEAD`, no `.git` or `.env.local`, 435 locked packages reused with zero downloads, offline frozen install, `demo:verify`, empty-cache production build, provider unavailable without a key, production root 200, and expected security headers. The first successful run took approximately 6 minutes 39 seconds on the slow local Windows filesystem.
- Production smoke: PASS — root returned 200; status returned model `gpt-5.6` and boolean availability; `nosniff`, `DENY`, and `strict-origin-when-cross-origin` were present; the temporary server was stopped.
- Git ancestry: PASS — live GPT-5.6, Focused Verifiability, Verifiable Receipt, and Competition Evaluation source commits are all ancestors.
- Repository scans: PASS — zero tracked forbidden artifacts, zero public personal-path files, no lockfile change, required generated roots ignored, and the only generic secret-scan match is the intentional secret-detection regex in `tests/release-metadata.test.ts`.
- Dependencies: no dependency or lockfile change; package metadata now records the locally validated pnpm 11.9.0 runtime.

Three environmental failures were retained in the release record rather than hidden: the first clean-room launch could not start `pnpm.cmd` directly on Windows; the first extended clean-room attempt exceeded four minutes while still building; and two initial full Vitest attempts encountered worker-start or 5-second UI timeouts after the empty-cache build. The Windows runner now uses explicit `cmd.exe` invocation with constant arguments, Turbopack is rooted at the active repository, and Vitest uses bounded concurrency and a 15-second timeout. The final complete Vitest run passed all 201 unchanged assertions.

`pnpm release:verify` is intentionally run from the clean final commit because it requires both staged and unstaged Git cleanliness. Its final post-commit result is recorded in the release handoff. The registry-dependent production audit and the slower clean-room reconstruction remain separately documented gates.

No live or paid OpenAI request was made. `.env.local` was not opened or read. No API key was displayed. No push, deployment, merge, publication, repository creation, video upload, or Devpost submission occurred.

## Final human-copy gate

Run `pnpm release:copy` after changing visible English or French copy, the public README, or the principal submission documents. The dependency-free checker rejects long dashes, a narrow list of generic AI-marketing phrases, repeated punctuation in audited Markdown, and obvious placeholder copy. `pnpm release:verify` runs this check after documentation-link validation. The allowlist is structural: technical identifiers, code syntax, command flags, hashes, and diagrammatic arrows are outside the audited prose rules.
