# PolicyProof Screenshot Plan

## Capture standard

- Preferred desktop viewport: 1440 × 1000 at 100% browser zoom
- Preferred mobile viewport: 390 × 844
- Use a production build or deployed URL for final public images
- Show fictional data only; hide personal tabs, notifications, terminals, paths, and environment settings
- Remove the Next.js development indicator and any browser extension overlays

## Public candidates

| Image | Required state | Intended use |
| --- | --- | --- |
| Focused Demo overview | Northstar ready, deterministic mode, seven controls and five records summarized, no outcome counts yet | Devpost introduction |
| Focused evidence proof | EUR 10,000; 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING; Currency consistency selected with exact EUR/USD sources | README hero and Devpost |
| Same-input fingerprint | 7/7 reproduced with matching versioned fingerprints | Reproducibility story |
| Changed-input comparison | EUR 10,000 → EUR 15,000; only Approval changes; fingerprints differ | Causal-change story |
| Evidence inspector | Selected-row bridge, exact EUR and USD excerpts, and currency comparison visible | Main differentiation |
| Decision receipt | Rejected currency result with fictional comment | Human oversight and export story |
| French workspace | French Review or Decision step with preserved evidence | Bilingual capability |
| Mobile workspace | English or French Review with selected inline evidence and no overflow | Responsive proof |

## Local-only diagnostic captures

Keep API-unavailable and safely mocked provider-error screenshots in ignored `test-results/`. They support internal review but should not be public hero images. Never publish traces, request payloads, development indicators, or screenshots containing a correlation identifier from a real provider request.

## Final review

Confirm exact excerpts are unchanged, counts match the tested fixture, status meaning is visible without color alone, French copy fits, focus rings are absent unless intentionally demonstrating keyboard use, and no unverified Live success claim appears.

The local comparison source is `docs/design/proofroom-ui/codex-refs/`. Three ignored implementation passes use the same nine filenames under `test-results/proofroom-integration/pass-1/`, `pass-2/`, and `pass-3/`. Recreate public images from the production build; do not publish local diagnostic captures.

## Competition-hardening passes

All development captures below remain ignored under `test-results/competition-hardening/`:

1. **Case Library:** `case-library-desktop-en.png` and `case-library-mobile-fr.png` verify the compact register, bilingual copy, provenance, assumptions, and mobile reflow.
2. **Scenario diversity:** `northstar-review-1280x720.png`, `meridian-review.png`, and `atlas-review.png` verify distinct runtime profiles, evidence, decisions, and receipts.
3. **Judge workflow:** `judge-mode-desktop-1280x720.png` and `judge-mode-mobile-fr.png` verify manual guidance, visible exit, above-the-fold composition, French copy, keyboard targets, and no business-result change.
4. **Trust and comparison:** `scenario-comparison.png`, `architecture-explanation.png`, `audit-trail.png`, and `northstar-receipt.png` verify current-session labeling, responsibility boundaries, safe metadata, exports, and human oversight.

Direct PNG inspection confirmed that two transient black bands shown by the local image preview were preview artifacts over opaque white pixels, not application output. Production candidates must still be recaptured from the deployed build and inspected independently.

Add these public candidates only after deployment: Case Library, Northstar, Meridian, Atlas, completed-case comparison, Judge Mode, architecture, Decision, Receipt, and mobile. Do not publish `test-results` paths or development screenshots.

## Focused-verifiability passes

All development captures remain ignored under `test-results/focused-verifiability/`:

1. **Pass 1 — hierarchy:** Focused landing, reviewed 1280 × 720, Full Workspace preservation, and compact Judge Mode.
2. **Pass 2 — reproducibility:** EUR/USD evidence, initial fingerprint, same-input 7/7 match, EUR 10,000 baseline, and EUR 15,000 causal difference.
3. **Pass 3 — resilience:** 1440, 1280, 1024, 768, and 390 px; English and French; effective 200% zoom; and keyboard focus.

Use Focused Demo as the public hero. Full Workspace, Case Library, Meridian, Atlas, exports, and architecture are supporting images, not the opening proof. Recreate every public candidate from the deployed production build and inspect it independently.
