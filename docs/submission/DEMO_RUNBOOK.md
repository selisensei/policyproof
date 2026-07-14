# PolicyProof Demo Runbook

## Purpose

This runbook gives the builder a repeatable, low-risk path for the public demo and judge review. Use the deterministic Northstar workflow as the primary demonstration. It is complete, tested, and makes no OpenAI request.

## Before the demo

1. Use the deployed production URL or run the production build locally.
2. Open a clean browser window at 1440 × 900 and 100% zoom.
3. Close developer tools, password managers, personal tabs, and notifications.
4. Confirm the header says **PolicyProof** and the workflow starts at **Policy**.
5. Select **Deterministic demo** if another mode is active.
6. Use **Reset workspace** if prior controls, documents, decisions, or run history remain.
7. Keep the guide collapsed unless a judge asks for it.

## Primary three-minute path

1. **Policy:** identify the fictional procurement policy and evidence-first premise.
2. **Controls:** show seven enabled controls and explain human approval in Live mode.
3. **Documents:** choose **Load Northstar demo** and confirm five fictional records.
4. **Review:** run at EUR 10,000 and verify exactly:
   - 3 PASS;
   - 2 FAIL;
   - 1 MISSING;
   - 1 WARNING.
5. **Outcome Composition:** select FAIL and confirm the result register filters.
6. **Evidence Coverage:** select the currency control and inspect the evidence case file.
7. **Exact evidence:** show EUR in the purchase order and USD in the invoice.
8. **Chronology:** show the dated events in 3–5 July 2026 order.
9. **Decision:** reject the currency result with a fictional comment.
10. **Receipt:** show the preserved original result and human decision; mention print, JSON, and Markdown.
11. **Threshold rerun:** change the approval threshold to EUR 15,000 and rerun.
12. **Run Comparison:** verify only `CTRL-01` changes from FAIL to PASS.
13. **Language:** switch to French and verify the review state remains.

## Exact Northstar checkpoints

| Checkpoint | Expected result |
| --- | --- |
| Documents | 5 fictional records |
| Controls | 7 enabled controls |
| Default threshold | EUR 10,000 |
| Default outcomes | 3 PASS / 2 FAIL / 1 MISSING / 1 WARNING |
| Currency evidence | EUR purchase order versus USD invoice |
| Adjusted threshold | EUR 15,000 |
| Changed control | `CTRL-01`, FAIL → PASS |
| Unchanged controls | 6 |

## Recovery paths

### Review is empty

Return to Documents, load Northstar, confirm seven controls are enabled, and run the review again.

### Counts are filtered

Choose **All results** in the outcome filter or clear the search field.

### The comparison is missing

Complete one run at EUR 10,000, change the threshold to EUR 15,000, and run again. If browser storage is blocked, comparison is intentionally unavailable; continue with the current results.

### A comment validation error appears

Reject and Accept exception require a comment. Enter a short fictional rationale. Confirm does not require one.

### Live GPT-5.6 is unavailable

Do not retry during the public demo. Switch to Deterministic demo and continue. Explain that the repository contains one sanitized supervised live validation and that the fallback makes no API request.

### The layout is cramped

Return browser zoom to 100%. At narrow widths, use the horizontal step strip and stacked evidence cards.

## Judge questions to be ready for

- **Where does GPT-5.6 add value?** Policy interpretation and structured evidence extraction.
- **What is deterministic?** Comparisons, date order, document presence, result calculations, summaries, and receipts.
- **How is hallucinated evidence prevented?** Source IDs and exact excerpts are validated against submitted fictional documents; invalid evidence fails closed.
- **Who makes the final decision?** The human reviewer; original results are preserved.
- **Is this a compliance certification?** No, it is a focused prototype and review aid.

## After the demo

1. Do not save or upload browser storage artifacts.
2. Confirm the recording contains no credential, personal path, private tab, or provider request reference.
3. Check the final video duration and public playback in a private browser window.
4. Complete the public URL, repository URL, YouTube URL, and primary `/feedback` Session ID fields in the submission checklist.
