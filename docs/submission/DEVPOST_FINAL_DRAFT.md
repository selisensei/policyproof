# PolicyProof — Final Devpost Draft

## One-line pitch

PolicyProof turns written business policy into human-reviewed controls and an evidence ledger that explains every result.

## Inspiration

Finance, procurement, audit, and internal-control professionals routinely compare policy requirements with purchase orders, invoices, approval records, delivery evidence, and vendor-change documents. The work is slow, and the exact evidence can become separated from the conclusion. PolicyProof explores a more reviewable workflow: structure the policy, keep a human in control, and make every result traceable.

## What it does

PolicyProof provides one focused five-step workspace for a fictional Northstar procurement and vendor-change case:

1. read the procurement policy;
2. review and approve seven structured controls;
3. inspect five fictional case documents;
4. run the review and investigate PASS, FAIL, MISSING, and WARNING outcomes;
5. record human decisions and export a decision receipt.

The Review workspace adds evidence-led intelligence without becoming a generic dashboard. It shows case outcome composition, evidence coverage, an event chronology, threshold sensitivity, a prioritized reviewer queue, and a comparison with the previous local run. Search and filters narrow the same underlying results. Selecting a visual always leads back to a control or its exact evidence.

At the default EUR 10,000 threshold, the deterministic demonstration produces 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING. Raising the threshold to EUR 15,000 changes only the approval control from FAIL to PASS. That visible causal change proves the review is recalculated rather than replayed from a fixed screen.

## How we built it

PolicyProof is a single Next.js and React application written in strict TypeScript. Zod validates runtime data, the official OpenAI JavaScript SDK implements the optional server-only GPT-5.6 workflow, Vitest and Testing Library protect the domain and interface, and Playwright verifies the complete browser journey. There is no database, authentication layer, external document service, or multi-agent application architecture.

GPT-5.6 handles semantic work that benefits from a language model:

- interpreting the fictional policy and proposing structured controls;
- extracting structured facts and exact excerpts from the fictional documents.

Deterministic TypeScript handles arithmetic and repeatable rules:

- amount and currency comparisons;
- approval threshold and approval-count checks;
- date ordering, document presence, and segregation of duties;
- outcome summaries, evidence coverage, run comparison, decisions, and receipts.

Before analysis, a human must review and approve proposed controls. After analysis, every model-provided excerpt must exist verbatim in its named source. A final reviewer can confirm, reject, or accept an exception while the original result remains visible.

## GPT-5.6 validation

One supervised live validation used only the fictional Northstar materials. GPT-5.6 returned seven human-reviewed controls and 14 evidence items. All 14 excerpts and locators were verified against their sources, and the deterministic engine then produced the expected 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING. The sanitized report is included in the repository. This single controlled case validates the demonstrated integration path; it does not establish general model accuracy.

## How Codex helped

The primary Codex task is the project's core build history. Codex inspected the environment, planned the product, implemented and tested the deterministic engine and interface, integrated the GPT-5.6 boundary, diagnosed provider failures safely, supported the supervised live validation, created the evidence-led Proofroom design, and prepared the documentation and submission materials. The solo builder retained ownership of product decisions, credentials, manual validation, deployment, recording, and the final submission.

## Challenges

The hardest challenge was preserving trust while combining model interpretation with deterministic review. The application had to reject invented evidence, retain human approval, keep provider diagnostics safe, and remain fully demonstrable when the model is unavailable. Responsive evidence presentation was another challenge: dense desktop registers had to become readable mobile cards without losing source traceability.

## Accomplishments

- A complete evidence-first workflow covering all four review statuses.
- Exact-source validation and safe model-error classification.
- A bilingual English/French interface that preserves review state.
- Accessible keyboard navigation, reduced-motion behavior, print output, JSON and Markdown exports.
- A meaningful threshold rerun and previous-run comparison derived from real state.
- A deterministic fallback that makes no OpenAI request.
- Automated unit, contract, component, browser, security, and production-build checks.

## What we learned

A useful AI review product does not need to hide uncertainty. Separating semantic extraction from deterministic calculations makes the workflow easier to test and explain. Evidence coverage and integrity are more useful than an unsupported confidence score, and human judgment should be stored beside—not on top of—the machine result.

## Limitations

PolicyProof is a hackathon prototype and review aid, not a compliance certification or autonomous approval system. It supports one fictional case and text-based `.txt`, `.md`, and `.json` files only. It has no PDF/OCR ingestion, durable collaboration, identity, authorization, external integrations, or production audit store. Browser storage retains at most one minimal local comparison snapshot and may be unavailable. The deterministic demo is the reliable judging path; live behavior still depends on valid model access, quota, and provider availability.

## What's next

The next step is user validation with finance and control professionals before expanding scope. A production direction would require organization-specific control governance, secure document ingestion, identity and authorization, durable audit records, privacy and retention controls, monitoring, broader model evaluations, and legal and security review.

