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
- Loading, running, filtering, evidence inspection, decision, receipt, rerun, and reset
- English/French selector visibility and immediate translation
- Main navigation, buttons, statuses, validation, accessibility labels, and displayed receipt translation
- Locale changes preserve controls, results, decisions, comments, and exact source evidence
- The document `lang` attribute follows the selected interface locale
- Hydration-safe persisted locale behavior
- Guided-demo progress survives locale changes and reflects real workspace actions
- Live control proposals remain proposed, edited, approved, or rejected through explicit human actions
- Receipt copy and JSON download controls use current structured state

### Browser and responsive behavior

Playwright covers the complete deterministic path, exact currency evidence, override validation, receipt, threshold recalculation, decision reset notice, keyboard navigation, persisted French locale, and absence of main-page horizontal overflow.

Ignored screenshots are generated for:

- English and French at 1440 px;
- English at 1280, 1024, 768, and 390 px;
- French at 390 px;
- mixed-status matrix, evidence inspector, validation error, and decision receipt.
- API unavailable and safely mocked provider-error states.

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
