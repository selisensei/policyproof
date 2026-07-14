# PolicyProof Product Brief

## One-sentence description

PolicyProof turns a written business policy into human-reviewed controls, applies those controls to a fictional document-based business case, and shows the evidence behind every review result.

## Problem

Business reviewers often need to compare written policies with scattered case documents. The work is slow, inconsistent, and difficult to audit because conclusions can be separated from the exact text that supports them.

## Target user

The initial user is a finance, accounting, procurement, or internal-control professional reviewing a vendor change or procurement case.

## Prototype scope

The first working version supports one fictional procurement and vendor-change scenario. It is a demonstration of a reliable review workflow, not a general compliance platform.

## Core journey

1. Use the guaranteed deterministic demo or select Live GPT-5.6 mode when it is configured.
2. Review a short fictional procurement policy.
3. Review, edit, enable, and explicitly approve the applicable controls.
4. Load the bundled fictional case or select fictional `.txt`, `.md`, or `.json` documents.
5. Use GPT-5.6 for policy interpretation and evidence extraction in Live mode.
6. Use deterministic TypeScript logic for supported calculations and comparisons.
7. Display Pass, Fail, Missing, or Warning with exact evidence or an explicit missing-evidence explanation.
8. Let the user confirm, reject, or accept an exception while preserving the original result.
9. Produce a local decision receipt with the outcomes, human decisions, comments, timestamp, and disclaimer.
10. Switch the complete application presentation between English and French without resetting the review.
11. Follow an optional state-based judge checklist and export the current structured receipt through print, JSON, or copy actions.

## Status definitions

- **Pass:** The available evidence supports the control.
- **Fail:** The available evidence contradicts the control or proves non-compliance.
- **Missing:** Required evidence is not present in the supplied case documents.
- **Warning:** The evidence is ambiguous, incomplete, inconsistent, or requires human judgment.

## Minimum product requirements

- The policy and case use fictional data only.
- Proposed controls are structured and editable before analysis.
- Analysis uses only the confirmed controls and supplied case documents.
- Every result identifies its control, status, explanation, evidence excerpt, and source.
- Evidence excerpts must be traceable to the provided source content.
- A result without sufficient evidence must not be presented as a confident Pass or Fail.
- Human overrides preserve both the model result and the reviewer decision.
- The interface clearly distinguishes model output from human decisions.
- The product meaningfully uses GPT-5.6 rather than displaying precomputed results.

## Success criteria

A hackathon judge can run the application, complete the full workflow with the included fictional materials, inspect evidence for every result, make an override, and understand where GPT-5.6 contributes.

## Out of scope

- Authentication and user management
- Payments or subscriptions
- ERP, accounting, procurement, or document-management integrations
- Multi-tenancy or organization administration
- Production document ingestion at scale
- A complex or hosted database
- Autonomous approvals or automatic business decisions
- Real customer or confidential data
- Multi-agent application architecture

## Product principles

- Evidence before confidence
- Human review before final judgment
- Clear limitations instead of false certainty
- One polished workflow before broader coverage
- Simple enough to explain in a three-minute demo
- A ledger and case-file visual language rather than a generic AI dashboard

## Evidence-led visual architecture

The approved Proofroom interface treats the policy as a source folio, controls and documents as review registers, Review as a connected result-ledger/evidence-case-file workspace, and Decision as a human-judgment paper followed by a formal receipt. The selected result remains visually connected to exact evidence, the EUR/USD contradiction is compared from actual result data, and only the affected approval control is emphasized after the EUR 15,000 rerun.

Desktop prioritizes density suitable for a 13-inch work screen. Mobile uses stacked result entries with inline evidence instead of shrinking the desktop register. Motion is restrained, communicates state changes, and is removed when `prefers-reduced-motion` is enabled.

## Implemented product boundaries

- The deterministic demo uses five fictional records and seven controls that intentionally cover all four statuses.
- Human decisions apply per control; the receipt summarizes the case without inventing a separate automated case verdict.
- Evidence uses stable document identifiers, names, section locators, exact excerpts, evidence types, confidence, and relation to a control when available.
- Local document support is deliberately limited to text-based formats. PDF and OCR remain out of scope.
- English is the default interface language; French is available immediately from the application header. Stable technical identifiers and original source evidence are not translated.
- Guided-demo completion is based only on real user actions and remains optional, dismissible, keyboard-accessible, and temporary.
- Receipt exports are generated from current validated review state; no PDF service, server storage, or invented audit metadata is used.
