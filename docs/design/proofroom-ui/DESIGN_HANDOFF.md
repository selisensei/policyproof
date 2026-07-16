# PolicyProof — Proofroom (The Evidence Ledger)
## Design handoff for implementation in Next.js / React / TypeScript / CSS

This document is normative. Implement exactly; do not introduce new artistic decisions.

Reference artifacts:
- `PolicyProof App.dc.html` — WORKING interactive reference (all five screens, EN/FR live switch,
  guided demo, signature evidence-chain effect, threshold FAIL→PASS effect, validation, receipt).
- `Proofroom.dc.html` — static boards 2A–2K (2E = canonical Review; 2I = tablet/mobile; 2J = state library).

Companion specifications (normative, same authority as this file):
`DESIGN_TOKENS.md` · `MOTION_SPEC.md` · `RESPONSIVE_SPEC.md` · `COMPONENT_INVENTORY.md` · `CODEX_IMPLEMENTATION_PLAN.md`.

Motion: every duration, keyframe, the signature evidence-chain effect and the threshold-change effect are
specified in MOTION_SPEC.md; `prefers-reduced-motion` collapses all of it.

Final quality test (all must be YES before shipping): unique to PolicyProof · evidence matrix is the
centrepiece · understandable by a judge in 15s · EUR/USD failure visible in <2s · threshold change
demonstrable live · credible for audit/finance · usable on a 13" laptop · natural French · intentional
mobile · restrained meaningful motion · no generic AI visual language · implementable without new
artistic decisions.

---

## 1. Identity summary

The visual identity is the product's own logic: **requirement → control → evidence → conclusion → human decision**.
Every entity carries a stable reference (`R-0x`, `CTRL-0x`, `DOC-0x`, `FACT-*`, `DEC-0x`) rendered as a mono
"margin marker". Thin rules connect chain members. Surfaces are ledgers and folios, not cards.

Five principles (P-01…P-05, board 2A):
1. The chain is the interface — refs + thin connecting rules everywhere.
2. Ledger rows, not cards. Cards only for genuinely card-like content (paired evidence blocks).
3. Three voices of type: sans = application, serif = source material only, mono = verifiable data only.
4. One brand accent (petrol) for chain/selection/primary actions; semantic colours only on status marks and evidence anchors, always glyph + word.
5. Flat, precise, quiet: rectangular surfaces, 2px radii, no workspace shadows, hierarchy via surface shifts and rules.

---

## 2. Design tokens (CSS custom properties)

```css
:root {
  /* surfaces */
  --pp-workspace: #F0F1EE;   /* app background        */
  --pp-sheet:     #FFFFFF;   /* primary surface       */
  --pp-sunken:    #F7F8F6;   /* table heads, footers  */
  --pp-raised:    #FDFDFC;   /* expanded row body     */

  /* ink & structure */
  --pp-ink:       #16181A;   /* primary text, strong rules   */
  --pp-graphite:  #3B4045;   /* body text                    */
  --pp-grey:      #71787E;   /* secondary text, captions     */
  --pp-faint:     #9BA1A6;   /* tertiary, placeholders       */
  --pp-hairline:  #DFE2DD;   /* default 1px border           */
  --pp-hairline-soft: #EDEFEA; /* row separators inside sheets */
  --pp-frame:     #C5C8C2;   /* outer sheet border           */

  /* brand */
  --pp-petrol:      #0B5156; /* refs, selection, primary actions, links */
  --pp-petrol-tint: #E8EFEE; /* selected-row background                 */

  /* semantic (each: colour + tint + border) */
  --pp-pass:  #1B7A43;  --pp-pass-tint:  #EAF3ED;  --pp-pass-border:  #C4DECD;
  --pp-fail:  #B42318;  --pp-fail-tint:  #F9ECEA;  --pp-fail-border:  #E5C4BE;
  --pp-miss:  #5D6572;  --pp-miss-tint:  #EEF0F2;  --pp-miss-border:  #B9BFC7; /* dashed */
  --pp-warn:  #96690D;  --pp-warn-tint:  #F7F0DF;  --pp-warn-border:  #E4D3A8;
  --pp-crit:  #7A1512;  /* CRITICAL severity text only */
  --pp-fail-surface: #FDF5F4; /* error notice backgrounds */
  --pp-warn-row: #FDFBF7;     /* receipt highlighted row  */

  /* type */
  --pp-font-ui:     'Archivo', system-ui, sans-serif;
  --pp-font-source: 'Source Serif 4', Georgia, serif;
  --pp-font-data:   'Spline Sans Mono', ui-monospace, monospace;

  /* shape */
  --pp-radius: 2px;         /* chips, buttons, inputs; sheets/rows = 0 */
  --pp-shadow-overlay: 0 8px 24px rgba(22,24,26,.10); /* overlays ONLY */
}
```

