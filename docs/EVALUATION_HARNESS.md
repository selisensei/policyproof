# PolicyProof Competition Evaluation Harness

## Purpose

The competition harness provides reproducible repository evidence for the controlled PolicyProof domain without adding a product screen or making a provider request. It executes the strict scenario fixtures through the same TypeScript engine used by the application and fails the command when a mandatory assertion fails.

## Versions and commands

- Evaluation schema: `policyproof.competition-evaluation.v1`
- Mutation schema: `policyproof.business-rule-mutation.v1`
- Adversarial corpus: `policyproof.adversarial-corpus.v1`
- Complete harness: `pnpm eval:competition`
- Focused technical gate: `pnpm demo:verify`

Both commands run locally. They need Node.js 24, pnpm 11.9.0, and installed repository dependencies. They do not need a browser, development server, `.env.local`, OpenAI API key, or live provider access.

## Architecture

Vitest is the existing TypeScript execution environment and resolves the repository's `@/` imports. The harness imports `ReviewScenarioSchema`, the three version-controlled fixtures, `runDeterministicReview()`, Review Fingerprint functions, and Receipt Integrity functions directly. It does not reproduce business rules in a script.

The command validates:

1. three strict scenario schemas;
2. all 21 expected deterministic conclusions;
3. all three expected outcome profiles;
4. known source and fact identifiers;
5. exact controlled excerpts and locators;
6. control-to-document evidence relationships;
7. scenario identity and state isolation;
8. same-input deterministic reproduction;
9. unchanged Review Fingerprints for identical semantic inputs;
10. Northstar threshold sensitivity and strict `amount > threshold` boundaries;
11. valid and modified receipts;
12. seven business-rule mutations;
13. ten adversarial cases;
14. zero network calls.

## No-network enforcement

During the complete evaluation, the harness temporarily replaces `globalThis.fetch` and Node HTTP/HTTPS `request` and `get` functions with failing guards. The guard is scoped to the evaluation call and restored afterward. No exception is allowed for OpenAI, PolicyProof AI routes, or another external endpoint. A network attempt fails the command before a PASS report can be produced.

## Results and exit codes

`pnpm eval:competition` prints a concise table. It returns zero only when all mandatory checks pass. Vitest supplies a non-zero exit code for a thrown error, failed assertion, invalid report, or mandatory FAIL state.

The command writes two deterministic tracked reports:

- `docs/evaluation/COMPETITION_EVALUATION_REPORT.md`
- `docs/evaluation/competition-evaluation-report.json`

They exclude generation time, duration, username, absolute path, environment values, provider data, browser metadata, and random identifiers. Semantic collections use stable fixture order. The command writes a report only when content differs, so an unchanged rerun leaves Git clean.

## Historical GPT-5.6 evidence

The harness executes deterministic checks now. It does not call GPT-5.6. Northstar's prior supervised live validation is labelled `HISTORICAL_EVIDENCE`, references `docs/evaluation/LIVE_GPT56_VALIDATION.md`, and identifies commit `eb120feaca78bf3cdbc71b7b7198045f86a44852`. Meridian and Atlas are deterministic and mocked only.

## Mutation methodology

Each mutation starts from a schema-validated defensive clone of Northstar, changes one controlled business fact, reruns all seven controls, compares statuses by stable technical control ID, verifies six unchanged controls, validates exact evidence, checks that no human decision leaked, and requires a changed Review Fingerprint. The source fixture is never modified globally.

To add a future mutation safely:

1. keep it inside the supported procurement-policy domain;
2. assign a stable mutation ID;
3. modify a schema-validated clone with exact source text and matching structured fact;
4. name one expected changed control and six unchanged controls;
5. add a focused test and matrix row;
6. run both verification commands twice.

## Adversarial methodology

The private test corpus covers prompt-like document text, false excerpts, unknown documents, wrong control relationships, duplicate document IDs, malformed JSON, script-like text, ambiguous numbers, ambiguous dates, and forbidden receipt fields. Safe rejection is preferred to guessing. These cases demonstrate only the tested PolicyProof boundaries; they do not prove universal prompt-injection or application-security resistance.

## Receipt security boundary

**EXPECTED SECURITY BOUNDARY:** receipt content matches the recorded hash, and modified content retained with the old hash is detected. The hash is not digitally signed. A party able to modify both content and hash can create a new internally consistent pair. The mechanism does not establish origin, identity, authorship, trusted time, or legal signature.

## Known limitations

- One procurement and vendor-change policy domain.
- Three controlled fictional scenarios and seven deterministic control types.
- No general policy-coverage measurement.
- No live provider accuracy benchmark.
- Adversarial cases validate named local boundaries, not universal security.
- The unkeyed receipt hash is tamper-evident only while the recorded hash is retained.

## Adding a future scenario safely

A future scenario must remain fictional, reuse supported control kinds, pass `ReviewScenarioSchema`, include exact source excerpts, define complete expected outcomes and evidence relationships, prove isolation, and be documented honestly as deterministic, mocked, historical, or live. Adding a fourth public case is outside the current hackathon scope.
