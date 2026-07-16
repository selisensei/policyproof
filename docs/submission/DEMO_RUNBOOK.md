# PolicyProof Demo Runbook

## Purpose

This runbook gives the builder a repeatable, low-risk path for the public demo and judge review. Use the deterministic Northstar workflow as the primary demonstration. It is complete, tested, and makes no OpenAI request.

## Before the demo

For a quick technical repository check before opening the browser, run `pnpm demo:verify`. Expect the final line `PolicyProof demo verification: PASS`. For the complete local release gate, run `pnpm release:verify` after installing Chromium. Both paths need no API key and make no live provider request. Keep terminal output out of the primary evidence path unless a judge asks.

1. Use the deployed production URL or run the production build locally.
2. Open a clean browser window at 1440 × 900 and 100% zoom.
3. Close developer tools, password managers, personal tabs, and notifications.
4. Confirm the header says **PolicyProof** and the presentation starts in **Focused Demo**.
5. Select **Deterministic demo** if another mode is active.
6. Use **Reset workspace** if prior controls, documents, decisions, or run history remain.
7. Keep Judge Mode closed unless you need its four-step recording guide.

## Primary three-minute path

1. **Focused Demo:** identify the fictional Northstar case, seven enabled controls, five records, and evidence-first premise.
2. **Review:** run at EUR 10,000 and verify exactly:
   - 3 PASS;
   - 2 FAIL;
   - 1 MISSING;
   - 1 WARNING.
3. **Exact evidence:** open Currency consistency and show EUR in the purchase order versus USD in the invoice.
4. **Same inputs:** record the fingerprint, choose **Rerun deterministic checks**, and verify 7/7 unchanged plus the same fingerprint.
5. **Causal change:** change the approval threshold to EUR 15,000, rerun, and verify only `CTRL-APPROVAL` changes from FAIL to PASS while the fingerprint changes.
6. **Decision:** record a fictional decision and comment; show the preserved automated result.
7. **Receipt:** generate the receipt, show both hashes and `policyproof.receipt-integrity.v1`, then verify the current receipt locally.
8. **Export:** export JSON, open the local verifier, paste or select the exported content, and confirm it verifies. In a rehearsal copy, change one comment character and confirm **Receipt content has changed**.
9. **Full Workspace:** open it and confirm policy, controls, documents, review, decision, receipt, verification, and secondary export state are preserved.
10. **Architecture:** state that GPT-5.6 reads and locates, TypeScript checks, and a human decides; the deterministic public path makes no provider request.

## Exact Northstar checkpoints

| Checkpoint | Expected result |
| --- | --- |
| Documents | 5 fictional records |
| Controls | 7 enabled controls |
| Default threshold | EUR 10,000 |
| Default outcomes | 3 PASS / 2 FAIL / 1 MISSING / 1 WARNING |
| Currency evidence | EUR purchase order versus USD invoice |
| Adjusted threshold | EUR 15,000 |
| Same-input rerun | 7/7 unchanged; same fingerprint |
| Changed control | `CTRL-APPROVAL`, FAIL → PASS |
| Unchanged controls | 6 |
| Changed-input fingerprint | Different from the EUR 10,000 run |

## Recovery paths

### Review is empty

Return to Documents, load Northstar, confirm seven controls are enabled, and run the review again.

### Counts are filtered

Choose **All results** in the outcome filter or clear the search field.

### The comparison is missing

Complete one run at EUR 10,000, change the threshold to EUR 15,000, and run again. If browser storage is blocked, comparison is intentionally unavailable; continue with the current results.

### The review fingerprint is missing

Reset Northstar in Deterministic demo mode and run the review once. The fingerprint is computed locally after valid results exist; it never requires a provider call.

### The same-input rerun diverges

Stop the public sequence and preserve both the current and candidate fingerprints. Do not claim reproducibility. Use the clean backup recording and retain the divergence for diagnosis.

### A comment validation error appears

Reject and Accept exception require a comment. Enter a short fictional rationale. Confirm does not require one.

### Receipt integrity cannot be verified

Confirm a human decision exists, choose **Generate receipt**, and then **Verify receipt integrity**. A modified hash or receipt must not be repaired; regenerate only from the known active review. Unsupported, malformed, and missing-integrity JSON are explicit non-valid states. Local JSON verification never uploads or replaces the active case.

### Live GPT-5.6 is unavailable

Do not retry during the public demo. Switch to Deterministic demo and continue. Explain that the repository contains one sanitized supervised live validation and that the fallback makes no API request.

### The layout is cramped

Return browser zoom to 100%. At narrow widths, use the horizontal step strip and stacked evidence cards.

## Judge questions to be ready for

- **Where does GPT-5.6 add value?** Policy interpretation and structured evidence extraction.
- **What is deterministic?** Comparisons, date order, document presence, result calculations, summaries, and receipts.
- **What does the fingerprint prove?** It shows whether the normalized review inputs and deterministic conclusions are identical; it is not a signature, identity proof, or trusted timestamp.
- **What does receipt verification prove?** It confirms that the included receipt content matches its stored generation-time digest. It does not prove identity, authorship, legal signature, source authenticity, custody, or trusted time.
- **How is hallucinated evidence prevented?** Source IDs and exact excerpts are validated against submitted fictional documents; invalid evidence fails closed.
- **Who makes the final decision?** The human reviewer; original results are preserved.
- **Is this a compliance certification?** No, it is a focused prototype and review aid.

## After the demo

1. Do not save or upload browser storage artifacts.
2. Confirm the recording contains no credential, personal path, private tab, or provider request reference.
3. Check the final video duration and public playback in a private browser window.
4. Complete the public URL, repository URL, YouTube URL, and primary `/feedback` Session ID fields in the submission checklist.

## Full Workspace backup path

1. From a completed Focused Demo, choose **Open full workspace** and confirm the Northstar review state remains intact.
2. If helpful, enter Judge Mode and use its four manual stages: prove the case, inspect evidence, reproduce the review, and record human judgment.
3. Show the complete Policy, Controls, Documents, Review, and Decision workflow.
4. Open completed-case comparison only if those cases were actually run in the current session; never describe fixture expectations as session output.
5. Show JSON, Markdown, CSV, and print actions without downloading personal or non-fictional content.
6. Return to Focused Demo and confirm the shared state is still intact.

## Exact controlled profiles

- **Northstar:** five documents; 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING at EUR 10,000; Approval becomes PASS at EUR 15,000.
- **Meridian:** five documents; 7 PASS; amount EUR 8,750; no bank change; complete delivery evidence.
- **Atlas:** five documents; 4 PASS, 1 FAIL, 2 MISSING; amount EUR 18,400; missing delivery and independent bank verification.

Northstar has deterministic, mocked, and real GPT-5.6 validation. Meridian and Atlas have deterministic and mocked validation only.

## Competition recovery

- If Judge Mode is on the wrong case, exit it, resolve or discard any pending decision with the normal confirmation, then re-enter.
- If comparison is empty, run a scenario once. Do not describe fixture expectations as session results.
- If a scenario switch confirmation appears, explain that human decisions are protected from accidental loss.
- If a popup feels dense, close it with its summary and continue through the normal Review surface.
- If live mode is unavailable, stay in deterministic mode; no live call is required for the public path.

## Release handoff

- Use only a commit reported in `docs/release/RELEASE_MANIFEST.md` and the final Codex handoff.
- Confirm GitHub Actions before recording the repository segment.
- Use production captures only after the owner completes the deployment runbook.
- Never show an API key, `.env.local`, personal tab, private repository control, or provider payload.
- The `/feedback` Session ID belongs only in the owner-completed Devpost form.
