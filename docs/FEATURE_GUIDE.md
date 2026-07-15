# PolicyProof Feature Guide

## Product shell

The compact Proofroom shell has two presentation levels over one state owner. Focused Demo is the Northstar-first judge and video path. Full Workspace keeps the five-step workflow, Case Library, analytics, audit, comparison, exports, and detailed registers. English and French or presentation level can be switched without resetting the current review.

## Policy

The policy folio presents the complete fictional procurement policy with stable requirement references. Deterministic mode loads the version-controlled fixture. Live mode can ask GPT-5.6 to propose structured controls, but proposals remain unapproved until a human reviews them.

## Controls

The control register shows title, severity, method, required evidence, state, and enabled status. The approval threshold is editable. User-facing method labels are:

| English | French | Meaning |
| --- | --- | --- |
| Deterministic check | Contrôle déterministe | TypeScript evaluates structured facts. |
| Semantic extraction | Extraction sémantique | GPT-5.6 extracts a fact or excerpt. |
| Hybrid review | Revue hybride | GPT-5.6 extraction feeds deterministic evaluation. |

## Case documents

The deterministic case includes a purchase order, invoice, delivery note, approval workflow, and vendor-change request. Live mode accepts fictional `.txt`, `.md`, and `.json` files within documented count and size limits. PDF and OCR are not supported.

## Case Overview

After a run, Case Overview shows exceptions, decisions remaining, control and document counts, method, threshold, and run time. It contains actual case facts only and is deliberately not a KPI dashboard.

## Outcome Composition

The stacked horizontal bar represents the exact PASS, FAIL, MISSING, and WARNING counts. Each segment and text label is a filter control. Status remains understandable through words and glyphs, not color alone.

## Evidence Coverage Map

Rows are controls and columns are case documents. Cells show:

- `+` supporting evidence;
- `×` contradictory evidence;
- `○` required evidence missing from the linked case record;
- `—` not applicable.

Cells are keyboard-focusable when actionable and open the corresponding control. On mobile, document headings remain above a grouped five-cell row for each control.

## Chronology

The chronology uses three structured facts: purchase order on 3 July 2026, delivery on 4 July, and invoice on 5 July. Selecting an event opens the timing control. Mobile uses the same ordered vertical list.

## Threshold Sensitivity

At desktop size, a compact number line compares amount and threshold. On mobile, it becomes two stacked fact rows to prevent overlap. The explanatory sentence also states required and recorded approver counts. Changing EUR 10,000 to EUR 15,000 demonstrates a real deterministic FAIL-to-PASS change.

## Run Comparison

PolicyProof stores a versioned, minimal snapshot for the latest and previous run in local browser storage. It contains run ID, timestamp, threshold, result counts, and control statuses—no policy text, document contents, evidence excerpts, comments, or provider payloads. The reviewer can clear history. If storage is blocked, the application continues without comparison.

## Review Fingerprint and deterministic rerun

Each deterministic review has a strict `policyproof.review-fingerprint.v1` semantic payload and a native SHA-256 digest. **Rerun deterministic checks** uses the same approved controls, current structured documents, current parameters, and shared TypeScript engine. Identical inputs reproduce all conclusions, preserve decisions, comments, selection, filters, and receipt state, and keep the digest. A changed threshold applies the established decision reset and displays the exact control diff. Same-input divergence preserves current and candidate conclusions for inspection.

The main UI abbreviates the digest and provides copy plus full disclosure. The digest excludes timestamps, locale, search, filters, selection, audit events, human decisions, comments, and receipt metadata. It does not prove identity, authorship, signature, or trusted time.

## Local search

Search covers control IDs, localized control titles, statuses, reviewer states, comments, document names, fact IDs, and exact evidence excerpts. Selecting a match opens the related control. No remote request is made.

## Evidence Integrity

The inspector and Decision step show whether exact excerpts were verified, required evidence is missing, or a reference was rejected. This replaces arbitrary confidence display with a source-validation signal.

## Reviewer Queue

The queue prioritizes unresolved FAIL, MISSING, WARNING, then PASS results; severity breaks ties. Completed items remain available after unresolved work. Previous and next-unresolved actions are available without bulk approval.

## Decision and receipt

The reviewer can confirm, reject, or accept an exception. Overrides require a comment. The receipt preserves original conclusions, reviewer decisions, comments, counts, mode, language, timestamp, and disclaimer. It supports print, JSON download, Markdown download, receipt-ID copy, and concise-summary copy.

## Safe feedback

Empty, validation, loading, missing-configuration, provider authentication, permission, quota, rate-limit, timeout, connection, refusal, malformed-output, and schema failures have safe user-facing handling. Provider details and credentials remain server-side.

## Case Library

The compact bilingual register selects Northstar, Meridian, or Atlas. It shows purpose, policy version, document count, profile, fictional-data provenance, assumptions, simplifications, and intentional gaps without revealing result counts before a run. Switching after a human decision requires confirmation and clears volatile review state while preserving language.

## Scenario comparison

The optional comparison includes only cases run during the current browser session. It shows the four outcome counts, open human decisions, and exact-source verification coverage. It has no score, ranking, or precomputed fixture row. Selecting the current case returns to its Review surface; selecting another case applies the normal safe reset.

## Judge Mode and architecture

Judge Mode is a four-stage bilingual manual guide over the production workspace: Run the review, Inspect the evidence, Reproduce the result, and Record the decision. It cannot call GPT-5.6, run a review, change a threshold, or record a decision. The architecture explanation describes the validated split: GPT-5.6 interprets and extracts, TypeScript checks objective rules, and a human confirms, rejects, or accepts an exception.

## Evidence trust and audit trail

The evidence inspector explains why an exact reference is trusted, why a required source is missing, or why a reference is rejected. The optional session audit trail records safe timestamps, actions, scenario IDs, optional control IDs, and short descriptions—never document bodies or provider payloads. It can be cleared and is included in JSON receipts.

## CSV evidence matrix

The decision toolbar exports a dependency-free UTF-8 CSV with case, control, status, severity, evidence type, document, locator, exact excerpt, reviewer decision, and reviewer comment. Headers follow the receipt language; source excerpts remain verbatim.
