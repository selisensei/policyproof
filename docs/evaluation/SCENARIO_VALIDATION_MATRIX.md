# PolicyProof Scenario Validation Matrix

## Purpose

This matrix documents the three controlled fictional procurement profiles used to verify that PolicyProof runs one shared policy, control engine, evidence model, review interface, and human-decision workflow. Expected outcomes are test assertions only. The interface calculates results from scenario documents and controls at runtime.

## Validation levels

- **Deterministic fixture validation:** exact version-controlled facts are evaluated by the shared TypeScript engine.
- **Mocked GPT validation:** API contracts, structured outputs, evidence rejection, and provider failures are exercised without a provider request.
- **Real GPT-5.6 validation:** one supervised paid request path was previously validated and recorded in the sanitized Northstar report.

| Scenario | Purpose | Documents | Expected runtime profile | Evidence characteristics | Chronology | Threshold behavior | Validation level |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| Northstar Facilities — Mixed-Risk Case | Demonstrate all four statuses and a threshold-sensitive conclusion. | 5 | 3 PASS · 2 FAIL · 1 MISSING · 1 WARNING | Exact EUR/USD contradiction, one recorded approver, missing independent bank verification, same initiator and approver. | PO 3 July, delivery 4 July, invoice 5 July 2026. | Approval FAIL at EUR 10,000; PASS at EUR 15,000. | Deterministic, mocked, and real GPT-5.6 validated. |
| Meridian Office Services — Clean Procurement Case | Demonstrate a complete below-threshold file through the same engine. | 5 | 7 PASS | Matching EUR 8,750 records, delivery evidence, no bank change, independent initiator and approver. | PO 10 August, delivery 11 August, invoice 12 August 2026. | Approval count rule is not triggered at EUR 10,000. | Deterministic and mocked only; no live request. |
| Atlas Workplace Supply — Incomplete Evidence Case | Demonstrate explicit evidence gaps without fabricating a source. | 5 | 4 PASS · 1 FAIL · 2 MISSING | One approver above threshold, missing delivery note, bank change without independent verification, matching EUR 18,400 records. | PO 1 September and invoice 4 September 2026; delivery source intentionally absent. | Approval FAIL at EUR 10,000; the comparison threshold is EUR 20,000. | Deterministic and mocked only; no live request. |

## Control coverage

All scenarios use the same seven supported control kinds:

1. approval threshold and approver count;
2. purchase-order timing;
3. amount equality;
4. currency equality;
5. delivery-evidence presence;
6. independent verification after a bank change;
7. segregation of duties.

No scenario-specific engine exists. `runDeterministicReview()` receives cloned controls and documents from the selected strict `ReviewScenario`.

## Evidence verification

Every fixture fact excerpt must occur verbatim in its source document. Scenario validation rejects duplicate document or fact identifiers, unknown control or document relationships, mismatched policy controls, inconsistent expected counts, and non-verbatim excerpts. A missing source remains a structured missing-evidence item; PolicyProof does not create an excerpt for it.

## Automated checks

- `tests/scenarios.test.ts` validates all three schemas, runtime outcomes, evidence coverage, chronology, receipts, malformed data, and stale-state reset.
- `tests/review-engine.test.ts` protects the shared rule semantics.
- `tests/workspace-ui.test.tsx` verifies selection, destructive-switch confirmation, language preservation, Judge Mode, comparison, evidence trust, and receipts.
- `tests/e2e/competition-hardening.spec.ts` runs Meridian, Atlas, scenario switching, Judge Mode, keyboard/mobile behavior, and the screenshot matrix.
- Existing mocked OpenAI suites protect compilation, extraction, exact evidence, and safe provider failure behavior without a live request.
- `tests/review-fingerprint.test.ts` verifies canonical ordering, date and line-ending handling, Unicode preservation, unsupported-value rejection, semantic mutations, 64-character SHA-256 output, 7/7 same-input reproduction, one-control threshold change, and divergence classification.
- `tests/review-fingerprint-panel.test.tsx` verifies safe unexpected-divergence disclosure with current and candidate conclusions.
- `tests/e2e/focused-verifiability.spec.ts` verifies Focused Demo, exact EUR/USD evidence, unchanged and changed fingerprints, decision preservation/reset, Full Workspace state, four-stage Judge Mode, English/French, mobile, keyboard, reduced motion, zoom reflow, and no provider analysis or policy request.

## Manual checks

- Verify the Case Library does not reveal outcome counts before a run.
- Run each case and compare the displayed counts with this matrix.
- Confirm Northstar EUR/USD excerpts, Meridian matching evidence, and Atlas missing delivery/bank evidence.
- Confirm a human decision is required and appears beside the unchanged automated conclusion.
- Switch scenarios after a decision and verify the confirmation and complete volatile-state reset.
- Inspect comparison labels: current-session results only, no score or ranking.

## Known limitations

The matrix covers one fictional procurement policy, three controlled profiles, five text documents per profile, and seven rule types. It is not evidence of cross-industry generalization, production model accuracy, legal compliance, or support for arbitrary document formats. Meridian and Atlas were not sent to GPT-5.6 during competition hardening.
