# PolicyProof Decision Log

Record major product and engineering decisions here before or with implementation. Do not silently change an accepted decision.

## Decision template

### DXXX — Decision title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded
- **Context:** Why a decision is needed.
- **Decision:** What was chosen.
- **Rationale:** Why this is the smallest suitable choice.
- **Consequences:** Benefits, limitations, and follow-up work.

## D001 — Narrow prototype scope

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** A solo hackathon submission needs a reliable end-to-end demonstration.
- **Decision:** Support one fictional procurement and vendor-change case only in the initial prototype.
- **Rationale:** A narrow case makes model behavior, evidence traceability, testing, and demonstration more dependable.
- **Consequences:** The prototype will not claim general policy or industry coverage.

## D002 — Human review is mandatory

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** Model-generated controls and conclusions can be incomplete or incorrect.
- **Decision:** Require human confirmation of controls and allow confirmation or reasoned override of final results.
- **Rationale:** The product supports professional judgment instead of replacing it.
- **Consequences:** The interface must preserve model output and human decisions separately.

## D003 — Evidence-linked result model

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** Review conclusions are useful only when a person can inspect their basis.
- **Decision:** Every result must be Pass, Fail, Missing, or Warning and include a source-linked evidence excerpt, or an explicit statement that evidence is absent.
- **Rationale:** Traceability is PolicyProof's central product value.
- **Consequences:** The application must validate evidence citations against supplied content and reject unsupported structured output.

## D004 — Proposed implementation stack

- **Date:** 2026-07-13
- **Status:** Superseded by D007
- **Context:** The application needs a small web interface, secure server-side model calls, validation, tests, and simple deployment.
- **Decision:** Use a single Next.js application with TypeScript, React, the official OpenAI JavaScript SDK and Responses API, Zod validation, Vitest with Testing Library, and Playwright for the final critical journey. Use plain CSS or CSS Modules. Deploy on Vercel. Keep demonstration inputs as versioned text or JSON fixtures and keep review state in the browser for the prototype.
- **Rationale:** One TypeScript codebase avoids a separate frontend and backend, keeps API credentials server-side, and has a straightforward deployment path.
- **Consequences:** Codex currently provides isolated Git and Node.js runtimes, but normal terminal access still needs a supported Node.js LTS installation and Git available in `PATH`. Exact package versions, GPT-5.6 model identifier, supported structured-output mechanism, and deployment settings must be verified against official documentation before installation. No database is planned initially.

## D005 — No application implementation during initial planning

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The builder requested environment inspection and planning before code or dependency installation.
- **Decision:** Create only repository instructions, product and delivery documentation, testing guidance, README, and `.gitignore` in this step.
- **Rationale:** This creates an explicit checkpoint for builder approval.
- **Consequences:** Application code and dependencies remain absent until approval.

## D006 — Keep data fictional and local to the demo

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The prototype does not need confidential business documents or broad ingestion.
- **Decision:** Use only fictional, repository-controlled demonstration content and do not collect personal or confidential information.
- **Rationale:** This reduces privacy, security, and demonstration risk.
- **Consequences:** Real document upload and external integrations are out of scope.

## D007 — Deterministic vertical-slice stack

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The first bounded implementation phase must prove the review experience without presenting model-generated analysis as complete. The phase prompt also requires Tailwind CSS, which supersedes D004's styling proposal.
- **Decision:** Build one Next.js App Router application with React, strict TypeScript, Tailwind CSS, pnpm, Zod, and Vitest. Keep the fixture data, schemas, and deterministic review engine in separate TypeScript modules. Store reviewer decisions only in React state. Do not add OpenAI calls, a database, authentication, PDF parsing, graph visualization, or Playwright in this phase.
- **Rationale:** This is the smallest reversible architecture that demonstrates the full local review interaction while keeping domain logic independently testable.
- **Consequences:** The UI must explicitly label all controls and results as deterministic demo content. GPT-5.6 policy compilation, document analysis, real source extraction, persistence, deployment, and end-to-end browser automation remain pending.