Type scale (px / weight — do not add sizes):
- display 26/600 (screen titles), title 20/600, section 18/600
- body 13.5/400, ui 13/400–500, label 12/500, caption 11/500 letter-spacing .1em UPPERCASE
- source (serif) 15/400 policy text, 14/400 excerpts, italic for requirement quotes
- data (mono) 12.5/500 amounts, 11–11.5/600 refs, 10–10.5 provenance labels

Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48. Page gutter 32px desktop, 20px tablet, 16px mobile.
Borders: 1px hairline default; 2px ink or petrol for emphasis (folio top border 2–3px ink; selected spine 2px petrol).
Radius: 0 on sheets and rows, 2px on chips/buttons/inputs. Shadows: none except `--pp-shadow-overlay` on modals/sheets.

Fonts (Google Fonts): Archivo 400/500/600/700 · Source Serif 4 400/600 + italic · Spline Sans Mono 400/500/600.

---

## 3. Application shell

### 3.1 Global header (54px, sheet, bottom hairline)
Left: mark (26px ink square, white mono "P", 3px petrol bottom border — temporary placeholder, replaceable)
+ "PolicyProof" 14.5/700 + 1px vertical hairline + tagline 12/grey
("Every conclusion traced to evidence" / FR "Chaque conclusion tracée jusqu'à la preuve").
Right, in order: EN|FR segmented control · mode segmented control (Deterministic demo | Live GPT-5.6)
· human-review indicator (6px ink dot + "Human review required" / "Revue humaine obligatoire")
· contextual primary button (petrol solid): Policy→"Compile policy", Controls/Documents→"Run review",
Review→"Go to decisions", Decision→"Open receipt", Receipt→"Print receipt".

### 3.2 Workflow ledger (50px, sheet, bottom border --pp-frame)
Five entries: mono ref `01…05` + label, joined by 40px hairlines.
- completed: ref grey, label graphite, petrol ✓ after label
- current: ref petrol 600, label ink 600, 2px petrol inset underline full item height
- pending: ref faint, label grey
- unresolved marker: decision step may show amber count when review done but decisions open.
Right-aligned context strip (mono 11 grey): `NORTHSTAR · POL-2026-004 v1.0 · CTRL 7 · DOC 5 · DEC 0/7`,
after a run add coloured counts `3✓ 2✕ 1⌀ 1!`. This strip is the persistent context; there is no dashboard.

### 3.3 Work surface
Workspace background, padding 26–28px top, 32px sides, ≥40px bottom. Content sheets are white with
1px hairline border; "authoritative" sheets (policy folio, decision paper, receipt) add a 2–3px ink top border;
the evidence inspector adds a 2px petrol top border.

---

## 4. Screens (EN reference copy in boards; FR in board 2H)

### 4.1 Policy (board 2B)
Two columns: source folio (1fr) + compilation rail (360px).
Folio: ruled 5-cell meta head (POLICY REF / VERSION / SOURCE / STATUS / LANGUAGE; labels caption, values mono
or sans per board) · serif title 23/600 · "Seven requirements · editable…" hint · requirement rows
(grid 56px + 1fr): mono petrol `R-0x` marker + serif 15 text, soft hairline separators · footer strip (sunken):
"Each requirement compiles into exactly one control — R-01 → CTRL-01…".
Rail: "COMPILATION" panel (ink header band) with INTERPRET / CALCULATE / DECIDE rows (mono petrol labels),
petrol "Compile policy" button, demo-mode note; below, success notice (2px pass spine): "✓ 7 controls proposed".
States: compiling / safe error per board 2J (progress hairline, error keeps policy text untouched).

