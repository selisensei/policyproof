# PolicyProof Review Intelligence Audit

## Audit scope

This audit evaluates the validated Proofroom interface as a hackathon judge, audit manager, procurement controller, finance director reviewing an exception, and first-time user on a 13-inch laptop. It uses the current deterministic Northstar workflow, the approved Proofroom references, and fresh captures at 1440 × 900, 1280 × 720, 1024 × 768, and 390 × 844.

## Current strengths

- The product has a distinctive evidence-led identity built around stable policy, control, document, fact, and decision references.
- The deterministic workflow is real: seven controls produce 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING from five fictional documents.
- The selected result remains connected to exact evidence and the EUR/USD contradiction is visible without relying on model prose.
- Automated conclusions and human decisions remain separate, and overrides require a comment.
- English and French presentation, keyboard result navigation, reduced motion, print, and safe provider errors already have automated coverage.
- The narrow product scope is credible for finance, procurement, audit, and internal-control users.

## Current weaknesses

### Artificial density

- Review opens with filters, a seven-column result register, an evidence case file, small provenance labels, repeated section headings, and footer actions competing at the same visual level.
- Several useful facts are present but fragmented. A reviewer must assemble the overall case state mentally before deciding where to look.
- Uppercase mono metadata is overused. It makes stable references visible but reduces the contrast between operational facts and decorative system language.
- Body and metadata text are often too small for a 13-inch laptop or a compressed demo recording.

### Weak attention hierarchy

- FAIL, MISSING, WARNING, and unresolved decisions are visible, but the interface does not explicitly prioritize them.
- The first selected row is not necessarily the next item that deserves human attention.
- PASS results occupy the same structural weight as exceptions.
- The main next action is distributed between header, register footer, evidence footer, and workflow navigation.

### Limited visual storytelling

- The outcome counts are expressed primarily as filter buttons, so a judge must read each label instead of seeing the case composition immediately.
- Evidence coverage is visible only one control at a time. The interface cannot answer which documents support or contradict the complete review.
- The three operational dates are buried in individual evidence excerpts rather than shown as a sequence.
- The approval threshold change is explained in text but does not expose the relationship between amount, threshold, required approvers, and recorded approvers as a compact visual.
- A rerun replaces the current review without a concise before/after comparison.

### Laptop and mobile friction

- At 1280 × 720, the optional guide overlaps the main content and important review information falls below the fold.
- At 390 × 844, the open guide consumes nearly the entire first viewport.
- The mobile Review transformation is intentional, but evidence blocks remain long and exception triage still requires considerable vertical scrolling.
- The interface uses many horizontal labels and metadata fragments that wrap poorly in French.

### Demo friction

- A judge cannot understand the complete case state within the first 15 seconds without running and scanning the register.
- The strongest proof moments—outcome mix, evidence coverage, chronology, threshold sensitivity, and run change—are not grouped into a memorable narrative.
- The guide explains nine steps but can cover the content it is meant to teach.

## Questions the interface does not answer quickly enough

1. What happened in this case?
2. Which exceptions require attention first?
3. Why did each exception occur?
4. Which documents support or contradict each control?
5. Is evidence missing, invalid, or merely not applicable?
6. Did the purchase order, delivery, and invoice occur in the expected order?
7. Why does the approval control fail at EUR 10,000 and pass at EUR 15,000?
8. What changed since the previous run?
9. Which human decision should be recorded next?
10. Can this evidence citation be trusted as an exact source reference?

## Unnecessary visual noise

- Repeated tiny uppercase labels where sentence case would be faster to scan.
- Method abbreviations such as `TS` and `GPT` without a user-facing explanation.
- Confidence percentages on exact evidence, which can be mistaken for evidence quality or compliance confidence.
- Empty supporting, contradictory, and missing sections rendered with equal weight even when a section has no content.
- Multiple simultaneous calls to the same next step.
- A permanently open guide that competes with the workflow at smaller viewports.

## Information that deserves stronger emphasis

- Case identity, current threshold, run time, mode, control count, document count, unresolved count, and exception count.
- The 3 / 2 / 1 / 1 outcome composition.
- Unresolved high-severity FAIL, MISSING, and WARNING controls.
- Exact evidence integrity: source found, excerpt verified, or evidence absent/rejected.
- Cross-document relationships for currency and chronology.
- The amount-to-threshold relationship and recorded approval gap.
- Differences between the current and immediately previous run.
- The next human decision and its evidence context.

