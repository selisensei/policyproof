# PolicyProof Testing Strategy

## Purpose

Testing must prove both ordinary software behavior and PolicyProof's central trust claim: every conclusion is traceable to supplied evidence or clearly marked as unsupported. No feature is described as working until its relevant check has run.

## Test layers

### Static and production checks

- Strict TypeScript type checking
- ESLint
- Optimized Next.js production build
- Temporary local production server and HTTP smoke test
- Production dependency audit
- Secret-pattern scan

### Domain and deterministic tests

- Runtime schema validation
- All seven deterministic controls
- PASS, FAIL, MISSING, and WARNING outcomes
- Approval threshold change from EUR 10,000 to EUR 15,000
- Disabled-control exclusion
- Evidence traceability
- Human decision and required-comment rules
- Result counts and status filtering
- Decision receipt generation and validation
- Local file type, size, count, JSON, and inferred-label handling
- AI-to-domain mapping

### Component tests

Testing Library and jsdom cover:

- Loading and resetting the deterministic demo
- Running and rerunning the review
- Threshold editing
- Result filtering and evidence inspection
- Required reviewer comments and receipt updates
- Disabled Live GPT-5.6 guidance when no API key is configured
- Local fictional document selection and removal

### OpenAI integration tests

Automated tests do not make paid requests. They inject mocked policy-compilation and case-analysis functions at the server-handler boundary and validate:

- Successful structured policy compilation
- Rejection of malformed structured output
- Successful structured evidence extraction
- Evidence-reference and exact-excerpt validation
- Missing API key behavior
- Malformed request behavior
- Safe provider-failure responses that do not leak internal details

The production OpenAI SDK client is server-only. A controlled live-model evaluation is a separate builder-led step because it uses an authorized credential, can cost money, and can vary between runs.

### Browser test

Playwright with project-local Chromium covers:

1. Open the application.
2. Load the deterministic demo.
3. Run at EUR 10,000 and verify Approval threshold is FAIL.
4. Inspect Currency consistency evidence.
5. Record a human rejection with a comment.
6. Verify the decision receipt.
7. Change the threshold to EUR 15,000.
8. Rerun and verify Approval threshold is PASS.
9. Open a 390 x 844 viewport and verify the primary workflow remains visible and keyboard focus is reachable.

Successful runs generate ignored desktop and mobile screenshots under `test-results/` for local visual review.

## Commands

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit --prod
```

For the isolated Codex runtime, set `PLAYWRIGHT_BROWSERS_PATH=0` before the Playwright install and test so Chromium remains inside the project dependency directory.

## Recorded results - 2026-07-13

Initial preserved baseline:

- `pnpm test`: PASS - 3 files, 15 tests
- `pnpm typecheck`: PASS
- `pnpm lint`: PASS
- `pnpm build`: PASS

Current implementation:

- `pnpm test`: PASS - 9 files, 38 tests
- `pnpm typecheck`: PASS - no TypeScript errors
- `pnpm lint`: PASS - no ESLint errors or warnings
- `pnpm build`: PASS - optimized build; static `/` plus dynamic `/api/ai/status`, `/api/ai/policy`, and `/api/ai/analyze`
- `pnpm test:e2e`: PASS - 2 Chromium tests
- Production HTTP smoke test: PASS - `/` returned 200 and contained `PolicyProof`; `/api/ai/status` returned 200 and declared `gpt-5.6`
- `pnpm audit --prod`: PASS - no known vulnerabilities after the reviewed PostCSS 8.5.19 override
- Secret-pattern scan: PASS - 61 relevant project files scanned, 0 potential credential files
- Git whitespace check: PASS - `git diff --check` produced no output

The production smoke test queried only the local application and AI availability endpoint. It did not call the OpenAI model.

## Accessibility and responsive review

Completed checks:

- Native buttons, links, fieldsets, inputs, checkboxes, labels, tables, status regions, and alert regions are used for primary interactions.
- Testing Library queries exercise accessible roles and names.
- Playwright confirmed that keyboard focus becomes visible after Tab navigation.
- Playwright completed the primary layout check at a 390 x 844 mobile viewport.
- Desktop and mobile screenshots were visually inspected for hierarchy, legibility, and horizontal overflow; no blocking layout issue was observed.

Still required before submission:

- Screen-reader review
- Automated WCAG rule scan or equivalent focused audit
- Final browser review on the deployed URL
- Final contrast verification for any visual changes made after this phase

## Git review note

The repository has no first commit, so every project file is currently untracked and Git cannot produce a meaningful before/after diff. `git status --short`, the complete source and documentation set, the secret scan, and the quality gates were reviewed instead. No commit, push, or deployment was performed.

## Controlled live-model evaluation checklist

Use only approved fictional fixtures:

1. Configure `OPENAI_API_KEY` locally without sharing or logging it.
2. Confirm the Live mode reports `gpt-5.6`.
3. Compile the fictional policy and inspect every proposed control before approval.
4. Run case analysis with fictional text documents.
5. Confirm every quoted excerpt exists exactly in the supplied source text.
6. Compare deterministic outcomes with the human-reviewed expected results.
7. Record disagreements and adjust prompts or schemas openly; do not hide them.
8. Rerun all automated checks after any change.

## Manual acceptance checklist

- The complete deterministic workflow can be finished without developer tools.
- UI copy is understandable in English.
- Deterministic and AI-generated content are clearly distinguished.
- Controls can be edited or disabled before analysis.
- Every result has a status, explanation, and evidence or explicit missing item.
- Overrides require context and preserve the original result.
- Errors are visible and do not reveal secrets.
- The final receipt includes the required metadata and disclaimer.
- The deployed layout works at common laptop and mobile widths.
