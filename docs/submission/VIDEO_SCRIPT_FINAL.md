# PolicyProof Final Video Script: 2:50 Maximum

## Recording setup

- Use the deployed production URL at 1440 × 900 and 100% zoom.
- Start in English, Focused Demo, Deterministic demo mode, with Northstar reset.
- Hide developer tools, credentials, provider identifiers, personal paths, and private tabs.
- Use the deterministic path; do not depend on a provider request during recording.

## 0:00-0:12: Problem and promise

**Screen:** Focused Demo landing view.

**Narration:** “Business reviewers compare policy with scattered documents, but conclusions often lose their source. PolicyProof turns written policy into evidence-backed controls and human-reviewed conclusions.”

## 0:12-0:28: Run Northstar

**Action:** Show seven controls and five fictional records, then choose **Run review**.

**Narration:** “Northstar uses one fictional procurement case, seven approved controls, and five records. The current inputs produce three passes, two failures, one missing item, and one warning.”

## 0:28-0:58: Exact EUR/USD evidence

**Action:** Keep the counts visible and show Currency consistency with both excerpts.

**Narration:** “Every conclusion links to supporting, contradictory, or explicitly missing evidence. The purchase order says 12,480 euros while the invoice says 12,480 US dollars. PolicyProof preserves the source, locator, and exact excerpt behind the failure.”

## 0:58-1:20: GPT-5.6 and TypeScript responsibilities

**Screen:** Keep the evidence path visible.

**Narration:** “Codex helped me architect, implement, and test PolicyProof under my direction. In the validated live path, GPT-5.6 reads the policy and locates facts with exact excerpts. TypeScript checks supported comparisons, and a human decides.”

## 1:20-1:42: Same-input reproducibility

**Action:** Choose **Rerun deterministic checks** and reveal the matching comparison.

**Narration:** “Rerunning the same semantic inputs reproduces all seven conclusions and the same versioned Review Fingerprint without another model call.”

## 1:42-2:00: One causal change

**Action:** Change EUR 10,000 to EUR 15,000 and rerun.

**Narration:** “Changing one meaningful input changes the fingerprint. Approval moves from fail to pass; the other six conclusions remain unchanged.”

## 2:00-2:25: Human decision and receipt

**Action:** Record a fictional decision and comment, then choose **Generate receipt**.

**Narration:** “The human decision is recorded beside the preserved automated conclusion. The generated receipt binds the Review Fingerprint to this exact decision, comment, safe audit metadata, language, identifier, and timestamp.”

## 2:25-2:39: Verify receipt integrity

**Action:** Choose **Verify receipt integrity** and show the valid state.

**Required narration:** “This confirms that the content included in this receipt has not changed since it was generated. It is not a legal signature or trusted timestamp.”

## 2:39-2:47: Reuse

**Action:** Briefly show Meridian and Atlas in the Case Library or prepared supporting frame.

**Narration:** “Three controlled scenarios produce 21 conclusions through the same engine, and one command verifies the repository without a provider call.”

## 2:47-2:50: End frame

**Screen and narration:** “GPT-5.6 reads and locates. TypeScript checks. A human decides.”

## Exact recording checklist

1. Reset Northstar; confirm Deterministic demo and Focused Demo.
2. Run at EUR 10,000: 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING.
3. Show 12,480 EUR versus 12,480 USD with exact source references.
4. Rerun identical inputs: 7/7 reproduced and Review Fingerprint unchanged.
5. Change to EUR 15,000: Approval FAIL → PASS, six controls unchanged, fingerprint changed.
6. Record one fictional human decision and comment; generate the receipt.
7. Show Review Fingerprint, Receipt Integrity Hash, integrity version, and verified state.
8. Briefly show Meridian and Atlas without deep-diving into the Case Library.
9. Confirm the final edit is no longer than 2:50.
10. Check public playback in a private browser window.

## Guardrails

The static end frame may add the subtitle `3 controlled scenarios · 21 deterministic conclusions · one-command verification`. Do not add narration or extend the 2:50 duration. Terminal output may appear only for a few seconds and must never replace the EUR/USD evidence moment.

- Do not deeply show analytics, chronology, audit trail, all exports, mobile, French, or cryptographic implementation details.
- Do not make a live request while recording.
- Do not show a key, `.env.local`, provider reference, console, local path, or mocked error.
- Do not call either hash a signature, identity proof, immutable record, or trusted timestamp.
- Do not claim certification, production readiness, or live accuracy beyond the documented Northstar validation.
