# PolicyProof

PolicyProof is an OpenAI Build Week 2026 project for the Work & Productivity track. It turns a written business policy into reviewable controls, evaluates a fictional document-based business case, and keeps every result connected to supporting, contradictory, or missing evidence.

## Problem and solution

Finance, procurement, and internal-control reviewers often compare policy text with scattered business documents. Conclusions can become difficult to reproduce because the underlying evidence is separated from the review result.

PolicyProof provides one focused workspace to review controls, run a case, inspect exact excerpts, record human judgment, and produce a local decision receipt. It is a review aid, not an autonomous approval tool or a compliance certification.

## Current status

The deterministic demo is the guaranteed, fully tested path. It uses version-controlled fictional fixtures and makes no AI request.

The Live GPT-5.6 path is implemented behind a server-only API boundary. It can compile policy text into proposed controls and extract structured facts from selected text documents. All automated AI tests use mocks; no paid model request was made during this phase, so a controlled live evaluation is still required before deployment.

## Screenshots

Submission screenshots will be added here after final visual validation and before the repository is published.

- TODO: Desktop evidence-review workspace
- TODO: Mobile deterministic workflow
- TODO: Live GPT-5.6 policy compilation with fictional content

## Product workflow

1. Review the policy.
2. Review, edit, enable, or disable controls.
3. Load the bundled demo case or select fictional local text documents.
4. Run the deterministic review and filter its outcomes.
5. Inspect evidence, record a human decision, and read the decision receipt.

## Technical stack

- Next.js 16.2.10 and React 19.2.7
- TypeScript 6.0.3 in strict mode
- Tailwind CSS 4.3.2
- Zod 4.4.3
- OpenAI JavaScript SDK 6.46.0
- Vitest 4.1.10 and Testing Library
- Playwright 1.61.1 with Chromium
- pnpm 11.7.0 with a committed lockfile and restricted dependency build scripts

There is no database, authentication, payment system, ERP integration, OCR service, or multi-agent application architecture.

## Prerequisites

- Node.js 24 or newer
- pnpm 11.7.0
- Git

Docker, Python, and GitHub CLI are not required to run the application.

## Local setup

From a PowerShell terminal:

```powershell
Set-Location "D:\noxyf\Documents\OpenAI-Build-Week\policyproof"
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Stop the server with `Ctrl+C`.

If Node.js and pnpm are not available in the normal Windows `PATH`, use the Codex runtime:

```powershell
Set-Location "D:\noxyf\Documents\OpenAI-Build-Week\policyproof"

$nodeBin = "C:\Users\noxyf\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
$env:PATH = "$nodeBin;$env:PATH"
$pnpm = "C:\Users\noxyf\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"