## D008 — Evidence references use fixture locators

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** Review results need traceable evidence before real document parsing exists.
- **Decision:** Each fictional case document contains stable extracted facts, and each evidence reference records the document identifier, document title, fact identifier, locator label, and exact excerpt.
- **Rationale:** Stable fixture locators are deterministic, easy to inspect, and can later be replaced by real extraction coordinates without changing the result model's intent.
- **Consequences:** Evidence is traceable within the included fixture, but it is not yet extracted from uploaded files.

## D009 — Restrict dependency build-script approval

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** pnpm 11 blocks dependency build scripts unless the project explicitly approves them. Next.js and ESLint transitively require native setup from `sharp` and `unrs-resolver`.
- **Decision:** Allow build scripts only for `sharp` and `unrs-resolver` through the project-level `allowBuilds` map in `pnpm-workspace.yaml`.
- **Rationale:** A two-package allowlist preserves pnpm's default protection for every other dependency while allowing the approved framework and lint stack to operate.
- **Consequences:** Future dependencies that require build scripts must be reviewed and explicitly documented rather than silently executed.

## D010 — Pin TypeScript to the supported ESLint range

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The current TypeScript 7 release passes type checking but is outside the `<6.1.0` peer range supported by the TypeScript parser included with the stable Next.js ESLint configuration.
- **Decision:** Pin TypeScript to 6.0.3, the latest stable 6.x release available from the official npm registry during this phase.
- **Rationale:** Using the newest mutually compatible version is safer than suppressing the parser failure or weakening lint rules.
- **Consequences:** TypeScript 7-specific features are intentionally unavailable until the Next.js lint stack supports them.

## D011 — Pin ESLint to the supported plugin range

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** ESLint 10 is newer than the peer ranges supported by the import, accessibility, and React plugins included in the stable Next.js lint configuration.
- **Decision:** Pin ESLint to 9.39.5, the latest stable 9.x release available from the official npm registry during this phase.
- **Rationale:** A clean dependency graph and functioning lint rules are more reliable than forcing an unsupported major version.
- **Consequences:** ESLint 10 is deferred until the Next.js plugin stack declares compatible peer ranges.

## D012 — Disable Next.js telemetry in project commands

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** This unattended phase permits network access only to the official package registry, while Next.js enables anonymous telemetry by default.
- **Decision:** Route the `dev`, `build`, and `start` scripts through a dependency-free Node.js wrapper that sets `NEXT_TELEMETRY_DISABLED=1` for the child process.
- **Rationale:** A project-level wrapper is explicit, cross-platform, version-controlled, and does not require a global machine setting or an extra package.
- **Consequences:** Standard project commands do not send Next.js telemetry. Directly invoking the Next.js binary bypasses this protection and is not a documented workflow.

## D013 — Workspace-oriented UI architecture

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The deterministic vertical slice is reliable but presents the workflow as one long technical page and concentrates UI responsibilities in one large component.
- **Decision:** Keep one page and one client-side state owner, but split the interface into focused policy, controls, documents, review, evidence, and decision components. Use compact step navigation, a persistent mode indicator, restrained status colors, and desktop-first responsive grids.
- **Rationale:** Focused components improve readability and UI testing without introducing routing, global state libraries, or a new application architecture.
- **Consequences:** The workflow remains a single-page application with temporary browser state and no database.

## D014 — Split deterministic and AI responsibilities

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** Language models are useful for interpreting policy text and extracting evidence, but arithmetic and equality checks should be reproducible.
- **Decision:** GPT-5.6 proposes controls and extracts structured facts and evidence. TypeScript code remains responsible for amount comparison, currency comparison, date ordering, approval count and threshold checks, document presence, segregation-of-duties equality, reviewer decisions, summaries, and receipts.
- **Rationale:** This preserves explainability and makes the highest-risk conclusions deterministic and testable.
- **Consequences:** GPT-5.6 never approves a payment or issues a legal or compliance certification. Live mode remains visibly distinct from deterministic demo mode.

