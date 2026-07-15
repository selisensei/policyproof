# Review Fingerprint Model

## 1. Purpose

The Review Fingerprint lets PolicyProof demonstrate that the same normalized policy, controls, source records, extracted facts, evidence references, and deterministic conclusions produce the same compact digest. It supports reproducibility checks; it does not replace the human decision or receipt.

## 2. Schema version

The strict Zod payload identifier is `policyproof.review-fingerprint.v1`. The version is required and is included in the digest so a future schema change cannot be mistaken for the same semantic contract.

## 3. Semantic fields included

The payload includes the scenario ID, case reference, policy ID, policy version, normalized policy content, enabled control definitions, stable control IDs, control kinds, severity, deterministic parameters, active approval threshold, approval currency, required approver count, source document IDs, titles, types and content, structured facts, deterministic results, explanations, missing-evidence requirements, exact evidence excerpts, document IDs, fact IDs, locators, evidence relationships, and stable evidence-validation state.

## 4. Volatile fields excluded

The model excludes timestamps, current time, locale, selection, search, filters, tabs, scroll, viewport, animation, browser metadata, guided progress, notifications, copy feedback, unrelated audit events, human decisions, reviewer comments, and receipt metadata. The builder accepts only the explicit semantic input contract; extra presentation fields do not enter the payload.

## 5. Canonicalization rules

Object keys are sorted recursively. Strings use LF line endings. Finite numbers remain JSON numbers and negative zero becomes zero. Booleans and `null` remain unchanged. Valid `Date` instances become UTC ISO 8601 strings. Plain objects and arrays are supported; unsupported runtime values fail closed.

## 6. Collection ordering rules

Enabled controls are sorted by control ID. Documents are sorted by document ID. Facts are sorted by fact key, source locator, then fact ID. Results are sorted by control ID. Evidence is sorted by document ID, locator, relationship, exact excerpt, then evidence ID. Missing-evidence entries are sorted by expected source then description. Arrays whose order carries value data, such as a fact containing an approver list, are not reordered.

## 7. Line-ending and Unicode handling

CRLF and lone CR line endings become LF before serialization. Unicode text is encoded as UTF-8 without NFC or NFD normalization. Preserving the original code points avoids silently changing exact source meaning; visually similar but code-point-different content therefore produces a different fingerprint.

## 8. SHA-256 implementation

`computeReviewFingerprint()` serializes the canonical payload to deterministic JSON, encodes it with `TextEncoder`, and calls the native Web Crypto `crypto.subtle.digest("SHA-256", ...)`. The result is a lowercase 64-character hexadecimal string. No key, salt, Node-only client import, or hashing dependency is used.

## 9. Same-input reproducibility

`Rerun deterministic checks` reuses the currently enabled controls, current parameters, current structured documents, and the shared TypeScript review engine. When normalized inputs and all seven conclusions match, PolicyProof keeps the current results, decisions, comments, receipt state, selection, filters, and locale, then reports an unchanged fingerprint.

## 10. Changed-input behavior

When the Northstar approval threshold changes from EUR 10,000 to EUR 15,000, the input comparison changes, `CTRL-APPROVAL` (`CTRL-01` in the presentation) changes from FAIL to PASS, six controls remain unchanged, and the fingerprint changes. The candidate results become current and the established rerun behavior resets human decisions that could no longer match the review.

## 11. Unexpected-divergence behavior

If normalized inputs match but normalized conclusions or the fingerprint differ, PolicyProof reports an unexpected deterministic divergence. It keeps the current validated results and the candidate result set separately in memory, lists changed control IDs and status pairs, records a bounded safe audit event, and recommends human inspection. It does not silently overwrite the current review or claim reproducibility.

## 12. What the fingerprint proves

Within this implementation, an unchanged digest demonstrates that the canonical review payload supplied to SHA-256 was byte-for-byte identical. Together with the displayed comparison, it supports the claim that the same normalized review inputs, evidence, and deterministic conclusions were reproduced.

## 13. What it does not prove

The fingerprint does not prove identity, authorship, authorization, legal signature, trusted time, source-document authenticity, organizational compliance, or that a browser or device was uncompromised. It is not described as immutable, certified, signed, legally binding, unforgeable, or fraud-proof.

## 14. Distinction from future receipt-integrity verification

The Review Fingerprint intentionally excludes human decisions, reviewer comments, receipt metadata, and timestamps. A separate future phase may define a receipt-integrity hash and local verification for those fields. No receipt hash or receipt verification exists in this phase.

## 15. Security boundaries

The model uses only current local application state and fictional controlled data. It makes no provider request and contains no secret. Evidence is marked verified only when the referenced document, fact ID, exact excerpt, and locator match the current structured source. SHA-256 detects changed canonical content but cannot establish why it changed or whether the original content was truthful.

## 16. Production improvements

A production version could store immutable schema documentation, publish cross-runtime test vectors, bind canonical source-file digests to an ingestion pipeline, isolate worker execution, add durable access-controlled audit storage, and independently verify receipt integrity. Those changes require a separate threat model and are outside this prototype phase.
