# PolicyProof Product Narrative

## Tagline

**From policy text to an evidence-backed human decision.**

## The work problem

Finance, procurement, audit, and internal-control teams regularly compare written policy with purchase orders, invoices, approvals, delivery records, and vendor-change evidence. The work is repetitive, but it is not simple: policy is written in prose, evidence is spread across records, exceptions require judgment, and every conclusion must be defensible later.

Traditional checklists capture an answer but often lose the chain that produced it. Generic AI chat can summarize documents, but a conversation does not provide a stable control register, deterministic calculations, exact source citations, or a preserved reviewer decision.

## The product idea

PolicyProof makes the review chain explicit:

**Policy → Control → Evidence → Conclusion → Human decision**

GPT-5.6 interprets policy language and extracts structured facts and exact excerpts. A human approves the proposed controls. TypeScript performs supported calculations. The workspace then shows PASS, FAIL, MISSING, or WARNING with traceable evidence and asks the reviewer to confirm, reject, or accept an exception.

## The Northstar demonstration

The prototype intentionally covers one fictional procurement and vendor-change case. Five records are evaluated against seven controls. At a EUR 10,000 approval threshold, the case produces:

- 3 PASS;
- 2 FAIL;
- 1 MISSING;
- 1 WARNING.

The most visible contradiction is a EUR 12,480 purchase order against a USD 12,480 invoice. The most useful causal demonstration is the approval threshold: at EUR 10,000, the amount exceeds the threshold and only one of two required approvers is recorded, so the control fails. At EUR 15,000, the two-approver rule is not triggered and the control passes.

## Review intelligence, not a generic dashboard

PolicyProof does not calculate a compliance score. Instead, each visual answers one operational question:

- **Case Overview:** What is the current state and what needs attention?
- **Outcome Composition:** How are the seven results distributed?
- **Evidence Coverage Map:** Which documents support or contradict each control, and where is evidence missing?
- **Chronology:** Did the purchase order, delivery, and invoice occur in the expected sequence?
- **Threshold Sensitivity:** Why did the approval result pass or fail?
- **Run Comparison:** What changed after a reviewer edited the threshold?
- **Reviewer Queue:** Which unresolved conclusion should be reviewed next?

Every value comes from structured case data. There are no decorative metrics or invented business claims.

## Human judgment is a product feature

PolicyProof preserves the automated conclusion even when the reviewer disagrees. Confirming a conclusion is the standard path. Rejecting it or accepting an exception requires a comment. The receipt records both layers so a later reader can distinguish what the system concluded from what the person decided.

## Why GPT-5.6 matters

Policy and document language vary. GPT-5.6 provides the semantic layer that proposes structured controls and extracts facts with exact excerpts. Strict Zod schemas validate the structure, source checks reject excerpts that do not occur in the submitted fictional text, and deterministic code handles supported calculations. GPT-5.6 never approves a payment or issues a compliance certification.

## Work & Productivity fit

PolicyProof reduces the effort required to organize a first review, find exceptions, trace evidence, explain causal rules, and produce a review receipt. It is designed for professional work where speed matters but inspectability matters more.

## Honest scope

This is a hackathon prototype, not production compliance software. It supports one fictional case and text-based documents only. Browser state is temporary, run comparison is a local convenience rather than durable audit storage, and broader policy accuracy has not been evaluated. Authentication, databases, collaboration, ERP integration, PDF parsing, OCR, and production governance are intentionally absent.
