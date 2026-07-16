# Codex and GPT-5.6 usage

## Purpose

PolicyProof separates product ownership, development collaboration, model-assisted reading, deterministic checks, and final human judgment. This document records those responsibilities without relying on hidden reasoning or private provider payloads.

## Decisions made by the project owner

The owner selected and retained responsibility for:

- the procurement and vendor-change problem;
- finance, procurement, and internal-control reviewers as the audience;
- the Work & Productivity track;
- the controlled policy rules and threshold wording;
- the human-in-the-loop principle;
- Northstar, Meridian, and Atlas as fictional controlled scenarios;
- the evidence-first product positioning;
- the distinction between GPT-5.6 reading and TypeScript checking;
- scope reductions, including no authentication, database, OCR, ERP integration, score, or additional domain;
- phase acceptance, manual review, final validation, and submission decisions.

## Work accelerated by Codex

Under the owner's scope and staged approvals, Codex accelerated:

- the beginner-readable Next.js and TypeScript architecture;
- strict Zod schemas and shared domain types;
- the deterministic review engine and scenario generalization;
- the Focused Demo and Full Workspace implementation;
- English and French UI construction;
- exact-evidence validation and provider error diagnosis;
- unit, component, integration, evaluation, and Playwright tests;
- Review Fingerprint canonicalization and native SHA-256;
- decision-receipt canonicalization, hashing, and local verification;
- the Competition Evaluation Harness;
- business-rule mutation and adversarial test suites;
- regression diagnosis and low-risk corrections;
- technical, product, security, testing, submission, and release documentation;
- CI, clean-room reproducibility, and release-quality preparation.

Codex modified code only within the repository under the approved phase scope. It did not publish, deploy, merge, submit, or create external accounts.

## GPT-5.6 usage in the product

GPT-5.6 is used through server-only Next.js routes and the official OpenAI JavaScript SDK. Its supported responsibilities are:

1. interpret a written procurement policy;
2. propose structured controls for human review;
3. extract structured facts from explicitly selected fictional text documents;
4. locate exact source excerpts;
5. support the separately documented historical Northstar validation.

Structured model output is validated with Zod. Document references and exact excerpts are checked against controlled source text before deterministic evaluation.

## GPT-5.6 non-responsibilities

GPT-5.6 does not:

- perform the final deterministic amount, currency, date, threshold, role, or evidence-presence comparisons;
- make or approve the final reviewer decision;
- certify compliance;
- provide legal interpretation or professional assurance;
- authenticate source documents;
- sign receipts;
- establish identity, authorship, origin, authenticity, or trusted time.

## Historical validation boundary

Northstar has one sanitized historical live GPT-5.6 validation at commit `eb120feaca78bf3cdbc71b7b7198045f86a44852`, documented in `docs/evaluation/LIVE_GPT56_VALIDATION.md`. Release verification does not rerun that paid provider workflow. Meridian and Atlas are deterministic and mocked, not live GPT-5.6 validated.

## Deterministic verification boundary

`pnpm demo:verify`, `pnpm eval:competition`, and the deterministic portion of CI need no OpenAI API key and make no live provider request. They exercise controlled fixtures, shared production schemas, the deterministic TypeScript engine, exact-evidence checks, fingerprints, receipts, mutations, adversarial boundaries, and a scoped network guard.

## Human review and limitations

Codex produced and modified code under human-directed scope. The owner reviewed product direction and accepted each development phase; the owner remains responsible for final product, accessibility, production, video, repository, and submission validation.

Automated tests provide reproducible technical evidence but do not replace user research, professional policy interpretation, production security review, physical-device testing, screen-reader testing, or legal review.

No hidden chain of thought, private Codex reasoning, raw provider payload, API key, or private file is required to evaluate PolicyProof. Judges can inspect tracked code, deterministic reports, documented historical evidence, and repeatable commands.

## Build Week submission field

The primary Codex task's `/feedback` Session ID must be obtained and supplied by the owner in the official submission form. It is not invented or stored in this repository.