## D015 — GPT-5.6 model configuration and Responses API

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The model identifier and request pattern needed verification before integration.
- **Decision:** Use the official `gpt-5.6` alias, which the OpenAI latest-model guide states routes to `gpt-5.6-sol`. Use the Responses API, `reasoning.effort: "low"`, and Structured Outputs through the official JavaScript SDK Zod helper. Isolate the model and timeout in one server configuration module.
- **Rationale:** This follows the official OpenAI guidance retrieved from `developers.openai.com` on 2026-07-13 while keeping configuration easy to review and update.
- **Consequences:** Production evaluation and snapshot pinning remain future work. This unattended phase uses mocked responses only and makes no paid API call.

## D016 — Text-based local document scope

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The prototype needs real local document selection without adding OCR or broad ingestion complexity.
- **Decision:** Accept `.txt`, `.md`, and `.json` files up to 1 MB each, with a maximum of 10 files. Read them locally in the browser, allow labels and removal, and transmit their text only when the user explicitly runs Live GPT-5.6 analysis.
- **Rationale:** Text-based files provide a reliable judge-testable path and require no parsing dependency or external storage.
- **Consequences:** PDF and OCR are intentionally deferred. Deterministic fixtures remain separate from user-selected files.

## D017 — No database, OCR service, or multi-agent architecture

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** None of these systems is required for the single-case judge workflow.
- **Decision:** Keep policy, document, result, decision, and receipt state in the browser session; use no database, OCR service, or multi-agent application design.
- **Rationale:** This minimizes operational risk, dependencies, privacy exposure, and explanation cost for a solo hackathon submission.
- **Consequences:** Refreshes reset the workspace, PDFs are unsupported, and the app handles one review at a time.

## D018 - Focused browser and component test stack

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The professional workflow needs interaction coverage beyond domain unit tests and one judge-critical browser journey.
- **Decision:** Use Testing Library with jsdom for component interactions and Playwright with a project-local Chromium installation for the deterministic critical path, mobile viewport, and keyboard-focus checks. Keep generated screenshots and traces under ignored test-output directories.
- **Rationale:** These tools test the actual user workflow without adding application runtime code or changing the product architecture.
- **Consequences:** Chromium adds a large local development download. The automated checks do not replace a final assistive-technology or deployed-browser review.

## D019 - Override vulnerable transitive PostCSS version

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** `pnpm audit --prod` reported GHSA-qx2v-qp2m-jg93 because Next.js resolved PostCSS 8.4.31, while the patched range starts at 8.5.10.
- **Decision:** Pin the transitive PostCSS dependency to 8.5.19 through `pnpm-workspace.yaml`. Record the exact recent release in pnpm's `minimumReleaseAgeExclude` list so the lockfile policy accepts this reviewed security update.
- **Rationale:** One narrow override removes the known production vulnerability without changing the framework or introducing a new package.
- **Consequences:** Future Next.js upgrades should be checked to determine whether the override can be removed. Tests, build, and the production audit must be rerun after dependency changes.

## D020 - Classify and correlate OpenAI failures before live evaluation

- **Date:** 2026-07-13
- **Status:** Accepted
- **Context:** The first supervised policy compilation returned two generic HTTP 502 responses, hiding whether the cause was authentication, permissions, quota, rate limiting, schema validation, timeout, or connectivity.
- **Decision:** Keep provider details server-side, log only a fixed redacted diagnostic field set in development, and return a safe category plus correlation and provider request identifiers to the browser. Preserve upstream 401, 403, and 429 semantics; use 503 for connection, 504 for timeout, and 502 for schema/provider failures. Disable automatic SDK retries during diagnosis and reject simultaneous browser compilation requests.
- **Rationale:** One visible attempt should map to one upstream request and produce enough safe evidence to diagnose the next supervised failure without exposing credentials, headers, request bodies, or policy content.
- **Consequences:** Retry resilience is temporarily lower on the live-evaluation branch. It can be reconsidered after the root cause is confirmed with a supervised fictional request.

