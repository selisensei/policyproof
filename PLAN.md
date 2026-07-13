# PolicyProof Delivery Plan

## Delivery strategy

Build and preserve one dependable vertical workflow before adding breadth. Every phase has an automated or manual verification path, and the deterministic fixture remains the guaranteed demonstration fallback.

## Implementation status - 2026-07-13

Completed in this phase:

- Professional responsive workspace with five-step navigation and explicit run modes
- Seven editable/enabled deterministic controls and five fictional case documents
- PASS, FAIL, MISSING, and WARNING summaries, filtering, evidence inspection, and rerun behavior
- Per-control human decisions and a timestamped local decision receipt
- Local `.txt`, `.md`, and `.json` selection with type, size, count, label, and JSON validation
- Server-only GPT-5.6 client, policy compilation route, case-analysis route, Structured Outputs, Zod validation, timeout, and safe errors
- Clear split between GPT interpretation/extraction and deterministic calculations
- Unit, integration, component, and Playwright critical-path tests
- Type checking, linting, production build, local production smoke test, visual responsive review, and production dependency audit

Still pending:

- Builder-led controlled GPT-5.6 evaluation using fictional content and an authorized API key
- Prompt adjustment only if the controlled evaluation exposes a documented issue
- Final accessibility review with assistive technology
- Submission screenshots and a sub-three-minute demo script/video
- Git commit and public repository, deployment, deployed smoke test, and submission metadata

No commit, push, deployment, secret access, or paid model call was performed in this phase.

## Phase 0 - Foundation

**Goal:** Create a safe, understandable project baseline.

**Status:** Complete except for the intentionally deferred first Git commit. The application foundation, strict types, linting, tests, environment example, dependency lockfile, telemetry protection, and setup documentation are present.

**Exit check:** A beginner can install dependencies, start the application, and run the mandatory checks from the README.

## Phase 1 - Fictional demonstration case

**Goal:** Define stable inputs and expected evidence-led outcomes.

**Status:** Complete. Five fictional documents and seven deterministic controls represent all four statuses, and every result has evidence or an explicit missing item.

**Exit check:** The bundled case runs without an API key and the expected outcomes are tested.

## Phase 2 - Policy-to-controls workflow

**Goal:** Produce reviewable structured controls with GPT-5.6.

**Status:** Implemented and mock-tested. The user can enter policy text, receive strict structured proposals, edit supported proposal fields, and explicitly approve the controls. Missing configuration and provider errors fail safely. A real controlled model evaluation remains pending.

**Exit check:** Mocked success and malformed responses pass automated tests; live behavior must be verified by the builder before deployment.

## Phase 3 - Evidence-based case review

**Goal:** Extract evidence from fictional local documents and calculate supported controls.

**Status:** Implemented and mock-tested for `.txt`, `.md`, and `.json`. Evidence excerpts are validated against supplied text. TypeScript calculates amount, currency, date, approval, presence, and segregation-of-duties checks. PDF and OCR are deferred.

**Exit check:** Deterministic calculations and mocked GPT extraction pass. Controlled live-model evaluation remains pending.

## Phase 4 - Human decision and audit view

**Goal:** Make results reviewable rather than final.

**Status:** Complete for temporary browser state. Reviewers can confirm, reject, or accept an exception; overrides require comments; reruns reset decisions; and the receipt preserves original outcomes and human judgment.

**Exit check:** Component and Playwright tests cover the decision workflow and receipt.

## Phase 5 - Judge readiness

**Goal:** Make the submission easy to run, evaluate, and explain.

**Status:** In progress. Local automated gates, responsive screenshots, keyboard focus, production smoke testing, documentation, and dependency audit are complete. Live evaluation, assistive-technology review, screenshots for the README, deployment, video, and submission links remain.

**Exit check:** A judge can open the deployed demo, complete the workflow without assistance, and trace every result to its evidence.

## Recommended next phase

1. Builder manually verifies the deterministic workflow using the exact README steps.
2. Builder configures `OPENAI_API_KEY` locally without sharing it and runs a controlled fictional GPT-5.6 evaluation.
3. Record model disagreements and make only evidence-backed prompt or schema adjustments.
4. Run all quality gates again.
5. Perform final accessibility review and capture submission screenshots.
6. With explicit approval, create the first Git commit, publish the repository, deploy, and smoke-test the deployed URL.

## Deferred until explicitly approved

- Additional policy types or cases
- PDF parsing or OCR
- Persistent database storage
- User accounts or shared workspaces
- External business-system integrations
- Batch processing, dashboards, or multi-agent application architecture
