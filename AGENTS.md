# PolicyProof Repository Instructions

## Project context

PolicyProof is a solo OpenAI Build Week 2026 submission for the Work & Productivity track. It converts a written procurement policy into reviewable controls, evaluates one fictional document-based business case, and shows evidence for every result.

This repository must remain understandable to a first-time application builder and easy for hackathon judges to run and test.

## Communication

- Explain technical concepts and actions to the builder in clear French.
- Write code, filenames, documentation, UI copy, commit messages, and submission materials in English.
- Do not assume prior software development experience.
- After every important change, provide exact verification steps.

## Working method

- Inspect the existing project before modifying it.
- State a brief plan before substantial work.
- Keep most core development in the primary Codex thread.
- Prefer a narrow, reliable, end-to-end workflow over extra features.
- Document major product and engineering decisions in `DECISIONS.md` before or with the related change.
- Add and run relevant tests after each important implementation.
- Never claim that something works unless it has been tested.
- Report errors, limitations, and uncertainty honestly.

## Safety and scope

- Work only inside this repository unless the builder explicitly approves otherwise.
- Never request, display, log, or commit API keys, tokens, passwords, personal data, or confidential business documents.
- Use fictional demonstration data only.
- Do not enable full computer access.
- Do not run destructive Git or filesystem commands without explicit approval.
- Do not delete or overwrite substantial work without first explaining the consequences.
- Do not add authentication, payments, ERP integrations, multi-tenancy, unnecessary databases, or multi-agent application architecture.
- Avoid unnecessary dependencies and fake functionality.

## Product constraints

- The working product must meaningfully use GPT-5.6.
- The initial prototype covers one fictional procurement and vendor-change case only.
- A human must be able to review controls and confirm or override the final review.
- Every Pass, Fail, Missing, or Warning result must include traceable supporting or contradictory evidence, or an explicit explanation that evidence is missing.
- The final application must be functional, testable, deployed, and documented in English.

## Verification expectations

Before handing off an important change:

1. Run the relevant automated checks.
2. Perform the documented manual check when UI or model behavior changed.
3. Report exactly which checks passed, failed, or were not run.
4. Update `TESTING.md` when the verification process changes.
