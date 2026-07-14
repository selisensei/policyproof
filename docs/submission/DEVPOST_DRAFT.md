# PolicyProof — Devpost Draft

> Superseded by `DEVPOST_FINAL_DRAFT.md`, which reflects the completed supervised GPT-5.6 validation and review-intelligence workspace. This file is retained as an earlier drafting checkpoint.

## One-line pitch

PolicyProof turns written business policy into human-reviewable controls and shows the exact evidence behind every result.

## The problem

Finance, procurement, audit, and internal-control professionals routinely compare policy requirements with purchase orders, invoices, approval records, delivery evidence, and vendor-change documents. The work is slow, conclusions can be inconsistent, and the exact evidence often becomes separated from the final review.

## The solution

PolicyProof provides a focused five-step workspace with adaptive navigation and an optional judge checklist: review a policy, confirm controls, select case documents, inspect an evidence workbench, and record a human decision. Every PASS, FAIL, MISSING, or WARNING links to supporting or contradictory excerpts, or explicitly states what evidence is missing.

The prototype covers one fictional procurement and vendor-change case. At a EUR 10,000 threshold it produces 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING. Changing the threshold to EUR 15,000 immediately proves that the approval result is recalculated rather than displayed from a precomputed result list.

## Target users and track

PolicyProof is built for the **Work & Productivity** track. Its initial users are finance, accounting, procurement, audit, and internal-control professionals who need a faster and more traceable first review of a business case.

## Core user journey

1. Read the fictional procurement policy.
2. Review seven controls and their severity and parameters.
3. Inspect five fictional case documents.
4. Run the review and scan the evidence matrix.
5. Select a result and inspect exact source excerpts.
6. Confirm, reject, or accept an exception with a reviewer comment.
7. Present a structured decision receipt.

The receipt is generated from current review state and supports browser printing, structured JSON download, and concise copy actions without a PDF service or database.

The complete interface switches immediately between English and French while preserving review state. Original fictional documents, technical identifiers, and exact excerpts remain unchanged for traceability.

## Technical architecture

PolicyProof is one Next.js application with React, strict TypeScript, Tailwind CSS, Zod, the official OpenAI JavaScript SDK, Vitest, Testing Library, and Playwright. It has no database, authentication system, external document service, or multi-agent application architecture.

The browser owns temporary review state. Server routes isolate OpenAI access. Runtime schemas validate requests and Structured Outputs. A deterministic TypeScript engine calculates supported controls and creates summaries and receipts.

## GPT-5.6 and deterministic responsibility split

GPT-5.6 is designed to:

- interpret fictional policy text;
- propose structured controls for explicit human approval;
- extract structured facts and exact evidence from fictional text documents.

Deterministic TypeScript code:

- compares amounts and currencies;
- orders dates;
- evaluates approval counts and thresholds;
- checks document presence and segregation of duties;
- creates status summaries, human decisions, and receipts.

This split makes model interpretation useful without delegating final arithmetic or business approval to the model.

## Safety and human review

- GPT-5.6 never approves a payment or issues a compliance certification.
- Proposed controls remain unapproved until a human confirms them.
- Model output must pass strict Zod validation.
- Exact excerpts must exist in the submitted fictional source text.
- Documents are treated as untrusted evidence, not as instructions.
- Provider errors are classified and correlated without exposing credentials or request content.
- The deterministic demo makes no OpenAI request and remains the reliable judging fallback.

## How Codex was used

The primary Codex task is the core build history. Codex inspected the environment, created the product plan and decisions, implemented the deterministic engine and UI, integrated the server-side GPT-5.6 architecture, added mock and browser tests, diagnosed the first live failure safely, redesigned the bilingual experience, and prepared submission documentation. The solo builder retained responsibility for product choices, manual validation, credentials, deployment, recording, and final submission.

## Current status and limitations

The deterministic workflow and mocked GPT contracts are locally tested. One supervised live Northstar validation subsequently succeeded: seven human-reviewed controls and 14 evidence items passed schema, source, excerpt, locator, mapper, and deterministic-result checks. This single fictional case does not establish general model accuracy. See `docs/evaluation/LIVE_GPT56_VALIDATION.md` and the final Devpost draft.

The prototype supports one fictional case and `.txt`, `.md`, and `.json` files only. State is temporary. There is no PDF/OCR workflow, persistence, authentication, collaboration, ERP integration, or deployed URL yet.

## Future potential

With validated ingestion and organization-specific control libraries, the evidence-first pattern could support broader procurement, expense, close, vendor-master, and audit workflows. The product should expand only after the narrow review path is validated with users.
