# PolicyProof Judge Q&A

## What problem does PolicyProof solve?

It helps finance, procurement, audit, and internal-control reviewers turn written policy into explicit checks, compare those checks with case documents, and keep each conclusion connected to exact evidence.

## Why is GPT-5.6 necessary?

Policy language and business documents are variable and semantic. GPT-5.6 is used to propose structured controls and extract structured facts and exact excerpts. A human approves controls, schemas validate the output, and source checks reject excerpts that are not present.

## What is deterministic?

TypeScript compares amounts and currencies, orders dates, counts approvers, evaluates thresholds and document presence, checks segregation of duties, calculates summaries, and creates receipts.

## What prevents hallucinated evidence?

Structured output must pass strict schemas, every source identifier must match a submitted document, and every quoted excerpt must be found verbatim in that source. Missing or invalid output fails closed.

## Why not use a chatbot?

Review work needs repeatable controls, visible status definitions, side-by-side evidence, and a preserved human decision. A structured workspace makes those responsibilities inspectable instead of hiding them in a conversation.

## How is human oversight preserved?

GPT proposals start unapproved. The reviewer can edit, reject, or approve controls, inspect every result, and confirm, reject, or accept an exception with context. The original result is preserved beside the human decision.

## How is Codex used?

The primary Codex task contains the core build history. Codex helped inspect the environment, plan the product, implement the application and tests, diagnose errors safely, refine the interface, and prepare documentation. The solo builder owns product decisions, credentials, live validation, deployment, recording, and final submission.

## Is this a compliance certification tool?

No. PolicyProof is a fictional prototype and review aid. It does not provide legal advice, certify compliance, approve payment, or replace professional judgment.

## What happens when GPT-5.6 is unavailable?

The deterministic Northstar demonstration remains fully usable and makes no OpenAI request. Live failures return a safe category and reference while provider details stay server-side.

## What would a production version require?

Validated ingestion for real formats, organization-specific control governance, secure identity and authorization, durable audit storage, privacy and retention controls, monitoring, model evaluations, broader security review, and legal/compliance validation. Those systems are intentionally outside this hackathon prototype.
