# PolicyProof Final Video Script — 2:50 Target

## Recording setup

- Use the deployed production URL in a clean browser window at 1440 × 900.
- Start in English, Deterministic demo mode, with the workspace reset.
- Keep browser developer tools, personal bookmarks, credentials, and local paths hidden.
- Preload Northstar only after recording starts.
- Keep the optional guide collapsed so it does not cover the product.

## 0:00–0:15 — The problem

**Screen:** Policy step and product header.

**Narration:** “Business reviewers compare policy with scattered documents, but conclusions often lose their connection to the source. PolicyProof turns that work into a reviewable evidence ledger.”

## 0:15–0:32 — Policy and human-approved controls

**Action:** Scroll the policy briefly, open Controls, and point to the seven controls.

**Narration:** “GPT-5.6 can interpret the written policy and propose structured controls. A human must review, edit, enable, and approve them before analysis. For a reliable demo, I am using the same version-controlled controls through deterministic mode.”

## 0:32–0:47 — Fictional case documents

**Action:** Open Documents and select **Load Northstar demo**.

**Narration:** “The prototype uses five fictional procurement and vendor-change records. No real business data is needed, and the deterministic path makes no API request.”

## 0:47–1:15 — Case overview and outcomes

**Action:** Run the review. Show Case Overview and Outcome Composition.

**Narration:** “At a ten-thousand-euro approval threshold, the engine produces three passes, two failures, one missing item, and one warning. The composition is interactive: each segment filters the same control results rather than displaying separate analytics.”

## 1:15–1:42 — Evidence ledger

**Action:** Select the currency failure, then show Evidence Coverage and the evidence inspector.

**Narration:** “Every result links to exact supporting, contradictory, or missing evidence. Here the purchase order is in euros and the invoice is in US dollars. PolicyProof shows both verbatim excerpts, their sources, and an integrity check. An absent required record is shown as missing, never as a confident failure or pass.”

## 1:42–2:00 — Chronology and threshold sensitivity

**Action:** Show Chronology and Threshold Sensitivity.

**Narration:** “The chronology orders actual dates from the case. Threshold sensitivity explains the approval failure with the current amount and policy threshold, so the reviewer can see the cause instead of trusting a score.”

## 2:00–2:18 — Human decision and receipt

**Action:** Open Decision, select the currency result, choose Reject, add a short fictional comment, and show the receipt.

**Narration:** “The prioritized queue directs attention to unresolved risk. A reviewer can confirm, reject, or accept an exception. The original result remains visible beside the human decision, and the receipt can be printed or exported as JSON or Markdown.”

## 2:18–2:35 — Prove recalculation

**Action:** Return to Controls, change the threshold to EUR 15,000, rerun, and show Run Comparison.

**Narration:** “When I raise the threshold to fifteen thousand euros, only the approval control changes from fail to pass. The previous run is kept as one small local snapshot, proving the result is calculated from current inputs.”

## 2:35–2:45 — Bilingual and responsive

**Action:** Switch to French; briefly show the mobile capture as an edit or resize if stable.

**Narration:** “The full workspace switches between English and French without resetting evidence or decisions, and its evidence cards remain usable on mobile.”

## 2:45–2:55 — Close

**Screen:** Review workspace with the evidence ledger visible.

**Narration:** “PolicyProof uses GPT-5.6 for semantic interpretation, deterministic TypeScript for repeatable checks, and human judgment for the final review. Evidence first, confidence second.”

## Editing guardrails

- Keep the final public video under three minutes.
- Do not show a key, `.env.local`, provider request reference, developer console, personal file, or private URL.
- Do not claim general model accuracy, compliance certification, or production readiness.
- If the deployed live model is unavailable, keep the video entirely on the deterministic path and describe the validated live run from the repository report.