### 4.2 Controls (board 2C)
Header row: "Control register" + summary "7 of 7 enabled · 6 approved · 1 edited" + "Reset to proposed" (outline).
Register (sheet): column head (sunken, caption): REF | CONTROL | SEVERITY | METHOD | EVIDENCE | STATE | ENABLED.
Row: mono petrol ref · name 13.5/500 + `▸ details` affordance · severity mono (HIGH fail-colour, MEDIUM warn,
CRITICAL --pp-crit 600) · method mono `TS · DETERMINISTIC` / `GPT-5.6 · SEMANTIC` · `n required` ·
state (Proposed grey / Edited warn / ✓ Approved pass) · toggle 30×16 rect, petrol when on.
Expanded row (one at a time): 2px petrol left spine, raised bg; left = condition text + serif italic quote of the
source requirement + Approve/Revert buttons; right = ParameterEditor: caption label, − / value / + stepper
(mono 15/600 value, EUR unit), effect note on warn tint explaining the outcome flip
(10,000 → FAIL vs 15,000 → PASS for the 12,480 EUR case). Threshold is a parameter inside the control, not a form field.

### 4.3 Documents (board 2D)
"Case file — Northstar Facilities vendor change" + "5 fixture documents, 13 extracted facts…".
Register columns: REF | DOCUMENT (+ mono fact-count subline `4 facts · FACT-PO-*`) | TYPE | DATE (mono ISO) |
PARTY | ORIGIN (mono FIXTURE/UPLOAD) | VALIDATION (✓ Validated pass / ✕ Rejected fail) | Remove.
Malformed upload: row with 2px fail spine, `#FDF9F8` bg, reason line in fail colour, no ref assigned.
Upload zone: full-width strip, 1px dashed faint border, sheet-adjacent bg #FBFBFA — heading "Add evidence to this
case file", explanation, mono accepted formats `PDF · DOCX · XLSX · CSV · XML · JSON — MAX 20 MB`, "Browse files"
outline-ink button. No decorative file icons anywhere. Empty state per board 2J.

### 4.4 Review (board 2E — canonical screen)
Title row: "Evidence review" + run metadata line · filter segmented control right-aligned:
`All 7 | ✓ 3 | ✕ 2 | ⌀ 1 | ! 1` (active segment ink bg/white text; segments coloured by status).
Split grid: `1.02fr 24px-gap 0.98fr`, aligned to top.

Results ledger (left sheet): columns REF | CONTROL (+ mono `R-0x` subline) | CONCLUSION | SEVERITY | METHOD (TS/GPT)
| EV | REVIEW. Rows 11px vertical padding, soft hairline separators.
Row states: default sheet; hover sunken; **selected**: petrol-tint bg + 2px petrol left spine + name 600 +
REVIEW cell becomes petrol "Decide →" + **gutter bridge**: 2px petrol horizontal rule from row's right edge across
the 24px gutter ending in an 8px petrol dot at the inspector border (absolute-positioned; hidden when panes stack).
Footer strip (sunken): "7 unresolved human decisions · Resolve in step 05 →".

Evidence inspector (right sheet, 2px petrol top border), top-to-bottom = the chain:
1. ChainHeader: mono refs `R-04 —— CTRL-04 —— ✕ FAIL` joined by 16px hairlines; right caption "EVIDENCE CASE FILE".
2. Title 18/600 + conclusion sentence (body).
3. Requirement quote: sunken strip, 2px hairline left spine, serif italic 13.
4. Provenance line (mono 10.5 grey): `METHOD: TS · DETERMINISTIC — checks/currency.ts · EVALUATED 13:22:04 · 2 FACTS CITED`.
5. Sections in fixed order, each with caption heading: CONTRADICTORY (fail colour) / SUPPORTING (pass) / MISSING (miss).
   Evidence entry block: header strip (sunken) `DOC-0x` + doc type · doc name 12.5/600 · field line
   ("Field: Amount · establishes PO currency") · excerpt: serif 14 on the section's semantic tint with 2px semantic
   left spine · mono fact line `FACT-PO-CURRENCY · DETERMINISTIC EXTRACTION` · "Copy excerpt / Copy reference" links.
   NEVER invent page numbers or document locations.