## Proposed layout corrections

1. Keep the compact Proofroom shell, but make the guide collapsed by default after it has been introduced and convert it to a non-obstructive mobile drawer.
2. Add a compact Case Overview at the top of Review after a run. It should summarize real case state without becoming a generic KPI dashboard.
3. Place an attention-led reviewer queue before the complete result ledger. Order unresolved FAIL, MISSING, and WARNING results before PASS results while preserving access to every control.
4. Group the four evidence-led visuals into a responsive analysis band below the overview: outcome composition, evidence coverage, chronology, and threshold sensitivity.
5. Preserve the detailed result/evidence workbench as the source inspection surface, but increase body and excerpt sizes and reduce repeated empty content.
6. Show run comparison only when a valid previous run exists. Keep it compact and adjacent to rerun context.
7. Keep Decision focused on one selected control, with previous/next unresolved navigation and evidence integrity visible before the action buttons.

## Proposed visualizations and operational value

### Outcome Composition

A stacked horizontal bar shows the exact PASS, FAIL, MISSING, and WARNING distribution. It answers “what is the review state?” in one glance, remains tied to filter actions, and includes explicit counts and a text alternative. It is not a score and has no invented denominator.

### Evidence Coverage Map

A control-by-document matrix shows supporting, contradictory, missing, and not-applicable relationships derived from actual result evidence and required sources. It answers “where does the conclusion come from?” and “which records are absent?” across the complete case. Cells navigate to the relevant result or document evidence and retain text/glyph encodings beyond color.

### Case Chronology

A three-event timeline uses the purchase order date (2026-07-03), delivery date (2026-07-04), and invoice date (2026-07-05). It answers “did events occur in the expected sequence?” and connects directly to timing evidence. The mobile form becomes an ordered vertical list.

### Approval Threshold Sensitivity

A compact number line compares the EUR 12,480 transaction to the active threshold and displays two required approvers versus one recorded approver. It answers “why did this control change?” At EUR 10,000 it explains FAIL; at EUR 15,000 it explains PASS. It is a direct visualization of deterministic inputs, not a forecast.

### Run Comparison

A small before/after ledger compares the current and immediately previous deterministic run. It answers “what changed after the threshold edit?” and records only the minimum safe local snapshot: run ID, timestamp, threshold, summary, and control statuses.

## Proposed workflow features

- Reviewer queue with previous, next, jump-to-control, and view-evidence actions.
- Local search across control identifiers, localized titles, document names, evidence excerpts, and reviewer decision state.
- Evidence integrity indicators that distinguish exact source validation, explicit missing evidence, and rejected/withheld evidence. No arbitrary confidence score.
- Clear empty states for no run, no previous run, filtered/search empty, and all controls disabled.
- Optional Markdown receipt export only if it can be implemented without a dependency and remains consistent with JSON and print output.
- Contextual guide steps that highlight the current surface without covering it.

## Explicitly rejected features

- Compliance score: rejected because any composite weighting would be arbitrary and could conceal material exceptions.
- Generic KPI dashboard: rejected because case review requires traceability, not decorative metrics.
- Pie, donut, gauge, radar, and 3D charts: rejected because they reduce comparison precision or imply scoring.
- Graph/network library: rejected because the seven-control case can be explained with semantic HTML and SVG.
- Command palette: rejected because seven controls and five documents do not justify a hidden power-user interaction model.
- Chatbot or AI assistant: rejected because conclusions must remain structured, reviewable, and evidence-linked.
- Database, authentication, collaboration, PDF/OCR, and telemetry: rejected as outside the validated hackathon scope.
- Arbitrary confidence percentages: rejected as a proxy for evidence integrity. Exact source validation is the relevant signal.
- Bulk human approval: rejected because each conclusion requires individual professional judgment.

## Audit conclusion

The validated Proofroom foundation should be preserved, but Review must become an attention-led intelligence workspace. The improvement is not more data; it is a clearer sequence: understand the case, see the exceptions, inspect the evidence, understand the causal relationship, and record the human decision. Every proposed visual can be calculated from existing structured Northstar data and remains useful without a live provider call.
