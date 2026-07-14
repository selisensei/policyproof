# PolicyProof — Proofroom (The Evidence Ledger) · Design handoff package

Design reference package for implementing the approved PolicyProof interface.
**This package is a design reference only.** The existing PolicyProof application remains the source
of truth for business logic, GPT-5.6 integration, deterministic controls, security, localization state,
evidence validation and tests. Do NOT replace working application code with prototype code from this
package — re-skin and re-structure the UI to match these specifications.

All paths in this package are relative. It contains no secrets, no environment variables, no backend,
and no product data beyond the fictional Northstar demonstration case. Exact evidence excerpts
(e.g. "Purchase order amount: 12,480 EUR.") are verbatim and must remain unchanged and untranslated.

## Contents

### Specifications (normative — implement exactly)
| File | What Codex should use it for |
|---|---|
| `DESIGN_HANDOFF.md` | Master specification: identity, shell, screen-by-screen layout rules, print rules, bilingual constraints, preserved behaviour, forbidden patterns, final quality test. Read FIRST. |
| `DESIGN_TOKENS.md` | Exact CSS-ready values: colours, typography, spacing, radii, borders, shadows, breakpoints, focus ring, z-index, motion durations. Copy into `:root`; introduce no values outside it. |
| `COMPONENT_INVENTORY.md` | Every component: purpose, anatomy, states, interactions, desktop/mobile behaviour, accessibility, EN/FR constraints. |
| `MOTION_SPEC.md` | All animation: durations, easings, keyframes, the signature evidence-chain effect, the threshold-change effect, reduced-motion behaviour, forbidden effects. |
| `RESPONSIVE_SPEC.md` | Exact transformations at 1440 / 1280 / 1024 / 768 / 390. |
| `CODEX_IMPLEMENTATION_PLAN.md` | Recommended 14-step implementation order with acceptance criteria and invariants. |

### Interactive references (open directly in a browser — no dev server needed)
| File | What Codex should use it for |
|---|---|
| `PolicyProof-App.html` | Working interactive reference of the full product: all five screens, EN/FR live switching, guided demo, selection bridge + evidence-chain animation, threshold FAIL→PASS effect, decision validation, receipt with JSON/print/copy actions. Use it to verify look, behaviour and timing — not as source code to copy. |
| `Proofroom-Boards.html` | Static design boards 2A–2K: art direction, tokens, all five desktop screens, French versions, tablet + mobile frames, the complete state library (loading / empty / errors / validation / receipt states), component notes. Pan/zoom canvas. |

### Visual references (`codex-refs/`)
| File | Shows |
|---|---|
| `01-policy-desktop-en.png` | Policy — source folio + compilation rail (1440, EN) |
| `02-controls-desktop-en.png` | Controls — register with CTRL-01 expanded + parameter editor |
| `03-documents-desktop-en.png` | Documents — case-file register + malformed upload + dropzone |
| `04-review-desktop-en.png` | Review — split ledger + evidence inspector, EUR ≠ USD (centrepiece) |
| `05-decision-desktop-en.png` | Decision — queue + decision paper, override hierarchy |
| `06-receipt-desktop-en.png` | Decision receipt — formal record + actions |
| `07-review-desktop-fr.png` | Review in French + French receipt sheet |
| `08-review-mobile-en.png` | Mobile 390 Review — stacked ledger, evidence expands in place |
| `09-review-mobile-fr.png` | Mobile 390 Review, French labels (excerpts remain EN) |
| `10-provider-error.png` | Live-mode provider error + missing-API-key states |
| `11-threshold-before-fail.png` | Review run at EUR 10,000 — CTRL-01 ✕ FAIL |
| `12-threshold-after-pass.png` | Same review rerun at EUR 15,000 — CTRL-01 ✓ PASS, only that row changes |

## How to work
1. Read `DESIGN_HANDOFF.md`, then `DESIGN_TOKENS.md`.
2. Follow `CODEX_IMPLEMENTATION_PLAN.md` step order; check each screen against the PNGs and the
   interactive references.
3. Consult `MOTION_SPEC.md` before writing any animation and `RESPONSIVE_SPEC.md` before any media query.
4. Never introduce anything on the forbidden-pattern list (handoff §8); make no new artistic decisions.