## D021 - Use an internal typed bilingual presentation layer

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** The judging interface must switch immediately between English and French without duplicating the application or changing stable domain data.
- **Decision:** Use a dependency-free locale context backed by a typed English/French dictionary. Persist only the locale in browser storage, update the document language, and translate presentation labels, validation, statuses, deterministic control copy, explanations, and the displayed receipt. Keep API fields, enum values, control identifiers, source documents, and exact evidence excerpts unchanged.
- **Rationale:** A small internal layer is understandable, hydration-safe, and sufficient for the two supported languages.
- **Consequences:** Live GPT-generated control prose remains in the language returned from the submitted policy; PolicyProof does not silently machine-translate model output or source evidence.

## D022 - Focus the workspace on one workflow step at a time

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** Rendering all five sections as one long page weakened hierarchy and made the evidence matrix feel secondary.
- **Decision:** Keep one page and one React state owner, but render one selected workflow step in the main area. Add a compact five-step navigator, persistent mode and language controls, a contextual run action, and a small readiness/results rail. Preserve all business logic and temporary browser state across navigation and locale changes.
- **Rationale:** The focused shell is easier to scan on laptops and mobile devices without adding routes or a state-management framework.
- **Consequences:** Users navigate between steps explicitly; the review run automatically opens the evidence step.

## D023 - Treat local text and model output as untrusted inputs

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** Local filenames, MIME declarations, text content, and model responses can be malformed or misleading even in a fictional evaluation.
- **Decision:** Retain the `.txt`, `.md`, and `.json` scope while validating compatible MIME types when present, duplicate names, filename length, count, size, empty/binary content, and JSON syntax. Prompts state that policy and document text are untrusted source material. Missing, refused, incomplete, malformed, or source-inconsistent model output fails closed.
- **Rationale:** Input hardening protects the narrow workflow without adding parsers, upload services, or dependencies.
- **Consequences:** Some files with misleading extensions or incompatible declared MIME types are rejected. HTML-like text remains inert text and is never rendered as markup.

## D024 - Maintain a mocked evaluation contract suite

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** Live model accuracy cannot be tested unattended and must not be inferred from a few successful examples.
- **Decision:** Store fictional policy and document evaluation cases plus reusable assertions for schemas, source identifiers, exact excerpts, deterministic parameters, and required evidence. Run these as mocked contracts only; never describe them as proof of live GPT-5.6 accuracy.
- **Rationale:** Versioned contracts make expected behavior reviewable and regression-testable without cost, credentials, or network variability.
- **Consequences:** A supervised live evaluation is still required before claiming the GPT path works with the provider.

## D025 - Add state-derived guided demonstration

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** A judge should understand the deterministic workflow quickly without a blocking product tour or external tutorial dependency.
- **Decision:** Add a dismissible bilingual checklist whose progress is derived from real workspace actions: case loading, policy and control review, the EUR 10,000 run, contradiction inspection, human decision, receipt review, threshold change, and rerun.
- **Rationale:** A small checklist preserves keyboard access, language switching, normal navigation, and user control while making the intended demonstration reproducible.
- **Consequences:** The guide does not click buttons, submit requests, or claim completion before the matching application state exists. Progress is intentionally temporary with the rest of the review session.

## D026 - Export the structured decision receipt with browser-native tools

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** The decision receipt needs to be credible in a demo and ready for later sharing without introducing PDF infrastructure.
- **Decision:** Enrich the receipt schema with policy, language, mode, enabled-control count, outcome summary, human decisions, and comments. Provide print styling, JSON download, receipt-ID copy, and concise-summary copy using browser APIs only.
- **Rationale:** Every export is generated from current validated application state and requires no runtime dependency, server storage, or invented data.
- **Consequences:** Browser print output depends on the selected print destination. PDF generation, signatures, persistence, and immutable audit storage remain out of scope.

