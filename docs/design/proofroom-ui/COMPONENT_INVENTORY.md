# COMPONENT_INVENTORY.md — PolicyProof · Proofroom

Format per component: Purpose · Anatomy · States · Interaction · Desktop/Mobile · A11y · EN/FR.
Tokens per DESIGN_TOKENS.md; motion per MOTION_SPEC.md. Reference build: "PolicyProof App.dc.html".

## Shell
**AppShell** — owns workspace bg, header, workflow ledger, notices, toast, guided demo. Desktop max 1440 centered. A11y: landmark structure (banner/nav/main).
**ProductHeader** — mark + wordmark + tagline | LanguageSwitcher, ModeSwitcher, HumanReviewIndicator, HelpButton, PrimaryAction. 54px, sheet, hairline bottom. Tagline hides <1280.
**BrandMarkPlaceholder** — 26px ink square, white mono "P", 3px petrol bottom border. Swappable; must not drive layout.
**LanguageSwitcher** — segmented EN|FR. States: active (ink bg/white), idle (grey). role=radiogroup. Switching = label swap, zero state loss.
**ModeSwitcher** — segmented Deterministic demo | Live GPT-5.6. Active petrol-tint/petrol. Live without key → warning notice strip + toast; app remains usable. Disabled variant allowed with title reason.
**HumanReviewIndicator** — 6px ink dot + "Human review required / Revue humaine obligatoire". Not interactive.
**WorkflowLedger** — 5 entries: mono ref + label joined by 32–40px hairlines. States: current (petrol ref, ink 600 label, 2px petrol inset underline, aria-current=step), completed (petrol ✓ after label), pending (faint), unresolved badge (amber count on Decision). Entries are buttons. <760: mono strip 01✓…05.
**ContextSummary** — right-aligned mono strip: NORTHSTAR · POL-2026-004 v1.0 · CTRL n · DOC n · counts · DEC n/7. Desktop only; never a dashboard.
**GuidedDemo** — fixed bottom-right 308px panel, petrol top border, overlay shadow. Anatomy: caption title, dismiss, progress (n/9), 9-step checklist. States: step done (petrol filled ✓, struck grey), next (petrol ring + petrol-tint row bg), pending. Steps auto-check from app state; dismissible; reopen via header "?"; bilingual; state-preserving. A11y: role=complementary, buttons focusable, checklist readable order.

## Policy
**PolicySource (FolioSheet)** — 2px ink top border sheet: FolioMetaGrid (ruled cells: ref/version/source/status), serif title, hint + character count, collapse/expand, RequirementRow list, sunken footer (R→CTRL mapping). Requirement text = source voice (serif), never translated (FR shows EXTRAIT SOURCE (EN) tag).
**RequirementRow** — 52px mono petrol margin ref + serif 15 text, soft hairline separators.
**CompilationPanel** — ink header band "COMPILATION · POL → CTRL"; INTERPRET/CALCULATE/DECIDE rows; primary compile button; mode note. States: idle, compiling (progress + R-0x ✓ ticker), success (pass-spine notice + "Open register →"), safe error (fail-spine notice: text untouched, previous register valid, Retry), live-missing-key (warn notice).

