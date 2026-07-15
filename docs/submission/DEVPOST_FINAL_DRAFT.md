# PolicyProof — Final Devpost Draft

## One-line pitch

PolicyProof turns written business policy into human-reviewed controls and an evidence ledger that explains every result.

## Inspiration

Finance, procurement, audit, and internal-control professionals routinely compare policy requirements with purchase orders, invoices, approval records, delivery evidence, and vendor-change documents. The work is slow, and the exact evidence can become separated from the conclusion. PolicyProof explores a more reviewable workflow: structure the policy, keep a human in control, and make every result traceable.

## What it does

PolicyProof provides one focused five-step workspace for one fictional procurement policy and three controlled case profiles:

1. read the procurement policy;
2. review and approve seven structured controls;
3. select Northstar mixed-risk, Meridian compliant, or Atlas evidence-deficient and inspect five fictional case documents;
4. run the review and investigate PASS, FAIL, MISSING, and WARNING outcomes;
5. record human decisions and export a decision receipt.

The default presentation is a Northstar-first Focused Demo over the same application state. One action reveals the 3 PASS / 2 FAIL / 1 MISSING / 1 WARNING composition, the exact 12,480 EUR purchase order versus 12,480 USD invoice contradiction, source references, deterministic reproduction, and human decision. Full Workspace keeps the complete five-step workflow and advanced inspection tools without resetting state.

A versioned Review Fingerprint makes reproducibility concrete. It is a native SHA-256 digest of normalized policy, controls, parameters, source documents, structured facts, exact evidence, and deterministic conclusions. An unchanged rerun reproduces 7/7 conclusions and the same digest without a model call. Raising the approval threshold to EUR 15,000 changes `CTRL-01` from FAIL to PASS, leaves six controls unchanged, and changes the digest. It is not a signature, identity proof, or trusted timestamp.

The Review workspace adds evidence-led intelligence without becoming a generic dashboard. It shows case outcome composition, evidence coverage, an event chronology, threshold sensitivity, a prioritized reviewer queue, and a comparison with the previous local run. Search and filters narrow the same underlying results. Selecting a visual always leads back to a control or its exact evidence.

The three profiles use the same strict scenario schema, policy, seven control kinds, deterministic engine, evidence inspector, and human-decision receipt. Northstar produces a mixed 3/2/1/1 profile, Meridian produces seven supported passes, and Atlas produces one approval failure plus two explicit missing-evidence outcomes. These results are calculated at runtime from each case's documents. Fixture expectations exist only as regression assertions.

An optional Judge Mode guides the real demonstration without automating actions. Current-session scenario comparison, the GPT-5.6 → TypeScript → Human architecture view, evidence-trust explanations, and a safe local audit trail make the system inspectable. There is no compliance score, AI confidence percentage, or ranking.

At the default EUR 10,000 threshold, the deterministic demonstration produces 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING. Raising the threshold to EUR 15,000 changes only the approval control from FAIL to PASS. That visible causal change proves the review is recalculated rather than replayed from a fixed screen.

## How we built it

PolicyProof is a single Next.js and React application written in strict TypeScript. Zod validates runtime data, the official OpenAI JavaScript SDK implements the optional server-only GPT-5.6 workflow, Vitest and Testing Library protect the domain and interface, and Playwright verifies the complete browser journey. There is no database, authentication layer, external document service, or multi-agent application architecture.

The Review Fingerprint uses a strict versioned Zod payload, recursively canonical JSON, deterministic semantic collection ordering, `TextEncoder`, and browser-compatible Web Crypto SHA-256. It adds no hashing package. The dedicated rerun calls the shared TypeScript engine and cannot enter the OpenAI path.

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
- Accessible keyboard navigation, reduced-motion behavior, print output, JSON, Markdown, and UTF-8 CSV exports.
- A meaningful threshold rerun and previous-run comparison derived from real state.
- Same-input 7/7 deterministic reproduction with a versioned Review Fingerprint and explicit change/divergence handling.
- A focused judge path with the full advanced workspace preserved behind one state-safe action.
- Three controlled case profiles processed by one shared engine and interface.
- Manual Judge Mode, current-session comparison, architecture, evidence-trust, and safe audit surfaces.
- A deterministic fallback that makes no OpenAI request.
- Automated unit, contract, component, browser, security, and production-build checks.

## What we learned

A useful AI review product does not need to hide uncertainty. Separating semantic extraction from deterministic calculations makes the workflow easier to test and explain. Evidence coverage and integrity are more useful than an unsupported confidence score, and human judgment should be stored beside—not on top of—the machine result.

## Limitations

PolicyProof is a hackathon prototype and review aid, not a compliance certification or autonomous approval system. It supports one fictional procurement policy, three controlled case profiles, seven rule types, and text-based `.txt`, `.md`, and `.json` files only. Northstar alone has real GPT-5.6 validation; Meridian and Atlas are deterministic and mocked. This does not prove cross-industry generalization or broader model accuracy.

It has no PDF/OCR ingestion, durable collaboration, identity, authorization, external integrations, or production audit store. Current-session comparison and audit events disappear on refresh. Browser storage retains at most one minimal comparison snapshot per scenario and may be unavailable. The deterministic demo is the reliable judging path; live behavior still depends on valid model access, quota, and provider availability.

## What's next

Receipt-integrity hashing, local receipt verification, and tamper tests are the next bounded technical phase. They remain separate from the current Review Fingerprint, which deliberately excludes human decision and receipt metadata.

The next step is user validation with finance and control professionals before expanding scope. A production direction would require organization-specific control governance, secure document ingestion, identity and authorization, durable audit records, privacy and retention controls, monitoring, broader model evaluations, and legal and security review.
