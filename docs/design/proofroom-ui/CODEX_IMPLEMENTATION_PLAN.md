# CODEX_IMPLEMENTATION_PLAN.md — PolicyProof · Proofroom

Goal: implement the approved interface in the existing Next.js / React / TypeScript / CSS app
WITHOUT new artistic decisions. Visual truth: DESIGN_HANDOFF.md + DESIGN_TOKENS.md + MOTION_SPEC.md +
RESPONSIVE_SPEC.md + COMPONENT_INVENTORY.md. Working reference: "PolicyProof App.dc.html" (interactive)
and "Proofroom.dc.html" (boards incl. tablet/mobile frames and full state library).

## Order of work (each step ships compilable)
1. **Tokens & fonts** — global.css :root block from DESIGN_TOKENS; next/font/google (Archivo, Source_Serif_4, Spline_Sans_Mono, display swap). Purge all legacy palette values.
2. **Shell** — (review) layout: ProductHeader, WorkflowLedger, ContextSummary, notice slot, Toast portal. Wire LanguageSwitcher/ModeSwitcher to the store. Acceptance: pixel-matches app header/nav at 1440/1024/390.
3. **Store** — single client store (Zustand): { language, mode, step, caseLoaded, policy{...}, controls{id→{enabled,state,params}}, documents[], run{threshold,results,runId}, selection, filter, decisions{id→{kind,comment,ts}}, guide{open,progress} }. Language sits beside data; switching must not remount providers. Persist to localStorage.
4. **Policy screen** — FolioSheet + CompilationPanel with idle/loading/success/error/missing-key states. Demo mode compiles from fixture; live mode calls the API route.
5. **Controls screen** — ControlRegister, ControlRow (expand one-at-a-time), ControlParameterEditor with clamped threshold + effect note computed from fixture amount (12,480 EUR).
6. **Documents screen** — DocumentRegister + FileDropzone (TXT/MD/JSON, 2MB) with the full validation-error matrix; rejected rows persist until removed.
7. **Review screen** — ResultLedger + filters + EvidenceInspector + CurrencyComparison. Implement selection bridge (absolute 26px rule + node, desktop split only), inspector remount key = `${controlId}-${runId}-${language}`, chain entrance stagger. THEN the threshold-change effect exactly per MOTION_SPEC (pp-flash only on changed row; pass banner text).
8. **Decision screen** — DecisionQueue + DecisionPaper + ReviewerComment with client+server comment validation for overrides; decisions recorded alongside preserved automated conclusions.
9. **Receipt** — DecisionReceipt + ReceiptActions; @media print hides shell, print-color-adjust exact; JSON export mirrors the sheet.
10. **GuidedDemo** — 9-step auto-checking checklist panel; dismissible; bilingual; state-preserving.
11. **Live GPT-5.6 pipeline states** — API route wrapping GPT-5.6: map every failure (missing key, 401, 403, 429, quota, timeout, connection, 5xx, schema, refusal, malformed) to SafeErrorState copy; excerpt validation gate (exact substring match against source, else "blocked" state); safe fallback CTA to deterministic mode everywhere.
12. **Responsive pass** — RESPONSIVE_SPEC transformations; verify 1440/1280/1024/768/390; no horizontal scroll.
13. **A11y pass** — grids with keyboard nav, radiogroups, aria-current, aria-describedby on validation, focus-visible ring, reduced-motion, 44px targets. Do not claim full WCAG.
14. **QA against the final quality test** (DESIGN_HANDOFF §quality) + forbidden-pattern sweep.

## Invariants (behavior that must be preserved)
- Automated conclusions remain preserved; human decisions are recorded alongside; overrides require a non-empty comment (client AND server).
- Deterministic demo performs zero AI requests; live mode degrades safely; compilation failure leaves state untouched.
- References stable for the life of a review file; excerpts verbatim, untranslated, no invented locations.
- Language switch preserves: step, threshold, documents, selection, filters, results, decisions, guide progress.
- Threshold edit ⇒ control state Edited ⇒ visible before rerun. Rerun preserves decisions; a decision whose
  conclusion changed is flagged for re-review, not deleted.

## Do not introduce (enforced at review)
Gradients, glow, purple, glassmorphism, blur, chat bubbles, sparkles, pills, radius >4px (2px is the system),
workspace shadows, skeleton shimmer, decorative illustration, fake charts/metrics, hero sections, emoji in UI,
dark command-centre chrome, new colours/fonts/spacing outside DESIGN_TOKENS, visual AI emphasis beyond the
mono "GPT-5.6 · SEMANTIC" provenance labels.
