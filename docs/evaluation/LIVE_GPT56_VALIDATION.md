# Live GPT-5.6 Validation

## Outcome

**PASS** — PolicyProof completed one controlled end-to-end GPT-5.6 validation with the fictional Northstar Facilities case. GPT-5.6 compiled the policy into seven human-reviewed controls and extracted evidence from five fictional text documents. The production TypeScript engine then produced the expected seven results, and the saved live response was replayed through the interface with a human decision and decision receipt.

This result validates one narrow demonstration case. It does not prove general model accuracy or suitability for real business documents.

## Validation scope

- Date: 2026-07-14
- Branch: `feat/live-gpt-validation`
- Validation commit: `eb120feaca78bf3cdbc71b7b7198045f86a44852` (`test: validate live GPT-5.6 evidence pipeline`)
- Application baseline used for the supervised run: `76c6ce62a0fdbefa721e40d6f321fcea4b9e8db4` (`feat: redesign PolicyProof judge experience`)
- Model: `gpt-5.6`
- Reasoning effort: `low`
- SDK retries: `0`
- Data: five repository-controlled fictional Northstar documents only
- Provider request budget: four total requests, fully consumed; no further live request was made

## Provider request history

| Request | Operation | Result | Safe observation |
| --- | --- | --- | --- |
| 1 | Policy compilation | HTTP 401 | The original local credential was rejected. No retry was made. |
| 2 | Policy compilation | HTTP 200 | Seven structured controls were returned in 16,139 ms and reviewed before approval. |
| 3 | Case analysis | HTTP 200 | The route completed in approximately 30 seconds, but the first browser interception closed before its asynchronous response body was persisted. No retry was made at that time. |
| 4 | Final case analysis | HTTP 200 | Five document findings were captured and persisted in 23,054 ms by the corrected direct-route harness. |

A separate local TypeScript loader error occurred before request 4. It failed before `main()` ran, the local server observed zero analysis POSTs, and no provider request was consumed. The unsupported syntax was corrected and the harness was loaded without executing it before the final request.

## Human-approved controls

The successful policy compilation initially returned every proposal disabled. The reviewer explicitly enabled and approved these seven controls before analysis:

| ID | Control | Deterministic type |
| --- | --- | --- |
| PVC-001 | Two approvers above EUR 10,000 | `APPROVAL_THRESHOLD` |
| PVC-002 | Purchase order predates invoice | `PO_BEFORE_INVOICE` |
| PVC-003 | Purchase order and invoice amount match | `AMOUNT_MATCH` |
| PVC-004 | Purchase order and invoice currency match | `CURRENCY_MATCH` |
| PVC-005 | Delivery evidence exists | `DELIVERY_EVIDENCE` |
| PVC-006 | Independent verification of bank-details changes | `BANK_CHANGE_VERIFICATION` |
| PVC-007 | Initiator and approver segregation | `SEGREGATION_OF_DUTIES` |

The approved identifiers and exact fictional inputs are version-controlled as a validation fixture. The full final analysis response remains ignored under `test-results/live-gpt56/`.

## Capture integrity

- Saved artifact: `test-results/live-gpt56/final-case-analysis.json` (ignored)
- Size: 9,270 bytes
- SHA-256: `d8b2102c9ef42d6c9238c009b2c41f3fc9e112ec4ce363de68e006f3572dce79`
- HTTP status: 200
- Measured route latency: 23,054 ms
- Findings: 5
- Evidence items: 14
- Persisted shape: allowlisted PolicyProof structured-analysis fields only
- Provider-private metadata, headers, credentials, request bodies, and environment values: not persisted
- Successful-response request or correlation ID: not exposed by the current PolicyProof success response

The corrected harness awaits the complete response body and the artifact write before cleanup. A regression test simulates a 30-second response and proves the order `response -> persist -> cleanup`.

## Evidence validation

Independent reload and Zod validation confirmed:

- exactly one finding for each of the five submitted documents;
- every finding identifier, filename, and inferred type matches its source;
- all 14 exact excerpts occur verbatim in the corresponding source content;
- all 14 source locators are `Document text` or exact text present in the source;
- all evidence identifiers are unique;
- all required facts have the expected fictional values;
- no unknown document identifier or invented excerpt is accepted;
- control-relation text either names a known control or is deterministically compatible with its fact key.

