# PolicyProof Demo Script — Under Three Minutes

Target duration: approximately 2 minutes 45 seconds. Use the deterministic path as the recorded primary path. Do not wait for a live API call during the video.

## 0:00–0:15 — Problem and product

**Screen:** Proofroom Policy folio, English interface. Select **Start guided demo**, then dismiss the checklist if it covers the recording area.

**Narration:** “Finance and procurement reviewers spend time matching written policy to scattered documents, then explaining how each conclusion was reached. PolicyProof turns policies into reviewable controls and shows the exact evidence behind every conclusion.”

## 0:15–0:35 — Policy and controls

**Action:** Expand the fictional policy, then open Controls.

**Narration:** “This fictional policy becomes seven explicit controls. Each control has a severity, can be enabled or disabled, and keeps supported parameters visible. In Live mode, GPT-5.6 proposes this structure, but a human must review and approve it.”

## 0:35–0:50 — Fictional documents

**Action:** Open Documents and briefly expand the purchase order and invoice.

**Narration:** “The guaranteed demo uses five version-controlled fictional records: a purchase order, invoice, delivery note, approval workflow, and vendor-change request.”

## 0:50–1:15 — Review matrix

**Action:** Run the review and let the Proofroom Evidence review workspace open automatically.

**Narration:** “At a ten-thousand-euro threshold, PolicyProof calculates three passes, two failures, one missing item, and one warning. The result register separates the control outcome from the pending human decision.”

## 1:15–1:40 — Exact evidence

**Action:** Select Currency consistency in the result register.

**Narration:** “Currency consistency fails because the purchase order says EUR while the invoice says USD. The selected ledger row stays connected to both exact excerpts and a direct amount-and-currency comparison. Missing controls identify the evidence that should have been present.”

## 1:40–2:00 — Human decision and receipt

**Action:** Open Decision, type a short comment, select Reject.

**Narration:** “A reviewer can confirm the result or record an override. Rejecting or accepting an exception requires context. The receipt preserves the original result, human decision, comment, timestamp, mode, and disclaimer, and is ready to print or export as structured JSON.”

## 2:00–2:20 — Deterministic recalculation

**Action:** Open Controls, change the threshold to 15000, run again, point to Approval threshold PASS.

**Narration:** “Changing the threshold to fifteen thousand recalculates the approval control from FAIL to PASS and clearly resets previous human decisions. The results are computed, not stored as a prebuilt final array.”

## 2:20–2:35 — Bilingual experience

**Action:** Switch to Français and briefly move between Revue and Décision.

**Narration:** “The full interface also switches instantly between English and French without losing the case, results, or reviewer state. Original evidence stays unchanged for traceability.”

## 2:35–2:50 — GPT-5.6 and Codex

**Screen:** Mode selector and architecture diagram in README, or Live mode disabled state.

**Narration:** “GPT-5.6 is responsible for policy interpretation and evidence extraction. The fictional Northstar flow was validated live, while strict schemas and source checks validate output and TypeScript performs supported calculations. Codex implemented and tested the approved Proofroom design inside the existing architecture.”

## 2:50–2:58 — Close

**Narration:** “PolicyProof makes business review faster to inspect, safer to challenge, and easier to explain—evidence before confidence, and a human before the final judgment.”