6. Contradiction pairing (the EUR/USD moment): two evidence blocks side-by-side, then ComparisonTable:
   FIELD | PO-1042 | ⋅ | INV-8821; Amount row `12,480 = 12,480` (grey =); Currency row on `#FDF5F4` with
   fail-coloured field label, `EUR ≠ USD` in mono 600 and a bordered `≠` badge — the only red cells on screen.
7. Empty sections render as quiet sunken rows: "Supporting — none recorded for this control."
8. Footer: mono `DEC-04 · UNRESOLVED` + outline-ink "Record human decision →".

### 4.5 Decision (board 2F)
Left queue (300px sheet): rows `DEC-0x` + control name + state (✓ Confirmed pass / ✎ Rejected fail /
✎ Exception warn / Open = hollow amber dot); current row petrol spine + tint; footer "5 open · Next unresolved →".
Decision paper (1fr sheet, 2px ink top border):
ChainHeader extended to DEC ref + prev/next links · title + "Automated conclusion: ✕ FAIL — … The conclusion is
preserved whatever you decide." · evidence recap strip (sunken): `12,480 EUR ≠ 12,480 USD` + fact refs + "← Reopen evidence".
Actions (left column): **Confirm** = full-width petrol solid ("Confirm FAIL conclusion") + caption "The standard path…".
Under a hairline, caption "OVERRIDE PATHS — JUSTIFICATION REQUIRED", then Reject (fail-outline on fail-surface) and
Accept exception (grey outline), each with right-aligned `✎ comment required`. Never three identical buttons.
Comment (right column): label + mono `REQUIRED FOR REJECT` flag · bordered field (ink border when active) ·
helper "Overrides require context…" · status strip (2px semantic spine): "Current decision: Rejected · recorded 13:41 · Change decision".
Validation state per board 2J: 2px fail border on field + inline "✕ A reviewer comment is required…", focus moves to field.

### 4.6 Receipt (board 2G)
Centered sheet max-width 920px; toolbar above: Print receipt (ink outline) · Download JSON · Copy receipt ID ·
Copy summary (grey outlines) + mono filename right.
Sheet (3px ink top border): header (mark + "PolicyProof — Decision receipt" + subline | mono receipt id petrol +
GENERATED timestamp) with 1px ink bottom rule · 4-cell meta grid (Policy / Version·ref / Case / Mode·language) ·
summary strip (sunken): coloured counts + "Human decisions: 1 confirmed · 1 rejected · 0 exceptions · 5 unresolved" ·
outcomes table: REF | CONTROL | CONCLUSION | DECISION | REVIEWER COMMENT (rows with overrides get `--pp-warn-row` bg,
comments verbatim in quotes) · two-cell footer grid (Accepted exceptions / Unresolved decisions with mono DEC list) ·
disclaimer strip above 1px ink rule: review-aid disclaimer + mono `DETERMINISTIC REPLAY · FIXTURE v1.0`.
Print view: identical sheet alone on white, no chrome, no buttons (CSS print stylesheet hides shell; sheet width 100%).
JSON export mirrors the sheet field-for-field.

---

## 5. Responsive rules

Breakpoints: 1440 (design) · 1280 · 1024 · 768 · 390.
- ≥1280: full layouts as boards. 1280: page gutter 24px; review split becomes 1fr/1fr.
- 1024–1279: review split retained; METHOD column drops from ledger; header tagline hides; context strip shortens
  to counts only. Controls register drops EVIDENCE column into the expanded detail.
- 768–1023 (board 2I tablet): inspector docks BELOW the ledger (selected row scrolls it into view is forbidden —
  keep position, update content); workflow ledger compresses to mono `01✓ 02✓ 03✓ 04 REVIEW 05`; policy rail and
  decision queue stack above their main column.
- ≤767 (board 2I mobile): no tables. Results are stacked ledger entries (ref + name + conclusion); tapping expands
  evidence IN PLACE (excerpts stacked, ≠ strip, decision button) and collapses others. Decision queue becomes a
  prev/next bar `← DEC-03 · DEC-04 · 4/7 · DEC-05 →`. Documents become two-line entries. Filters wrap as chips.
  Tap targets ≥44px. No horizontal scrolling at any width.
