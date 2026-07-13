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
