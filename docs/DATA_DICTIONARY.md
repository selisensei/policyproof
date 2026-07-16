# PolicyProof Data Dictionary

## Core entities

### ReviewScenario

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | slug string | Stable scenario and local-history namespace. |
| `caseName` / `caseDescription` / `purpose` | localized text | English/French controlled-case context. |
| `profile` | enum | Mixed-risk, mostly compliant, or evidence-deficient test profile. |
| `caseReference` / `policyReference` | string | Stable presentation references. |
| `policy` | PolicyDefinition | Policy shared by the scenario controls. |
| `controls` | ControlDefinition[] | Inputs to the single deterministic engine. |
| `documents` | CaseDocument[] | Fictional exact-source fixture records. |
| `expectedOutcomes` / `expectedOutcomeCounts` | validation-only values | Regression assertions; never used as displayed review results. |
| `evidenceRelationships` | relationship[] | Expected control-to-document traceability for fixture validation. |
| `thresholdParameters` | object | Default and optional comparison threshold. |
| `guidedDemo` | object | Default finding and scenario-specific proof moments. |
| `assumptions` / `limitations` | localized text | Transparent controlled-test design boundaries. |
| `provenance` | object | Confirms deterministic fictional data and no real organization data. |

Scenario validation enforces unique control, document, and fact identifiers; matching policy/control references; known evidence relationships; complete expected validation outcomes; internally consistent counts; and verbatim fact excerpts. Expected values validate fixtures but do not participate in review calculation.

### PolicyDefinition

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | string | Stable internal policy identifier. |
| `title` | string | Source policy title. |
| `version` | string | Policy version shown in the receipt. |
| `text` | string | Complete source policy text. |
| `controlIds` | string[] | Controls expected from the policy. |

### ControlDefinition

All controls include `id`, `title`, `description`, `severity`, `enabled`, `kind`, and typed `parameters`. Supported kinds are approval threshold, PO-before-invoice, amount match, currency match, delivery evidence, bank-change verification, and segregation of duties.

### CaseDocument

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | string | Stable source identifier such as `DOC-PO-1042`. |
| `title` | string | Human-readable fictional filename/title. |
| `type` | enum | Purchase order, invoice, delivery note, workflow, or vendor change. |
| `content` | string | Fictional source text used for exact-excerpt validation. |
| `facts` | ExtractedFact[] | Structured values and source citations. |

### ExtractedFact

Each fact has an ID, key, value, locator, exact excerpt, optional semantic confidence, optional evidence type, and optional control-relation explanation. Confidence is retained in the validated data contract but is not displayed as evidence quality.

### ControlResult

| Field | Type | Purpose |
| --- | --- | --- |
| `controlId` | string | Links the result to one control. |
| `title` | string | Stable fallback title. |
| `status` | enum | PASS, FAIL, MISSING, or WARNING. |
| `explanation` | string | Deterministic conclusion explanation. |
| `severity` | enum | LOW, MEDIUM, HIGH, or CRITICAL. |
| `supportingEvidence` | EvidenceReference[] | Evidence supporting the conclusion. |
| `contradictoryEvidence` | EvidenceReference[] | Evidence contradicting the requirement. |
| `missingEvidence` | MissingEvidence[] | Required evidence not available. |
| `reviewerDecision` | ReviewDecision | Human state and comment, stored separately. |

### ReviewDecision

States are PENDING, CONFIRMED, REJECTED, and ACCEPTED_EXCEPTION. Rejecting or accepting an exception requires a non-empty comment.

### RunSnapshot

The local comparison snapshot contains `scenarioId`, `id`, `generatedAt`, `threshold`, `summary`, and a control-ID-to-status map. Storage keys are isolated by scenario ID. The snapshot deliberately excludes source content and human comments.

### ReviewFingerprintPayload

| Field | Type | Purpose |
| --- | --- | --- |
| `schemaVersion` | literal | Required `policyproof.review-fingerprint.v1` contract identifier. |
| `scenarioId` / `caseReference` | string | Stable case identity. |
| `policy` | object | Policy ID, version, and normalized source content. |
| `approvalParameters` | object | Active threshold, EUR currency, and required approver count. |
| `controls` | enabled control[] | Stable definitions, kinds, severity, and deterministic parameters. |
| `documents` | document[] | Stable source IDs, types, normalized content, and structured facts. |
| `results` | normalized result[] | Status, explanation, missing requirements, exact evidence, relationship, locator, and validation state. |

