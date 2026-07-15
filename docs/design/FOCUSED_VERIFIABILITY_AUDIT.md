# PolicyProof Focused Verifiability Audit

## 1. Current strengths

- Proofroom has a distinctive evidence-led visual identity.
- Northstar produces a real deterministic 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING profile.
- Exact EUR and USD excerpts, source references, human decisions, and receipts are already connected.
- Full Workspace supports three scenarios, English/French, keyboard use, responsive layouts, exports, audit metadata, and review intelligence.

## 2. Current weaknesses

- The first screen exposes Case Library, an introductory folio, competition tools, a notice, workflow navigation, and the policy before the primary review action.
- After a review, Case Overview and four analytics panels delay access to the selected evidence workbench.
- The complete product is understandable after exploration, but not within a judge's first fifteen seconds.

## 3. First-15-second experience

At 1440 × 900, the initial screen explains the product but offers several competing entry points. At 1280 × 720, the primary evidence contradiction is not visible immediately after the review. On mobile, Case Library and introductory content create substantial vertical travel before the policy and action.

## 4. Current critical path

The current path requires navigating Policy, Controls, Documents, Review, analytics, the result register, evidence, Decision, and receipt. This is appropriate for professional inspection but too long for the primary video and judge path.

## 5. Unnecessary visual competition

- The complete Case Library dominates the initial impression.
- Scenario comparison, architecture, audit trail, and Judge Mode have equal toolbar weight.
- Case Overview, Evidence Coverage, Chronology, Threshold Sensitivity, and Run Comparison appear before the strongest exact-evidence moment.
- Secondary exports compete with the receipt's human-oversight story.

## 6. Elements to keep in Focused Demo

- Product promise and truthful scope.
- Northstar case identity and fictional-data notice.
- Seven enabled deterministic controls.
- One dominant Run review action.
- Outcome counts, Currency consistency, EUR/USD excerpts, exact-source validation, deterministic rerun, human decision, and receipt access.

## 7. Elements to move to Full Workspace

- Case Library and the complete five-step workflow.
- Case Overview, evidence coverage matrix, chronology, threshold visualization, reviewer queue, search, run comparison, scenario comparison, architecture details, audit trail, assumptions, and secondary exports.

## 8. Judge Mode changes

Replace the visible twelve-step sequence with four stages: run the review, inspect the evidence, reproduce the result, and record the decision. Guidance remains manual, bilingual, optional, keyboard-accessible, state-preserving, and unable to call GPT-5.6.

## 9. Mobile and 1280 × 720 risks

- Evidence cards must stack without hiding source references.
- The primary action and selected exception must remain above secondary disclosures.
- The fingerprint must remain subordinate to evidence and human judgment.
- Full hexadecimal output must wrap safely when expanded.

## 10. Claims that need tightening

- Prefer “exact evidence references that cannot be located are rejected” over absolute hallucination-prevention claims.
- Describe deterministic reruns as reproduction from normalized inputs, not certification.
- Describe SHA-256 as a change-detection fingerprint, not a signature, immutable record, proof of authorship, or trusted timestamp.

## 11. Implementation decisions

- Use one React state owner and two presentation levels.
- Default to Focused Demo without automatically running a review.
- Keep Full Workspace mounted but hidden to preserve component-local state.
- Reuse the shared engine, evidence references, decision handlers, receipt, and audit trail.
- Add no dependency and preserve Proofroom tokens.

## 12. Rejected ideas

- A separate static demo application.
- Automatic review, threshold change, or decision recording.
- A compliance score, confidence percentage, decorative hash, new chart, or chatbot.
- Removing advanced analytics instead of preserving them in Full Workspace.