## Controls
**ControlRegister** — sheet + caption head row: REF|CONTROL|SEVERITY|METHOD|EVIDENCE|STATE|ENABLED. Summary line + "Reset to proposed".
**ControlRow** — mono ref, name + ▸ details affordance, severity mono (HIGH fail / MED warn / CRIT #7A1512 600), method mono (TS · DETERMINISTIC / GPT-5.6 · SEMANTIC), "n required", state (Proposed grey / Edited warn "re-approve" / ✓ Approved pass / rejected = struck-through, kept in file), toggle. Disabled (off): row at 45% opacity. Expanded: 2px petrol spine, raised bg, 200ms entrance. One expanded at a time. Row title is a button (Enter toggles).
**ControlParameterEditor** — caption label, − / mono value EUR / + stepper (32×36 targets, 44px mobile), "Set 15,000 for the demo →" quick link, warn-tint effect note stating both outcomes (10,000 → FAIL · 15,000 → PASS · current → X), mono facts line (transaction 12,480 EUR · approvers required 2 · recorded 1). Editing sets control state Edited; validation clamps 1,000–50,000.
**Toggle** — 30×16 rect, 2px radius, petrol on / frame-grey off, knob slides 180ms. aria-label, Space toggles.

## Documents
**DocumentRegister** — sheet + head: REF|DOCUMENT|TYPE|DATE|PARTY|VALIDATION|action. Row subline: mono "n facts · FACT-XX-*".
**DocumentRow** — states: validated (✓ pass), rejected upload (2px fail spine, #FDF9F8 bg, plain-language reason, no ref, Remove only), hover sunken. Remove → confirmation toast; document leaves review but removal is undoable via "Reset demo case".
**FileDropzone** — dashed 1px faint border strip on #FBFBFA: heading "Add evidence to this case file", explanation, mono ACCEPTED: TXT · MD · JSON — MAX 2 MB, Browse button. States: idle, drag-over (petrol dashed border + petrol-tint), validating, error rows for: unsupported type, malformed JSON, duplicate filename, oversized, empty file, hostile-content warning (warn notice: "Content flagged — excerpts from this file are quarantined until reviewed"). Success: new row pp-chain-in + toast.
**EmptyState (case file)** — dashed DOC ghost, title, one-line body, primary restore/load + secondary add.

## Review
**ReviewSummary / ResultFilters** — one segmented control: All n | ✓n | ✕n | ⌀n | !n | Open. Active segment ink bg/white; segments coloured by status; counts live. role=radiogroup, arrow keys move.
**ResultLedger** — sheet; caption head REF|CONTROL|CONCLUSION|SEVERITY|(method)|EV|REVIEW; sunken footer "n unresolved human decisions · Resolve in step 05 →". States: loading (progress panel + mono ticker), not-run (contextual panel + Run review), filtered-empty (quiet row + Show all), rerun (bar above intact ledger).
**ResultRow** — full-row button. States: default; hover sunken 180ms; focus ring; selected (petrol tint + 2px spine + name 600 + REVIEW cell → petrol "Decide →" + bridge); reviewed (decision label replaces Unresolved: ✓ Confirmed pass / ✎ Rejected fail / ✎ Exception warn); changed (pp-flash); disabled control absent from ledger. Keyboard: ↑/↓ rows, Enter opens evidence.
**EvidenceInspector** — sheet, 2px petrol top border. Anatomy top-down = chain: ChainHeader (R-ref — CTRL-ref — status, animated rules; caption EVIDENCE CASE FILE) · title · conclusion body · requirement quote (serif italic, sunken, hairline spine) · mono method line (METHOD: TS · DETERMINISTIC — checks/x.ts · EVALUATED hh:mm:ss · n FACTS CITED) · sections in fixed order CONTRADICTORY/SUPPORTING/MISSING · empty-section quiet rows · footer (mono DEC-ref · state + Record human decision →). States: supporting-only, contradictory, missing, mixed, none, invalid-evidence-ref (fail notice "Evidence reference not found — excerpt withheld"), hallucinated-excerpt-blocked (fail notice "Excerpt failed source validation and was blocked"), document-unavailable (miss notice), copied.
**EvidenceItem** — bordered block: sunken head (mono DOC-ref + type) · doc name · field + relationship line · excerpt (serif 14 on section tint, 2px section spine) · mono fact + origin (+ confidence only for semantic items, e.g. "confiance 88%") · Copy excerpt / Copy reference (labels swap to Copied ✓ 1.6s). Excerpts verbatim, never translated, never located by invented page numbers.
**EvidenceChain** — the animated ref-rule-ref motif (see MOTION_SPEC signature effect).
**CurrencyComparison** — bordered aligned table FIELD | PO-1042 | · | INV-8821; Amount row "12,480 = 12,480" (grey =); Currency row on #FDF5F4: fail label, EUR / bordered ≠ badge / USD in mono 600 — the only red cells on screen.

## Decision
**ReviewerDecision (DecisionPaper)** — sheet, 2px ink top border. ChainHeader + DEC-ref + prev/next links · title · "Automated conclusion: [status] — … conclusion is preserved" · evidence recap strip (≠ strip for CTRL-04; conclusion sentence otherwise; "← Reopen evidence") · actions column + comment column. Actions: Confirm = solid petrol full-width ("Confirm FAIL conclusion"), caption "standard path"; hairline; caption OVERRIDE PATHS — JUSTIFICATION REQUIRED; Reject (fail outline on fail-surface) + Accept exception (grey outline), both with right "✎ comment required". Never three equal buttons.
**ReviewerComment** — label + mono REQUIRED FOR OVERRIDES flag; textarea (1px frame; 2px fail on error); helper; inline error "✕ A reviewer comment is required…" with focus moved to field. Comments verbatim on receipt, never translated.
**DecisionQueue** — sheet list DEC-01…07: mono ref, name, state (✓/✎/hollow amber Open); current = petrol spine + tint; footer "n open · Next unresolved →". Mobile: prev/next bar.
Decision states: pending, confirmed, rejected, exception, missing-comment (validation), saved (toast + status strip 2px semantic spine "Current decision: X · recorded hh:mm · Change decision"), changed, reset warning (confirm dialog before rerun that discards decisions? — decisions persist across reruns; a rerun that changes a conclusion marks its decision "review again" warn state).

## Receipt
**DecisionReceipt** — 920px sheet, 3px ink top border: header (mark + title + subline | mono receipt id petrol + GENERATED ts) over 1px ink rule · 4-cell meta grid · sunken summary strip (coloured counts + decisions line) · outcomes table REF|CONTROL|CONCLUSION|DECISION|COMMENT (override rows on --pp-warn-row, comments in quotes) · exceptions / unresolved two-cell grid · disclaimer strip over 1px ink rule + mono DETERMINISTIC REPLAY · FIXTURE v1.0. Credible standalone (screenshot/video/print).
**ReceiptActions** — Print (ink outline) · Download JSON · Copy receipt ID · Copy summary (grey outline) + mono filename. JSON mirrors sheet field-for-field.

## Feedback
**SafeErrorState** — notice block, 2px fail spine on --pp-fail-surface: bold cause, one-line consequence ("Your policy text was not changed"), Retry + secondary action. Provider errors map: unavailable(503)/auth/permission/quota/rate-limit/timeout/connection/schema/refusal/malformed → same anatomy, safe copy, always offering "Switch to deterministic demo".
**EmptyState / LoadingState** — contextual, never generic skeletons; loading = 2px indeterminate bar + mono ticker naming what is being processed.
**Toast (InlineFeedback)** — ink bg, white 12.5px, 2px petrol bottom border, bottom-center, role=status, 2.4s.