The gutter bridge renders only when panes are side-by-side.

---

## 6. Bilingual constraints

- Language switch is a render-time label swap; it must NEVER reset state (selection, filters, comments, decisions).
- FR terminology (board 2H): CONFORME / ÉCHEC / MANQUANT / ALERTE · Politique / Contrôles / Documents / Revue /
  Décision · "Revue humaine obligatoire" · "Démo déterministe" / "GPT-5.6 en direct" · "Non résolue" ·
  "Dérogation" (exception) · "Reçu de décision" · "Copier l'extrait / la référence" · severities ÉLEV / MOY / CRIT.
- FR labels are ~20–30% longer: grids absorb this (CONCLUSION column 96→104px, filter segments autosize);
  never truncate a status word.
- NEVER translate: exact excerpts, requirement quotes, reviewer comments (verbatim), references (CTRL-04, FACT-*),
  document names, code paths. Excerpts in a non-UI language carry the mono tag `EXTRAIT SOURCE (EN)` /
  `SOURCE EXCERPT (FR)`.
- Number formatting follows UI language (12,480 EN / 12 480 FR) EXCEPT inside excerpts, which are verbatim.

---

## 7. Behaviour that must be preserved

- Automated conclusions remain preserved; human decisions are recorded alongside and never overwrite them.
- Reject / Accept exception cannot be recorded without a non-empty comment (server + client validation).
- Deterministic demo makes zero AI requests; Live mode without `OPENAI_API_KEY` shows the configuration notice
  and keeps demo mode fully available (board 2J).
- Compilation failure leaves policy text and existing register untouched.
- Editing a control (incl. threshold) sets state Edited and requires re-approval before a run.
- Rejected uploads never enter the review but remain listed until removed.
- Receipt can be issued with unresolved items; they are listed as unresolved.
- References are stable for the life of a review file.
- Review results stream row-by-row in ledger order when run.

---

## 8. Forbidden patterns (do not introduce)

Purple/blue-purple gradients or glow · any gradient backgrounds · glassmorphism/blur panels · chat bubbles or
assistant/copilot framing · AI sparkle icons (✨) · floating rounded white cards as layout unit · radius >4px ·
pill buttons · drop shadows inside the workspace · skeleton shimmer blocks (use contextual states, board 2J) ·
decorative illustrations, blobs, mascots · fake charts/metrics/scores · confidence percentages not in the data ·
marketing hero sections inside the app · emoji in UI copy · oversized display type >26px in-app ·
dark-mode command-centre styling · invented page numbers/locations for evidence · new colours, fonts or spacing
values outside the token set · visual overemphasis of GPT-5.6 (it is a labelled layer: `GPT-5.6 · SEMANTIC`).

---

## 9. Implementation notes

- Next.js App Router; screens under a shared `(review)` layout owning header + workflow ledger + context strip.
- State: one client store (e.g. Zustand) — reviewFile { policy, controls, documents, results, decisions, mode,
  language }. Language lives beside (not around) the data so switching cannot remount the tree.
- CSS: plain CSS modules or vanilla-extract with the token block from §2 in `:root`. No Tailwind default palette;
  if Tailwind is already present, map tokens into the theme and use only mapped values.
- Fonts via `next/font/google` (Archivo, Source_Serif_4, Spline_Sans_Mono) with `display: swap`.
- Ledgers: semantic `<table>` or `role="grid"` with keyboard row navigation (↑/↓ move, Enter opens evidence,
  Space toggles where applicable). Filters: `role="radiogroup"`. Steps: `<nav>` + `aria-current="step"`.
- Print: `@media print` hides shell, renders ReceiptSheet at 100% width, preserves exact colours
  (`print-color-adjust: exact`).
- Copy actions write plain text: excerpt verbatim; reference as `FACT-PO-CURRENCY · DOC-01 Purchase Order PO-1042 ·
  POL-2026-004 v1.0 · PP-20260714-1322-N7`.
- The `≠` badge and gutter bridge are DOM elements, not images. The mark is a placeholder component (`<PPMark>`)
  swappable without layout change.