& $pnpm install
& $pnpm dev
```

Project commands disable Next.js telemetry. `pnpm-workspace.yaml` allows dependency build scripts only for `sharp` and `unrs-resolver`.

## Deterministic demo instructions

1. Confirm that **Deterministic demo** is selected and the amber disclosure says no AI request is made.
2. Select **Load demo case**.
3. Leave the approval threshold at `10000` and select **Run review**.
4. Confirm the expected outcomes:
   - Purchase order timing: PASS
   - Amount match: PASS
   - Currency consistency: FAIL
   - Approval threshold: FAIL
   - Delivery evidence: PASS
   - Independent bank verification: MISSING
   - Segregation of duties: WARNING
5. Filter to FAIL and inspect **Currency consistency**. Confirm that the purchase order excerpt uses EUR and the invoice excerpt uses USD.
6. Enter a reviewer comment and select **Reject**. Confirm that the decision receipt preserves the original result and records the human decision.
7. Change the approval threshold to `15000`, select **Run review**, and confirm that **Approval threshold** changes to PASS. A rerun intentionally resets prior reviewer decisions.
8. Select **Reset demo** and confirm that results are cleared and all seven controls return to their defaults.

## Live GPT-5.6 setup

Live mode is disabled when no server-side API key is configured. The deterministic demo remains available.

1. Copy `.env.example` to `.env.local`.
2. Edit `.env.local` locally and set `OPENAI_API_KEY` to your own key. Never paste the value into chat, documentation, screenshots, or source control.
3. Restart `pnpm dev`.
4. Confirm that **Live GPT-5.6** becomes available.
5. Use only fictional policy text and fictional `.txt`, `.md`, or `.json` documents.
6. Compile the policy, review and edit the proposed controls, explicitly approve them, then run the case analysis.

Supported local documents are limited to 10 files, 1 MB each. Files are read in the browser and are sent externally only when the user explicitly runs Live analysis. PDF and OCR are not supported.

### Environment variables

| Variable | Required | Scope | Purpose |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Live mode only | Server only | Authenticates Responses API requests. |

The key is never returned by `/api/ai/status` and is never included in browser code.

## GPT-5.6 integration

The model configuration is isolated in `src/openai/config.ts` and uses the official `gpt-5.6` alias, Responses API, low reasoning effort, request timeout, and Structured Outputs validated with Zod. This follows the official [latest model guide](https://developers.openai.com/api/docs/guides/latest-model) and [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs).

GPT-5.6 is responsible for policy interpretation and evidence extraction. TypeScript remains responsible for amount and currency comparison, date ordering, approval counting and thresholds, document presence, segregation-of-duties equality checks, result summaries, human decisions, and receipts.

The server validates that every quoted evidence excerpt exists in the supplied fictional source text. Provider errors are converted into safe user-facing messages. GPT-5.6 does not approve payments and does not issue a legal or compliance certification.

## Architecture overview

- `app/` contains the Next.js page, styles, and server API routes.
- `components/workspace/` contains focused UI sections; `DemoReviewWorkspace` owns temporary page state.
- `src/domain/` contains Zod schemas and shared domain types.
- `src/fixtures/` contains the deterministic fictional policy, controls, documents, and facts.
- `src/lib/` contains deterministic review, receipt, summary, and local-document logic.
- `src/openai/` contains server-only client configuration, prompts, mappers, validation, and safe route handlers.
- `tests/` contains unit, integration, component, and browser tests.

The browser never calls OpenAI directly. Live requests pass through server routes, validated structured outputs are mapped into domain objects, and deterministic code calculates supported controls.

## Testing

Run the mandatory checks:

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Install the Playwright browser once, then run the critical journey:

```powershell
pnpm exec playwright install chromium
pnpm test:e2e
```

In the isolated Codex runtime, keep the browser inside the project:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "0"
& $pnpm exec playwright install chromium
& $pnpm test:e2e
```

Run the production dependency audit with:

```powershell
pnpm audit --prod
```

The latest recorded results are in `TESTING.md`.

## Security and privacy

- Never commit `.env.local` or any credential; environment files are ignored except `.env.example`.
- Use fictional demonstration data only.
- The OpenAI client is server-only.
- Model output is schema-validated and evidence excerpts are checked against submitted text.
- Deterministic demo mode does not make external requests.
- Selected local files remain in browser memory until an explicit Live analysis request.
- Dependency build scripts are restricted and the production dependency audit currently reports no known vulnerabilities.

## Known limitations

- The prototype covers one procurement and vendor-change case only.
- Browser state is temporary and is lost on refresh.
- Live GPT-5.6 behavior has automated mocked coverage but has not yet received a paid controlled evaluation.
- Semantic controls that cannot be computed deterministically are not converted into a final automated approval.
- Only `.txt`, `.md`, and `.json` local files are supported; there is no PDF or OCR workflow.
- There is no deployed URL, persistence, authentication, collaboration, or external business-system integration.
- The current accessibility review is basic; a final assistive-technology review remains before submission.

## How Codex contributed

This primary Codex task contains the core build history. Codex inspected the baseline, implemented the deterministic and GPT-5.6 architecture, refactored the interface, added tests, ran quality and security checks, and maintained the English product documentation. The builder remains responsible for product decisions, controlled live-model validation, deployment, demonstration recording, and final submission approval.

## Accounts and credentials needed later

- OpenAI API account with billing or hackathon credits and GPT-5.6 access
- One OpenAI API key stored only in local and deployment environment settings
- GitHub account and submission repository
- Vercel account linked to the repository
- YouTube account for the public video under three minutes

## Hackathon submission checklist

- [ ] Builder validates the deterministic demo manually
- [ ] Controlled GPT-5.6 evaluation passes with fictional data
- [ ] Repository is committed and published
- [ ] Application is deployed and smoke-tested
- [ ] English README includes final screenshots and deployment URL
- [ ] Public YouTube demonstration is under three minutes
- [ ] Primary Codex `/feedback` Session ID is recorded

## License

No license has been selected yet.
