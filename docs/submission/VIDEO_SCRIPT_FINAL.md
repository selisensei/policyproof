# PolicyProof Final Video Script — 2:50 Maximum

## Recording setup

- Use the deployed production URL at 1440 × 900, 100% zoom.
- Start in English, Focused Demo, Deterministic demo mode, with Northstar reset.
- Keep developer tools, bookmarks, credentials, provider identifiers, personal paths, and private tabs hidden.
- Prepare a backup deterministic recording. Do not depend on a live provider call during the video.

## 0:00–0:12 — Problem and promise

**Screen:** Focused Demo landing view.

**Narration:** “Business reviewers compare policy with scattered documents, but conclusions often lose their source. PolicyProof turns written policy into evidence-backed controls and human-reviewed conclusions.”

## 0:12–0:35 — Run the focused Northstar review

**Action:** Point to the seven controls and five fictional records, then choose **Run review**.

**Narration:** “This focused path uses one fictional procurement case, seven approved controls, and five records. The deterministic review produces three passes, two failures, one missing item, and one warning from the current inputs—not from precomputed display results.”

## 0:35–1:02 — Exact EUR/USD evidence

**Action:** Keep the outcome counts visible and open **Currency consistency**.

**Narration:** “Every conclusion links to supporting, contradictory, or explicitly missing evidence. Here, the purchase order says 12,480 euros while the invoice says 12,480 US dollars. PolicyProof preserves the source, locator, and exact excerpt behind the failure.”

## 1:02–1:28 — Same-input reproducibility

**Action:** Show the Review Fingerprint, choose **Rerun deterministic checks**, and reveal the matching comparison.

**Narration:** “The review also produces a versioned SHA-256 fingerprint from normalized policy, controls, source facts, evidence, and conclusions. Rerunning the same inputs reproduces all seven conclusions and the same fingerprint without a model call. This proves deterministic reproducibility; it is not a digital signature or trusted timestamp.”

## 1:28–1:55 — Explain one causal change

**Action:** Change the approval threshold from EUR 10,000 to EUR 15,000, rerun, and show the fingerprint comparison.

**Narration:** “When I change one meaningful input, the fingerprint changes. Only the approval control moves from fail to pass; the other six conclusions remain unchanged. The comparison connects input change to result change instead of hiding it behind a score.”

## 1:55–2:15 — Human decision

**Action:** Record a fictional human decision on Currency consistency and show the preserved automated result.

**Narration:** “The human remains accountable. A reviewer can confirm, reject, or accept an exception, while the original conclusion and evidence remain visible. Human decisions are deliberately excluded from the review fingerprint and belong to the decision receipt.”

## 2:15–2:38 — Full product and GPT-5.6 boundary

**Action:** Choose **Open full workspace**, then briefly show the policy-to-controls workflow and architecture explanation.

**Narration:** “The full workspace preserves the same state and adds policy, controls, documents, filters, receipts, and export. GPT-5.6 handles semantic policy interpretation and evidence extraction. TypeScript handles repeatable rules, and a human approves controls and final decisions.”

## 2:38–2:50 — Close

**Screen:** Return to the exact evidence or fingerprint comparison.

**Narration:** “PolicyProof does not certify compliance. It makes one review reproducible, inspectable, and answerable to evidence. PolicyProof: every conclusion traced to evidence.”

## Exact recording checklist

1. Reset Northstar and confirm Deterministic demo and Focused Demo.
2. Verify seven enabled controls and five fictional records are summarized without outcome counts.
3. Run at EUR 10,000: 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING.
4. Open Currency consistency: 12,480 EUR versus 12,480 USD.
5. Show the initial Review Fingerprint without exposing browser or server diagnostics.
6. Rerun the same inputs and verify 7/7 unchanged plus the same fingerprint.
7. Change the threshold to EUR 15,000 and verify only Approval changes from FAIL to PASS and the fingerprint changes.
8. Record one fictional human decision and show that the automated conclusion remains visible.
9. Open Full Workspace and show GPT-5.6 → TypeScript → Human.
10. Confirm the final edit is no longer than 2:50.
11. Watch the public upload in a private browser window and verify audio, readable text, and the correct public URL.

## Editing and backup guardrails

- Cut setup and scrolling before cutting substantive evidence.
- Use deterministic mode throughout; do not make a live request while recording.
- If the fingerprint comparison is missing, reset and repeat the documented deterministic sequence.
- Do not show a key, `.env.local`, provider request reference, console, local path, or mocked error as a public product result.
- Do not call the fingerprint a signature, identity proof, immutable record, or trusted timestamp.
- Do not claim compliance certification, production readiness, cross-industry generalization, or live GPT-5.6 validation beyond the documented Northstar case.
