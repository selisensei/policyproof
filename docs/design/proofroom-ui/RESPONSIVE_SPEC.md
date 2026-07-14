# RESPONSIVE_SPEC.md — PolicyProof · Proofroom

Design width 1440. Breakpoints: 1280 · 1024 · 768 · 390. App runtime uses: desktop ≥1120 · tablet 760–1119 · mobile <760.
No horizontal scrolling of content at any width (the workflow ledger may scroll itself as a strip).

## Shell
- ≥1280: full header (mark, wordmark, tagline, EN/FR, mode, human-review label, help, primary action).
- 1024–1279: tagline hides; context strip shortens to counts.
- <1120: header keeps mark/wordmark + EN/FR + mode + primary; human-review label moves into first-run card & receipt only.
- <760: workflow ledger compresses to mono refs (01✓ 02✓ 03✓ 04 REVIEW 05); context strip hidden (context lives in screens).

## Policy
- ≥1120: folio 1fr + 360px compilation rail.
- <1120: rail stacks under the folio, full width.
- <760: folio meta grid wraps 2×2; requirement rows keep 52px margin-marker column.

## Controls
- ≥1120: 7-column register.
- 1024–1119: EVIDENCE column merges into expanded detail.
- <760: rows become two-line entries (ref+name+state / severity+method); expanded detail stacks;
  parameter editor full width; stepper buttons ≥44px.

## Documents
- ≥1120: 7-column register.
- <760: two-line stacked entries (ref+name+validation / type · date · party · facts); upload zone stacks and centers.

## Review (canonical transformations)
- ≥1120: split 1.02fr / 0.98fr with 24px gutter + bridge.
- 760–1119: panes stack — ledger full width, inspector docks below; bridge hidden; selection keeps
  scroll position (never auto-scroll).
- <760: no table. Stacked ledger entries (ref + name + conclusion); tapping expands evidence IN PLACE
  (conclusion sentence, stacked excerpts, ≠ strip, decision button) and collapses others; filters wrap as chips;
  contradictory pair stacks 1-col.
- Filtered-empty, not-run and loading states are full-width panels at every size.

## Decision
- ≥1120: queue 300px + paper 1fr; paper body 2 columns (actions | comment).
- 760–1119: queue stacks above paper; paper keeps 2 columns.
- <760: queue collapses to prev/next bar (← DEC-03 · DEC-04 · 4/7 · DEC-05 →); paper single column;
  Confirm full-width; action area may stick to bottom with 12px inset.

## Receipt
- Sheet max-width 920, centered; <760 the meta grid wraps 2×2, outcomes keep 5 columns until 560 then
  comment drops to its own row under the entry.
- Print: sheet alone at 100% width, no chrome (see DESIGN_HANDOFF §print).

## Touch & type floors
Tap targets ≥44px on mobile. Body text never below 12px on mobile; mono meta never below 10px.
French labels are 20–30% longer: columns that hold status words size to the FR string (CONCLUSION 100–104px,
DECISION 120px); never truncate a status word.
