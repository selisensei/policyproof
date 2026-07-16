# Verifiable Decision Receipt Model

## 1. Purpose

PolicyProof protects one exact decision-receipt instance with a deterministic, locally recalculable SHA-256 hash. The receipt binds the semantic review fingerprint to the human decisions, reviewer comments, safe audit metadata, language, receipt identifier, and generation timestamp that existed when the receipt was generated.

## 2. Relationship to the Review Fingerprint

The two hashes have different jobs and neither replaces the other:

- **Review Fingerprint** (`policyproof.review-fingerprint.v1`) represents stable semantic review content: policy, enabled controls and parameters, fictional source records and facts, exact evidence references, and deterministic conclusions. Human decisions and receipt timestamps remain excluded.
- **Receipt Integrity Hash** (`policyproof.receipt-integrity.v1`) represents one receipt instance: the Review Fingerprint plus normalized result/evidence references, human decisions, reviewer comments, safe audit entries, receipt metadata, language, identifier, and generation timestamp.

Therefore, changing a human decision or receipt timestamp leaves the Review Fingerprint unchanged but changes the Receipt Integrity Hash.

## 3. Versioned outer structure

```json
{
  "integrity": {
    "version": "policyproof.receipt-integrity.v1",
    "algorithm": "SHA-256",
    "hash": "64 lowercase hexadecimal characters"
  },
  "receipt": {
    "receiptFormatVersion": "policyproof.decision-receipt.v1",
    "producerVersion": "policyproof.app-schema.v1"
  }
}
```

`integrity.hash` is never included in the content it hashes. Unknown fields are rejected by strict Zod schemas.

## 4. Included fields

The canonical receipt payload includes:

- receipt format and producer versions;
- receipt identifier and UTC generation timestamp;
- Review Fingerprint version and value;
- scenario ID and human-readable case reference;
- policy ID and policy version;
- every stable technical control ID, display reference, and title;
- normalized deterministic results, severities, explanations, missing-evidence expectations, and exact evidence references;
- human decision state and exact reviewer comment for every control;
- overall decision status, accepted exceptions, and unresolved findings;
- safe, schema-validated audit entries, limited to the most recent 100;
- receipt language and review run mode;
- the review-aid disclaimer.

## 5. Excluded fields

The payload excludes API keys, environment variables, authorization data, provider payloads, internal stacks, browser metadata, viewport, selected tabs, animation and clipboard state, local paths, document bodies, temporary notifications, and hidden diagnostics. Document contents remain represented by the separate Review Fingerprint rather than duplicated in the receipt.

## 6. Canonicalization rules

Before hashing, PolicyProof:

1. validates the strict receipt schema and cross-references;
2. recursively sorts object keys;
3. normalizes supported timestamps to ISO 8601 UTC;
4. normalizes CRLF and CR line endings to LF while preserving all other comment whitespace;
5. preserves Unicode code points without compatibility normalization;
6. preserves finite numbers, converts negative zero to zero, and rejects `NaN` and infinities;
7. rejects `undefined`, functions, symbols, big integers, non-plain objects, symbol keys, and cycles;
8. serializes deterministic JSON as UTF-8.

## 7. Collection ordering

- controls, results, human decisions, accepted exceptions, and unresolved findings: stable technical control ID;
- evidence within a result: document ID, locator, relationship, excerpt, then evidence ID;
- missing-evidence expectations: expected source, then description;
- audit events: timestamp, action, control ID, then stable event ID.

Array order is preserved only where the schema defines it as meaningful. Ordering assumptions are versioned by `policyproof.receipt-integrity.v1`.

## 8. Timestamp and language behavior

The receipt generation timestamp is part of the hash, so two otherwise identical receipts generated at different instants have different receipt hashes. It remains excluded from the Review Fingerprint. Receipt language is included because it changes the serialized receipt context; changing it changes the receipt hash.

## 9. SHA-256 implementation

PolicyProof uses the native Web Crypto `crypto.subtle.digest("SHA-256", ...)` API with UTF-8 input. Output is exactly 64 lowercase hexadecimal characters. No hashing dependency, secret key, signing service, blockchain, or network request is used.

## 10. Generation flow

After at least one human decision is recorded, the reviewer selects **Generate receipt**. PolicyProof snapshots the current results, decisions, comments, safe audit events, Review Fingerprint, and receipt metadata, validates and canonicalizes the payload, computes SHA-256, and attaches the separate integrity block. Later decision, comment, threshold, or review changes invalidate the displayed generated receipt and require a new generation.

## 11. Local verification flow

The current in-memory receipt or locally selected/pasted JSON is processed only in the browser:

1. parse JSON when applicable;
2. check for an integrity block;
3. check supported receipt and integrity versions;
4. validate the strict outer and payload schemas;
5. isolate the stored hash;
6. reconstruct and canonicalize the receipt payload;
7. recalculate SHA-256;
8. compare exact lowercase hashes;
9. report a safe status.

Imported JSON remains separate from the active case and never replaces scenario or decision state. It is not uploaded.

## 12. Verification states

- **Valid — Receipt integrity verified:** structure and versions are supported and the recalculated hash exactly matches.
- **Modified — Receipt content has changed:** the structure is supported but the hashes differ. PolicyProof does not repair or mark the receipt valid.
- **Unsupported version:** the version is explicit but unsupported. PolicyProof does not attempt migration.
- **Malformed receipt:** JSON or schema validation fails; no stack trace is shown.
- **Missing integrity:** the receipt cannot be integrity-verified and is not incorrectly labelled as modified.

## 13. Threat model

The prototype detects accidental or unsophisticated changes when the stored hash is retained. It helps a reviewer confirm that the exact included receipt content still matches its generation-time digest. SHA-256 is unkeyed: a person who can alter both the content and stored hash can create a new internally consistent digest. Local verification also depends on the integrity of the running application and browser.

## 14. What verification proves

“This confirms that the content included in this receipt has not changed since the receipt was generated. It does not prove authorship, identity, legal signature or trusted timestamping.”

“Cela confirme que le contenu inclus dans ce reçu n’a pas changé depuis sa génération. Cela ne prouve ni l’identité, ni l’auteur, ni une signature juridique, ni un horodatage qualifié.”

The valid state proves only exact equality between the supported canonical receipt payload and its stored digest.

## 15. What verification does not prove

It does not prove identity, authorship, reviewer authority, legal signature, source authenticity, organizational compliance, trusted or qualified time, secure custody, or that a device was uncompromised. It is not a digital/electronic signature, certificate, immutable record, certification, fraud guarantee, blockchain proof, or trusted timestamp.

## 16. Possible production improvements (future work)

Outside this prototype, a separately authorized threat model could consider server-held signing keys, public-key signatures, a trusted timestamp authority, authenticated access control, and durable secure audit storage. None is implemented or claimed in PolicyProof today.

## 17. Competition evaluation assertion

The no-network Competition Evaluation Harness generates one controlled receipt per scenario, verifies its recorded hash, changes receipt content while retaining the old hash, and requires a `MODIFIED` result. It classifies the following as an **EXPECTED SECURITY BOUNDARY**, not a test failure: a party able to alter both receipt content and its unkeyed hash can create a new internally consistent pair. Receipt Integrity establishes no origin, identity, authorship, trusted time, or legal signature.
