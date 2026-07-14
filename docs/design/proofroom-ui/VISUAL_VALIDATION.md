# Proofroom Visual Validation

Temporary comparison captures are generated under the ignored path `test-results/proofroom-integration/`. Each pass contains the same nine-screen matrix so layout changes can be compared directly with `codex-refs/`.

## Pass 1 — Structural translation

Captured Policy, Controls, Documents, Review, Decision, receipt, French Review, English mobile Review, and French mobile Review.

Observed differences:

- The optional first-run folio remained above the Policy source after the case was loaded.
- A second case-summary strip duplicated the persistent workflow-ledger context.
- The walkthrough overlay covered important comparison areas in screenshots.
- The Decision screen rendered a receipt before any human decision existed.
- The mobile header wrapped onto two rows and consumed too much vertical space.
- Mobile Review embedded the complete desktop inspector, making exact evidence harder to scan.

Corrections:

- Hide the first-run folio once Northstar is loaded.
- Keep case context in the workflow ledger only.
- Dismiss the optional guide in the visual harness and prevent its non-interactive surface from intercepting clicks.
- Reveal the receipt after the first recorded human decision.
- Compact the mobile header and evidence presentation.

## Pass 2 — Density and responsive alignment

Captured and inspected the same nine-screen matrix after the structural corrections.

Observed differences:

- Desktop Policy, Review, and Decision now follow the approved folio/ledger/paper composition without redundant context.
- The selected-result bridge and EUR/USD comparison remain visible and data-derived.
- Long mode labels could still compress the PolicyProof identity at approximately 390 px.
- Mobile evidence records retained desktop-only titles, confidence, and copy controls, pushing the second contradictory excerpt below the initial viewport.

Corrections:

- Present compact `DEMO` and `GPT` mode labels visually on narrow screens while retaining the full accessible names.
- Remove secondary evidence metadata from the narrow visual layer while preserving exact excerpts, source identifiers, fact identifiers, currency comparison, and the complete accessible DOM.

## Pass 3 — Final polish

Captured and inspected the same nine-screen matrix plus five final states: empty Review, approval threshold after PASS transition, print-only receipt, mocked policy compilation loading, and safely mocked provider authentication failure.

Verified:

- Desktop Policy, Controls, Documents, Review, Decision, and receipt preserve the approved restrained folio/register/paper hierarchy.
- English and French Review keep the selected result connected to exact evidence and the data-derived EUR/USD comparison.
- English and French mobile headers retain product identity, language, and compact mode controls without page-level overflow.
- Mobile Review uses stacked result entries and concise inline evidence; it is not a scaled desktop table.
- The threshold banner emphasizes only CTRL-01, explains FAIL → PASS, and states that other results remain unchanged.
- Loading keeps the source folio visible, the safe provider error exposes only the mocked category/reference, and empty Review provides a quiet next-step message.
- The print capture contains only the formal receipt and no application navigation or interactive toolbar.
- Focus styles, copy feedback, keyboard result selection, and reduced-motion behavior are covered by automated checks; `prefers-reduced-motion` reduces animation and transition durations to effectively zero.

The final implementation intentionally differs from static prototype examples where validated behavior is authoritative: stable application IDs remain unchanged, only TXT/MD/JSON uploads are offered, reviewer decisions reset on rerun, exact source evidence remains English in the French interface, and no PDF-generation or remote-font dependency is introduced.