Controls, documents, facts, results, evidence, and missing requirements use documented semantic ordering. Object keys are recursively sorted, CRLF/CR becomes LF, finite numbers remain locale-neutral JSON numbers, dates become ISO 8601, and Unicode code points are preserved before UTF-8 serialization. Human decisions, comments, timestamps, locale, selection, search, filters, audit events, and receipt metadata are excluded.

## Status meanings

- **PASS:** available evidence supports the control.
- **FAIL:** evidence contradicts the control or proves non-compliance.
- **MISSING:** required evidence is absent.
- **WARNING:** evidence requires professional judgment or shows an ambiguous workflow.

## Northstar reference values

| Fact | Value | Source |
| --- | --- | --- |
| Purchase order amount | 12,480 | PO-1042 |
| Purchase order currency | EUR | PO-1042 |
| Invoice amount | 12,480 | INV-8821 |
| Invoice currency | USD | INV-8821 |
| Purchase order date | 2026-07-03 | PO-1042 |
| Delivery date | 2026-07-04 | DN-447 |
| Invoice date | 2026-07-05 | INV-8821 |
| Required approvers | 2 | Policy/control parameter |
| Recorded approvers | 1 | WF-209 |
| Bank details changed | true | VC-031 |
| Independent verification exists | false | VC-031 |

## Presentation rules

Stable IDs and exact excerpts are never translated. Interface labels, explanations, statuses, and receipt structure are localized. Evidence coverage states are supporting, contradictory, missing, and not applicable; they are relationships, not confidence scores.
# Control identity contract

PolicyProof keeps three control identity concepts separate:

- `controlId` is the stable technical identifier used by the engine, evidence relationships, Review Fingerprint, audit metadata, and joins. Example: `CTRL-APPROVAL`.
- `displayReference` is the human-readable reference shown in the interface and preserved beside the stable ID in receipts and exports. Example: `CTRL-01`.
- `title` is the localized user-facing label. Example: `Approval threshold` or `Seuil d’approbation`.

The shared mapping is defined in `src/domain/control-references.ts`. The seven deterministic controls have unique registered display references. A provider-generated or otherwise unregistered control safely uses its stable ID as its display reference and is marked as an unmapped fallback by the resolver. No technical ID is renamed. The Review Fingerprint continues to hash stable IDs; derived display references do not change its semantic payload.

## Verifiable receipt fields

| Field | Meaning |
| --- | --- |
| `integrity.version` | Receipt integrity contract; currently `policyproof.receipt-integrity.v1`. |
| `integrity.algorithm` | Native unkeyed `SHA-256`. |
| `integrity.hash` | Lowercase 64-character digest, stored outside the hashed payload. |
| `receipt.receiptFormatVersion` | Exact receipt serialization contract; currently `policyproof.decision-receipt.v1`. |
| `receipt.reviewFingerprint` | Version and digest of stable semantic review content. |
| `receipt.controls` | Stable technical ID, display reference, and title for each control. |
| `receipt.results` | Normalized deterministic conclusions and exact evidence references. |
| `receipt.humanDecisions` | Decision state and exact reviewer comment for each control. |
| `receipt.decisionStatus` | `IN_PROGRESS` while any control is pending; otherwise `COMPLETE`. |
| `receipt.auditTrail` | At most 100 strict safe metadata events; never document bodies or provider payloads. |
| `receipt.generatedAt` | UTC generation time; intentionally changes the receipt hash. |

## Competition evaluation entities

| Entity | Version | Purpose |
| --- | --- | --- |
| `CompetitionEvaluation` | `policyproof.competition-evaluation.v1` | Stable aggregate of scenario, conclusion, evidence, isolation, fingerprint, receipt, mutation, adversarial, historical-evidence, warning, failure, and overall results. |
| `BusinessRuleMutationCase` | `policyproof.business-rule-mutation.v1` | One cloned-input business fact change with one expected changed control, six unchanged controls, status transition, evidence expectation, and fingerprint behavior. |
| `AdversarialCase` | `policyproof.adversarial-corpus.v1` | One fictional hostile or malformed input with explicit validation, engine, evidence, and UI-safe expectations. |

Evaluation statuses distinguish executed deterministic checks from `HISTORICAL_EVIDENCE`. Reports contain no runtime timestamp, local path, environment value, provider payload, or confidence score.