## D027 - Expose evidence provenance and evaluation responsibility

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** Reviewers need to distinguish source metadata, exact excerpts, and the method behind a conclusion at a glance.
- **Decision:** Show evidence counts, document type, stable field or section locator, relation metadata, distinct supporting and contradictory treatments, and copy actions. Label deterministic demo results as TypeScript evaluation and Live results as GPT-5.6 extraction followed by deterministic evaluation.
- **Rationale:** This strengthens traceability without changing evidence, inventing page numbers, or overstating semantic automation.
- **Consequences:** The current prototype uses stable text locators rather than page coordinates. Exact source excerpts remain untranslated.

## D028 - Use a secret-free core CI workflow

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** The future public repository needs repeatable pull-request checks without provider credentials or network-dependent model behavior.
- **Decision:** Add one GitHub Actions workflow for frozen pnpm installation, unit tests, type checking, linting, and production build on Node.js 24. Exclude OpenAI calls and defer Playwright from CI until public runner reliability is supervised.
- **Rationale:** The workflow mirrors the stable core commands and contains no secret reference.
- **Consequences:** Browser tests remain a required local pre-release gate and can be added to CI later after confirming Chromium installation time and stability.

## D029 - Apply narrow browser and document safety boundaries

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** Text documents can contain hostile instructions, malformed decoding, script-like text, or pathological lines, and public deployment should have basic browser protections.
- **Decision:** Continue rendering document content only as escaped React text; reject nulls, invalid UTF-8 replacement markers, and lines over 20,000 characters; retain exact-excerpt/source validation; and send conservative content-type, framing, referrer, and browser-permission headers.
- **Rationale:** These checks extend existing validation boundaries without a security framework, parser, or content transformation.
- **Consequences:** A document containing a literal replacement character or an extremely long single line is rejected. Content Security Policy remains a supervised deployment decision because Next.js script requirements must be tested against the production host.

## D030 - Use a task-first review shell with evidence as the focal surface

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** The release-candidate interface was functional but repeated the same header, progress, mode, notice, case summary, action, and walkthrough information around every task. The permanent right rail reduced the width available to evidence and made mobile sessions unnecessarily long.
- **Decision:** Keep the existing one-page state architecture and five-step workflow, but present it through a compact utility header, vertical desktop workflow rail, adaptive tablet/mobile step switcher, one case-context strip, and one wide task canvas. Show the product introduction only on the Policy step, collapse the optional judge guide, use register-style rows for controls and documents, make exact evidence the strongest Review surface, and add a result queue beside the human decision and receipt.
- **Rationale:** A task-first shell improves hierarchy and demo speed without changing the deterministic engine, OpenAI contracts, fixtures, temporary state model, or dependency set.
- **Consequences:** The generic readiness rail is removed. Supporting context remains available in the case strip and optional guide, while desktop width is reserved for the active review task.

## D031 - Capture the final live analysis outside the browser lifecycle

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** A successful live analysis response was lost when a Playwright response event completed before its asynchronous route interception had finished reading and persisting the body. Browser cleanup then disposed the still-active request context.
- **Decision:** Make the final live document-analysis request through the real PolicyProof HTTP route with a single-request, zero-retry Node harness. Await the complete response body and an allowlisted structured-artifact write before any cleanup. Reload the ignored artifact independently, validate its Zod schema, document references, locators, exact excerpts, fact-key-compatible control relations, and required Northstar facts, then pass it through the production mappers and deterministic engine. A relation may name a known control or describe a semantically compatible relationship because the production schema defines this field as explanatory text rather than a control identifier. Validate the browser workflow separately with the same fictional contract and no provider call.
- **Rationale:** Separating provider capture from browser presentation removes the lifecycle race while preserving the production API boundary and the real TypeScript evaluation path.
- **Consequences:** The full live response remains under ignored `test-results/live-gpt56/`; only a sanitized validation report may be committed. Playwright writes to `test-results/playwright/` so its cleanup cannot remove the live artifact. The harness cannot retry automatically, cannot compile a policy, and projects only the documented structured analysis fields before persistence.

