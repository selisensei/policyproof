# Competition Evaluation Phase Log

## Phase 0 — Baseline validation

- **Objective:** confirm the exact verifiable-receipt baseline, ancestry, clean tree, and complete product behavior before evaluation work.
- **Architecture decision:** branch from `f7641d947e5e33814e7dd8fbcfca90e469799f3c`; preserve the product and live GPT-5.6 integration unchanged.
- **Files changed:** none.
- **Tests run:** 20 files / 161 tests; typecheck; lint; build; 23 Playwright tests; production audit; targeted scenario/provider/fingerprint/receipt contracts; ancestry, ignored-path, secret, personal-path, and whitespace checks.
- **Result:** PASS. The first grouped command exceeded the shell time limit and was rerun gate-by-gate. A PowerShell smoke harness issue was diagnosed later without changing product code.
- **Commit:** none.
- **Compromises:** no live provider validation was attempted; the tracked Northstar result remains historical evidence.

## Phase 1 — Competition Evaluation Harness

- **Objective:** evaluate three scenarios, 21 conclusions, exact evidence, isolation, deterministic reruns, fingerprints, threshold behavior, receipts, mutations, adversarial cases, and network behavior with one local command.
- **Architecture decision:** reuse Vitest as the installed TypeScript runner; import the production engine and schemas directly; use strict versioned Zod contracts; scope fetch and Node HTTP/HTTPS guards to the evaluation; generate deterministic tracked Markdown and JSON reports.
- **Files changed:** evaluation schemas, runner, network guard, evidence validator, report serializer, CLI test, package scripts, deterministic reports, initial harness documentation, scenario semantic validation, and decision log.
- **Tests run:** 5 evaluation files / 18 tests; `pnpm eval:competition`; typecheck; lint; pre-commit scans and whitespace check.
- **Result:** PASS — 3 scenarios, 21 controls/conclusions, 7 mutations, 10 adversarial cases, zero network calls, zero unexpected failures.
- **Commit:** `b284f4759592d4025c0905672b08f9c519eecde4` — `feat: add PolicyProof competition evaluation harness`.
- **Compromises:** the command runs through Vitest rather than a new TypeScript runner, avoiding a dependency and preserving alias resolution.

## Phase 2 — Mutation and adversarial hardening

- **Objective:** make causal rule behavior and hostile-input rejection independently reviewable.
- **Architecture decision:** mutate schema-validated `structuredClone()` copies only; compare all seven statuses by stable technical ID; require six unchanged controls, exact evidence, pending decisions, changed Review Fingerprint, and zero network calls. Keep adversarial fixtures private to tests.
- **Files changed:** strict finite-number/date/source validation, evidence-relationship checks, seven mutation tests, threshold boundaries, ten adversarial assertions, additional rejection tests, and two documentation matrices.
- **Tests run:** 10 focused files / 96 tests; typecheck; lint; pre-commit scans and whitespace check.
- **Result:** PASS after one meaningful correction. A first duplicate-evidence assertion incorrectly treated legitimate cross-control fact reuse as a duplicate. It now rejects duplicates only within one control result and explicitly tests valid cross-control reuse.
- **Commit:** `d9718b0441cb266d20033302d1a84b5683151e47` — `test: add business rule mutation and adversarial coverage`.
- **Compromises:** the corpus proves only ten named local boundaries, not universal prompt-injection or application-security resistance.

## Phase 3 — Verification workflow and release evidence

- **Objective:** give a technical judge one documented command and align repository, submission, security, and release claims.
- **Architecture decision:** `pnpm demo:verify` runs the full evaluation, 23 focused evaluation tests, and TypeScript without a browser, server, key, environment file, or provider request. Keep the product UI unchanged and retain the existing 23 browser regressions.
- **Files changed:** README, plan, testing strategy, architecture, data dictionary, security/limitations, receipt model, scenario matrix, Devpost draft, video script, runbook, judge Q&A, screenshot plan, evaluation documentation, and this log.
- **Tests run:** 25 files / 188 tests; typecheck; lint; production build; 23 Playwright tests; production audit; two `eval:competition` runs; two `demo:verify` runs; deterministic report hashes; production smoke; ancestry, secret, path, ignored-file, dependency, and whitespace checks.
- **Result:** PASS. The product route list and browser suite remain unchanged. No product screenshot was required because no visible product change occurred.
- **Commit:** `docs: finalize PolicyProof verification workflow` (this checkpoint; full hash reported in the final handoff).
- **Compromises:** terminal screenshots were unnecessary; existing product captures remain the public plan. Physical-device and screen-reader verification remain supervised release tasks.

## Rejected additions

- No evaluation UI, dashboard, score, fourth scenario, second policy domain, parser, background service, telemetry, signing system, or external benchmark.
- No dependency, API call, deployment, push, merge, publication, or Git-history rewrite.

## Stop condition

The phase stops after the third local commit and final clean-tree verification. Code freeze, release preparation, GitHub, Vercel, production captures, video recording, `/feedback`, and Devpost submission require separate authorization.
