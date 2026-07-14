# PolicyProof Final Video Script — 2:50 Maximum

## Recording setup

- Use the deployed production URL at 1440 × 900; demonstrate Judge Mode at 1280 × 720 only if the capture remains clear.
- Start in English, Deterministic demo mode, with Northstar reset and the Case Library visible.
- Keep developer tools, bookmarks, credentials, provider identifiers, personal paths, and private tabs hidden.
- Prepare a backup deterministic recording. Do not depend on a live provider call during the video.

## 0:00–0:12 — Problem and promise

**Screen:** PolicyProof header and Case Library.

**Narration:** “Business reviewers compare policy with scattered documents, but conclusions often lose their source. PolicyProof turns policy, controls, evidence, conclusions, and human decisions into one reviewable ledger.”

## 0:12–0:25 — Three controlled profiles

**Action:** Point to Northstar, Meridian, and Atlas without opening their expected results.

**Narration:** “These are three fictional controlled profiles: mixed-risk, compliant, and evidence-deficient. They use the same policy, seven control types, engine, and interface. No result count is revealed until the review runs.”

## 0:25–0:42 — Policy to controls

**Action:** Enter Judge Mode, briefly show the policy, then open Controls.

**Narration:** “GPT-5.6 can interpret the written policy and propose structured controls. A human reviews those proposals. Deterministic mode replays the same approved contract without an API request.”

## 0:42–1:05 — Northstar review

**Action:** Run Northstar. Show Case Overview and Outcome Composition.

**Narration:** “At ten thousand euros, Northstar produces three passes, two failures, one missing item, and one warning. These are runtime results from five fictional records, not precomputed display data.”

## 1:05–1:32 — Evidence coverage and EUR/USD

**Action:** Show Evidence Coverage, open Currency consistency, and keep both excerpts visible.

**Narration:** “Every conclusion links to exact supporting, contradictory, or missing evidence. The purchase order says 12,480 euros; the invoice says 12,480 US dollars. PolicyProof verifies the source identifier, locator, exact excerpt, and control relationship. A missing source is reported, never fabricated.”

## 1:32–1:52 — Human decision and receipt

**Action:** Open Decision, confirm the currency conclusion, and show the receipt/export toolbar.

**Narration:** “A reviewer confirms, rejects, or accepts an exception while the automated conclusion remains visible. The receipt combines evidence outcomes and human judgment and exports to print, JSON, Markdown, or CSV.”

## 1:52–2:15 — Threshold recalculation

**Action:** Return to Controls, change EUR 10,000 to EUR 15,000, rerun, and show Run Comparison.

**Narration:** “Changing the threshold recalculates the case. Only Approval changes from fail to pass, and the previous run remains visible. This makes the causal rule inspectable.”

## 2:15–2:32 — Reuse beyond Northstar

**Action:** Open completed-case comparison, then briefly cut to Meridian 7 PASS and Atlas 4 PASS, 1 FAIL, 2 MISSING captures.

**Narration:** “Meridian produces seven evidence-backed passes. Atlas exposes an approval failure and two missing sources. The shared engine behaves differently because their documents and facts differ—without a score or ranking.”

## 2:32–2:47 — Architecture and Codex

**Action:** Open the architecture explanation.

**Narration:** “GPT-5.6 handles semantic interpretation and extraction. TypeScript checks dates, amounts, currencies, counts, and presence. A human makes the final decision. Codex built and tested this end-to-end system with me in the primary build task.”

## 2:47–2:50 — Close

**Screen:** Architecture or exact evidence view.

**Narration:** “PolicyProof: every conclusion traced to evidence.”

## Exact recording checklist

1. Reset Northstar and confirm Deterministic demo.
2. Verify the Case Library shows all three profiles and no outcome counts.
3. Enter Judge Mode and keep Exit Judge Mode visible.
4. Run Northstar at EUR 10,000: 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING.
5. Open Currency consistency: 12,480 EUR versus 12,480 USD.
6. Record one human decision and show the receipt.
7. Rerun at EUR 15,000 and show Approval FAIL → PASS.
8. Show current-session comparison, Meridian 7/0/0/0, and Atlas 4/1/2/0.
9. Show GPT-5.6 → TypeScript → Human.
10. Exit Judge Mode before the closing frame if it obstructs evidence.
11. Confirm the final edit is no longer than 2:50.
12. Watch the public upload in a private browser window and verify audio, text, and URL.

## Editing and backup guardrails

- Cut setup and scrolling before cutting substantive evidence.
- Use deterministic Meridian and Atlas captures; do not make a live request during recording.
- If comparison state is missing, run the scenario once or use the prepared clean capture—never claim fixture expectations are session results.
- Do not show a key, `.env.local`, provider request reference, console, local path, or mocked error as a public product result.
- Do not claim compliance certification, production readiness, cross-industry generalization, or live GPT-5.6 validation for Meridian or Atlas.
