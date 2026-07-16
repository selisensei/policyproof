# PolicyProof code freeze

## Frozen baseline

Product behavior is frozen from source commit `1a6db74cef7331a2432b19c0f8bf6a8d894dd4e4` on the validated `feat/competition-evaluation` branch. Release preparation continues on `release/build-week-submission` without changing deterministic business behavior.

Frozen schema versions:

- `policyproof.review-fingerprint.v1`
- `policyproof.receipt-integrity.v1`
- `policyproof.decision-receipt.v1`
- `policyproof.competition-evaluation.v1`
- `policyproof.business-rule-mutation.v1`
- `policyproof.adversarial-corpus.v1`

Frozen scenario profiles:

| Scenario | PASS | FAIL | MISSING | WARNING |
| --- | ---: | ---: | ---: | ---: |
| Northstar | 3 | 2 | 1 | 1 |
| Meridian | 7 | 0 | 0 | 0 |
| Atlas | 4 | 1 | 2 | 0 |

At freeze, the repository passed 188 Vitest tests and 23 Playwright tests, plus typecheck, lint, production build, production dependency audit, production smoke, `pnpm eval:competition`, and `pnpm demo:verify`.

## Allowed post-freeze changes

- Confirmed release-blocking bug fixes.
- Documentation, licensing, repository-hygiene, CI, environment, and deployment corrections.
- Accessibility corrections that do not alter business behavior.
- Security corrections that do not broaden product scope.

## Prohibited post-freeze changes

- New product functionality, scenario, policy domain, AI call, business rule, visualization, or export.
- Broad refactors or dependency additions without an unavoidable release-critical reason.
- Changes to the validated scenario outcomes, evidence rules, Review Fingerprint, Receipt Integrity, mutation expectations, or adversarial assertions.

## Escalation rule

Any proposed product change requires an identified release-blocking defect, a focused regression test, a documented impact assessment, and explicit owner approval before implementation. Release preparation alone is not authority to modify product behavior.