## D032 - Implement Proofroom as a presentation layer over the validated workflow

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** The approved “Proofroom — The Evidence Ledger” handoff defines a distinctive evidence-led visual system, but parts of its prototype implementation plan conflict with the validated PolicyProof architecture and scope.
- **Decision:** Translate the approved tokens, ledgers, folios, evidence chain, responsive transformations, restrained motion, and receipt treatment into the existing React components and single state owner. Do not add Zustand, remote font loading, a document parser, or a design-system dependency. Preserve actual domain identifiers and data. Keep validated TXT/MD/JSON limits and the existing rerun behavior that resets reviewer decisions, even where prototype notes show broader formats or decision persistence.
- **Rationale:** This applies the approved visual direction without replacing working business logic, expanding security scope, introducing network-dependent assets, or creating a second application architecture.
- **Consequences:** The production interface follows the design closely while some static prototype labels, reference aliases, file formats, and persistence examples are adapted to truthful application data. The optional first-run folio disappears after the case is loaded, persistent case context lives only in the workflow ledger, and the formal receipt appears after the first human decision rather than before a record exists. These differences are recorded in `docs/design/proofroom-ui/IMPLEMENTATION_MAPPING.md` and tested explicitly.

## D033 - Build review intelligence from existing structured case data

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** The validated Proofroom interface exposes exact evidence but remains dense and does not summarize case composition, cross-document coverage, chronology, threshold causality, or run changes quickly enough for a judge or professional reviewer.
- **Decision:** Add a compact Case Overview, outcome composition, evidence coverage map, chronology, threshold sensitivity, reviewer queue, local search, evidence-integrity indicators, and one-run comparison. Derive every value from existing `ControlResult`, `CaseDocument`, control parameter, and reviewer-decision data using pure TypeScript functions and semantic HTML/SVG. Store only a versioned, minimal previous-run snapshot in browser local storage. Add no runtime dependency and no composite compliance score.
- **Rationale:** These features answer concrete review questions while preserving the narrow Northstar scope, beginner-readable architecture, deterministic calculations, and evidence-first product identity.
- **Consequences:** Review gains a clearer attention-to-decision sequence. The previous-run comparison is local to one browser and intentionally limited; it is not durable audit storage. Visualizations must retain text alternatives, keyboard access, non-color encodings, and mobile transformations. Existing GPT-5.6 integration, evidence validation, deterministic outcomes, and receipt rules remain authoritative.

## D034 - Preserve the primary workflow action at narrow widths and high zoom

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** The desktop header carries the primary workflow action, but it is intentionally hidden below 760 CSS pixels. The footer previously exposed only a secondary Continue shortcut, so the Run review action disappeared on mobile and at an effective 200% browser zoom.
- **Decision:** When the header action is hidden, render the same primary action in the workflow footer and hide the secondary Continue shortcut.
- **Rationale:** Reusing the existing action handler and disabled conditions restores the complete workflow without creating a second behavior or adding permanent header density.
- **Consequences:** Desktop retains the compact header action and secondary step navigation. Mobile and high-zoom layouts expose one clear primary action for opening controls, running review, entering decisions, or printing the receipt.

## D035 - Generalize controlled cases through a strict scenario contract

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** Northstar proved the complete review path, but case identity, fixture selection, guided highlights, expected validation, and local run history were not represented by one explicit reusable contract.
- **Decision:** Define a strict Zod `ReviewScenario` containing localized case context, one policy, shared supported controls, exact fixture documents and facts, expected validation outcomes, evidence relationships, thresholds, guided highlights, assumptions, limitations, and fictional-data provenance. Expected outcomes are test assertions only; the shared deterministic engine remains the sole source of displayed results. Isolate minimal run-history keys by scenario ID.
- **Rationale:** One validated scenario boundary proves reuse without duplicating the engine, adding a database, or broadening the policy domain.
- **Consequences:** Northstar remains the default and only live-GPT-5.6-validated case. Additional scenarios may reuse the same procurement policy and seven control types, but each must pass schema, exact-excerpt, engine-result, visualization, reset, and browser tests. Malformed fixtures fail closed before reaching the UI.

