# PolicyProof User Guide

## Start the application

1. Open PowerShell in the PolicyProof repository.
2. Run `pnpm dev`.
3. Open `http://localhost:3000`.
4. Keep **Deterministic demo** selected for the guaranteed path.

## Run the Northstar review

1. Select **Load demo case**.
2. Expand the policy and read the seven fictional requirements.
3. Open **Controls** and confirm all seven controls are enabled.
4. Keep the approval threshold at `10000`.
5. Open **Case documents** and confirm five records are present.
6. Select **Run review**.

Expected results are 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING.

## Read the review intelligence workspace

- Use **Case overview** for current scope, method, threshold, and work remaining.
- Select a segment in **Outcome composition** to filter results.
- Select an actionable cell in **Evidence coverage map** to open that control.
- Select an event in **Chronology** to inspect the timing control.
- Read **Threshold sensitivity** to understand the amount and approver rule.
- Use local search for a control ID, document, status, decision state, or evidence excerpt.

## Inspect the currency contradiction

Search for `USD` or select **Currency consistency**. Confirm the exact excerpts:

- `Purchase order amount: 12,480 EUR.`
- `Invoice amount: 12,480 USD.`

The evidence integrity indicator should say that two exact excerpts were verified.

## Record a human decision

1. Open **Decision**.
2. Use **Previous** or **Next unresolved** to move through the queue.
3. Select **Confirm** to preserve and accept the automated conclusion.
4. To **Reject** or **Accept exception**, enter a reviewer comment first.
5. Inspect the generated receipt below the decision paper.

## Compare threshold runs

1. Return to **Controls**.
2. Change the threshold from `10000` to `15000`.
3. Select **Run review**.
4. Confirm **Approval threshold** changes from FAIL to PASS.
5. Open **Run comparison** to see the previous and current counts and the single changed control.
6. Select **Clear history** to remove the local comparison.

## Export the receipt

- **Print receipt** uses the browser print dialog.
- **Download JSON** exports the complete structured receipt.
- **Download Markdown** exports a readable text record.
- **Copy receipt ID** and **Copy summary** use the clipboard when available.

## Use French or mobile

Select **FR** at any time. The interface changes language without resetting the case. Exact English source excerpts stay unchanged. To inspect mobile behavior in a desktop browser, open developer tools, enable device emulation, choose approximately 390 × 844, and reload.

## Important safety notes

Use fictional data only. Do not paste an API key into the browser, chat, source files, or screenshots. Do not select Live GPT-5.6 during a deterministic demo recording. PolicyProof is a review aid, not a payment approval or compliance certification.