The live response used explanatory relation text rather than stable control IDs. This is valid under the production schema, which defines `relationToControl` as non-empty explanatory text. The validator therefore checks fact-key compatibility and still rejects unrelated text or unknown pseudo-control references.

## Extracted facts

| Source | Fact | Value | Evidence classification |
| --- | --- | --- | --- |
| Purchase order | `supplierName` | Northstar Facilities Ltd. | Supporting |
| Purchase order | `purchaseOrderAmount` | 12480 | Supporting |
| Purchase order | `purchaseOrderCurrency` | EUR | Supporting |
| Purchase order | `purchaseOrderDate` | 2026-07-03 | Supporting |
| Invoice | `supplierName` | Northstar Facilities Ltd. | Supporting |
| Invoice | `invoiceAmount` | 12480 | Supporting |
| Invoice | `invoiceCurrency` | USD | Contradictory |
| Invoice | `invoiceDate` | 2026-07-05 | Supporting |
| Delivery note | `deliveryEvidenceExists` | true | Supporting |
| Delivery note | `deliveryDate` | 2026-07-04 | Supporting |
| Approval workflow | `initiator` | Emma Reed | Supporting |
| Approval workflow | `approvers` | Emma Reed only | Contradictory |
| Vendor change | `bankDetailsChanged` | true | Supporting |
| Vendor change | `independentBankVerificationExists` | false | Contradictory |

## Deterministic results

The saved GPT-5.6 extraction was mapped through the same production mappers used by the interface and evaluated by `runDeterministicReview()`.

| Control | Expected | Observed | Result |
| --- | --- | --- | --- |
| PVC-001 — Approval threshold | FAIL | FAIL | Match |
| PVC-002 — Purchase order timing | PASS | PASS | Match |
| PVC-003 — Amount match | PASS | PASS | Match |
| PVC-004 — Currency match | FAIL | FAIL | Match |
| PVC-005 — Delivery evidence | PASS | PASS | Match |
| PVC-006 — Bank-change verification | MISSING | MISSING | Match |
| PVC-007 — Segregation of duties | WARNING | WARNING | Match |

Summary: **3 PASS, 2 FAIL, 1 MISSING, 1 WARNING**.

## Interface and human review

The captured response was replayed through the real React workspace with provider calls replaced by local saved responses. The test confirmed:

- seven proposals remain unapproved until the reviewer enables and approves them;
- the interface shows all seven expected statuses;
- the EUR purchase-order excerpt and USD invoice excerpt are visible for the currency failure;
- the reviewer can confirm the original `FAIL` without replacing it;
- the reviewer comment appears in the Live-mode decision receipt;
- exactly three local fetches are used by the replay: status, saved compilation, and saved analysis.

## Verification gates

All final release gates passed after this report was created:

- `pnpm test`: PASS — 13 files, 81 tests, including independent artifact reload and interface replay
- `pnpm typecheck`: PASS — no TypeScript errors
- `pnpm lint`: PASS — no ESLint errors or warnings
- `pnpm build`: PASS — static `/` plus dynamic status, policy, and analysis routes
- `pnpm test:e2e`: PASS — 4 Chromium tests; the live artifact remained present after Playwright cleanup
- `pnpm audit --prod`: PASS — no known production vulnerabilities
- `git diff --check`: PASS — no whitespace errors; Windows line-ending notices are informational
- Production HTTP smoke test: PASS — `/` returned 200, status reported `gpt-5.6` available, security headers were present, and port 3200 was released
- Secret-pattern and public local-path scan: PASS
- Ignored-file and staged-file reviews: PASS

## Limitations

- This is one controlled fictional case, not a benchmark or a production accuracy evaluation.
- The deterministic engine supports the seven implemented control types only.
- Relation text is explanatory prose, not a stable foreign-key relationship to a control.
- The successful API response does not currently expose a provider request ID to the local capture harness.
- The full live artifact is intentionally ignored and is not part of the commit.
- No real customer data, confidential document, payment decision, legal conclusion, or compliance certification was used or produced.