## D036 - Prove reuse with three controlled procurement profiles

- **Date:** 2026-07-14
- **Status:** Accepted
- **Context:** A reusable scenario contract alone does not let a judge verify that the engine and evidence surfaces behave differently for distinct files.
- **Decision:** Keep Northstar as the default mixed-risk case and add Meridian as a complete below-threshold case plus Atlas as an incomplete above-threshold case. Present them in a compact bilingual case register with fictional-data provenance and assumptions. Do not expose expected outcome counts before a review runs. Reset volatile review state on switching, require confirmation when human decisions would be lost, and preserve the interface language.
- **Rationale:** Three deliberately controlled profiles provide strong, testable evidence of reuse while staying inside one procurement policy, seven existing control types, one shared engine, and one client-side workspace.
- **Consequences:** Northstar remains the only scenario validated by a real GPT-5.6 run. Meridian and Atlas are deterministic and mocked fixtures only. Their displayed results must always be calculated at runtime; schema expectations remain test assertions and never feed the UI.

## D037 - Add optional judge and trust tools over production state

- **Date:** 2026-07-15
- **Status:** Accepted
- **Context:** Judges need to understand reuse, evidence trust, system responsibilities, and human oversight quickly, but a separate scripted application or dashboard would weaken credibility.
- **Decision:** Add one optional competition toolbar over the existing workspace. Judge Mode provides manual bilingual guidance only. Scenario comparison uses current-session engine results only and exposes no score or ranking. The architecture surface states the validated GPT-5.6, TypeScript, and human responsibilities. Evidence trust explains verified, missing, and rejected references. A bounded in-memory audit trail stores only safe action metadata and is included in JSON receipts. Add a dependency-free UTF-8 CSV evidence matrix derived from `ControlResult` data.
- **Rationale:** These surfaces make the validated architecture inspectable without changing review semantics, invoking a provider, creating a backend, or duplicating the product.
- **Consequences:** Audit history is intentionally session-local and is not a durable compliance log. Comparison rows disappear after refresh. Judge Mode never performs or records an action. CSV source excerpts remain in their original fictional language while headers follow the selected receipt language.

## D038 - Add a focused presentation over the same review state

- **Date:** 2026-07-15
- **Status:** Accepted
- **Context:** The complete Proofroom workspace is credible but too dense for a judge's first fifteen seconds. Case selection, workflow navigation, analytics, trust tools, and source registers compete with the primary Northstar proof moment.
- **Decision:** Make a Northstar-first Focused Demo the default presentation level and keep the existing Full Workspace as an explicit secondary level. Both presentations use the same `DemoReviewWorkspace` state, controls, documents, engine, evidence, decisions, receipt, and audit events. Keep the inactive Full Workspace mounted but hidden so component-local search state is not discarded. Reduce the visible Judge Mode sequence from twelve steps to four manual stages.
- **Rationale:** One additional presentation component creates a clear demonstration path without duplicating business logic, adding routing, or removing advanced capabilities.
- **Consequences:** Focused Demo intentionally collapses analytics, Case Library, audit details, comparison, and secondary exports. Switching presentation level changes no review data and makes no provider request. Full Workspace remains the authoritative advanced inspection surface.

## D039 - Fingerprint normalized review semantics, not human receipt state

- **Date:** 2026-07-15
- **Status:** Accepted
- **Context:** Judges need a concrete way to verify that deterministic checks reproduce the same conclusions, but timestamps, locale, UI state, comments, and reviewer decisions would make a review digest unstable or conflate computation with human accountability.
- **Decision:** Define `policyproof.review-fingerprint.v1` as a strict Zod payload containing normalized policy content, enabled controls and parameters, source documents and structured facts, deterministic results, exact evidence references, and validation state. Canonically sort documented semantic collections, normalize line endings and finite numbers, preserve Unicode code points, and compute a lowercase SHA-256 digest with Web Crypto. Exclude all presentation state, timestamps, audit events, human decisions, comments, and receipt metadata.
- **Rationale:** This boundary makes identical deterministic review semantics reproducible while keeping the fingerprint independent from the future receipt-integrity model.
- **Consequences:** A same-input rerun compares normalized inputs, conclusions, and the fingerprint without replacing current results or decisions. A parameter change uses the existing decision reset and produces an explicit diff. Unexpected same-input divergence preserves both result sets for human inspection. The digest is not a signature, proof of identity, authorship, or trusted time.

