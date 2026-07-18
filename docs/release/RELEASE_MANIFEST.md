# PolicyProof release manifest

## Identity

- Project: PolicyProof
- Purpose: OpenAI Build Week 2026, Work & Productivity
- Frozen product source: `1a6db74cef7331a2432b19c0f8bf6a8d894dd4e4`
- Release branch: `release/build-week-submission`
- License: MIT
- Final release commit: reported in the owner handoff to avoid a self-referential commit amendment
- Brand assets: approved tracked files under `public/brand/`
- Brand palette: charcoal `#18222C`, muted teal `#4B837D`, off-white `#F7F6F2`, white `#FFFFFF`
- Desktop identity: horizontal color logo on the light application header
- Compact identity: PolicyProof mark on mobile and receipt surfaces
- Platform metadata: SVG/ICO favicons, Apple and Android icons, and a 1200 x 630 Open Graph image

## Runtime

- Node.js: major 24; locally validated with 24.14.0
- pnpm: 11.9.0
- Install: `pnpm install --frozen-lockfile`
- Deterministic mode: no environment file, API key, browser, or provider required for `pnpm demo:verify`
- Optional live mode: server-only `OPENAI_API_KEY`, explicit user action, fictional text documents only

## Schema versions

- `policyproof.review-fingerprint.v1`
- `policyproof.receipt-integrity.v1`
- `policyproof.decision-receipt.v1`
- `policyproof.competition-evaluation.v1`
- `policyproof.business-rule-mutation.v1`
- `policyproof.adversarial-corpus.v1`

## Controlled outcomes

| Scenario | PASS | FAIL | MISSING | WARNING |
| --- | ---: | ---: | ---: | ---: |
| Northstar | 3 | 2 | 1 | 1 |
| Meridian | 7 | 0 | 0 | 0 |
| Atlas | 4 | 1 | 2 | 0 |

Current automated evidence: **205 Vitest tests**, **23 Playwright tests**, 3 scenarios, 21 conclusions, 34 evidence references, 7 business-rule mutations, and 10 named adversarial cases.

## Expected commands

```shell
pnpm demo:verify
pnpm eval:competition
pnpm release:verify
pnpm audit --prod
pnpm release:clean-room
pnpm dev
```

The first three verification commands make no live provider request. `pnpm audit --prod` is a separate registry-dependent online gate. The clean-room install uses offline mode and an ignored in-repository location.

## Historical live evidence

Northstar's historical live GPT-5.6 evidence is preserved at commit `eb120feaca78bf3cdbc71b7b7198045f86a44852` and documented in `docs/evaluation/LIVE_GPT56_VALIDATION.md`. It is not rerun by release verification. Meridian and Atlas remain deterministic and mocked.

## Known limitations

- One controlled procurement and vendor-change policy domain.
- Three fictional scenarios, not universal coverage.
- Receipt hash is unkeyed and not digitally signed.
- No origin, identity, authorship, authenticity, legal-signature, or trusted-time proof.
- Named adversarial tests demonstrate bounded application behavior, not universal security.
- Text inputs only; no PDF, OCR, ERP, authentication, database, or durable audit store.
- Physical-device, screen-reader, deployed-production, and real print-dialog checks remain owner actions.
- Favicon and social-preview rendering must be confirmed against the deployed public URL.

## Read first

1. `README.md`
2. `docs/CODEX_AND_GPT56_USAGE.md`
3. `docs/EVALUATION_HARNESS.md`
4. `docs/evaluation/COMPETITION_EVALUATION_REPORT.md`
5. `docs/SECURITY_AND_LIMITATIONS.md`
6. `SECURITY.md`
7. `docs/release/CODE_FREEZE.md`
8. `docs/release/PRODUCTION_DEPLOYMENT_RUNBOOK.md`
9. `docs/submission/FINAL_SUBMISSION_CHECKLIST.md`