## D040 - Separate stable control IDs from display references

- **Date:** 2026-07-16
- **Status:** Accepted
- **Context:** The deterministic engine uses semantic IDs such as `CTRL-APPROVAL`, while the Proofroom interface presents ordered references such as `CTRL-01`. Receipts and exports must not make these look like different controls.
- **Decision:** Keep `controlId` as the stable technical join key, derive `displayReference` through one typed registry, and preserve both values in JSON, Markdown, CSV, print receipts, and safe control-specific audit events. Known deterministic mappings must be unique. Unregistered live control IDs use their stable ID as a visibly unmapped fallback rather than being renamed or rejected by the application.
- **Rationale:** An explicit mapping layer improves human traceability without migrating validated fixtures, changing engine joins, or altering Review Fingerprint semantics.
- **Consequences:** `CTRL-APPROVAL` remains the technical ID and `CTRL-01` remains its display reference. The Review Fingerprint continues to hash stable IDs only. Receipt-integrity payloads may include both fields because they protect one exact serialized receipt instance.

## D041 - Protect one receipt instance with a separate unkeyed integrity hash

- **Date:** 2026-07-16
- **Status:** Accepted
- **Context:** The Review Fingerprint intentionally excludes human decisions, comments, audit metadata, language, identifiers, and timestamps. It therefore cannot detect changes to one exported decision receipt.
- **Decision:** Define strict `policyproof.receipt-integrity.v1` and `policyproof.decision-receipt.v1` schemas. Canonicalize one receipt payload with the established deterministic-value rules, explicit semantic collection ordering, UTC timestamps, LF line endings, and native Web Crypto SHA-256. Store the digest in a separate `integrity` block. Verify current or locally selected/pasted JSON only in the browser and keep imported data isolated from active review state.
- **Rationale:** A second, clearly scoped hash makes receipt changes locally detectable without changing Review Fingerprint semantics, adding a dependency, uploading data, or claiming identity assurance.
- **Consequences:** Decisions, comments, included audit events, language, receipt ID, and generation time change the receipt hash but not the Review Fingerprint. The unkeyed hash is not a signature or trusted timestamp; someone able to replace both content and hash can create a new internally consistent digest.

## D042 - Run competition evidence through the existing deterministic engine

- **Date:** 2026-07-16
- **Status:** Accepted
- **Context:** A technical judge needs reproducible repository evidence that covers all three scenarios, 21 conclusions, causal business-rule changes, hostile inputs, fingerprints, and receipt integrity without a provider request or product UI expansion.
- **Decision:** Define `policyproof.competition-evaluation.v1`, `policyproof.business-rule-mutation.v1`, and `policyproof.adversarial-corpus.v1` as strict local evaluation contracts. Execute them inside the existing Vitest runtime, call the production scenario schemas and deterministic engine directly, block fetch and Node HTTP/HTTPS clients for the evaluation scope, and generate stable tracked Markdown and JSON reports without timestamps or local metadata. Use `pnpm eval:competition` for the complete harness and `pnpm demo:verify` for the focused judge gate.
- **Rationale:** Vitest already resolves the repository TypeScript aliases and requires no new runner or dependency. Reusing production functions avoids a second rule engine, while deterministic reports and failure exit codes make the evidence independently repeatable.
- **Consequences:** The harness has no browser or visible UI. It does not claim universal policy coverage or freshly rerun GPT-5.6 evidence. Northstar live validation remains historical; Meridian and Atlas remain deterministic and mocked. Any mandatory evaluation failure produces a non-zero command result.
