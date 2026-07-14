# DESIGN_TOKENS.md — PolicyProof · Proofroom (The Evidence Ledger)

Normative token set. No colour, size, duration or radius outside this file may be introduced.

## Colour

| Token | Value | Role |
|---|---|---|
| --pp-workspace | #F0F1EE | app background (mineral) |
| --pp-sheet | #FFFFFF | primary surface |
| --pp-sunken | #F7F8F6 | table heads, footers, recap strips |
| --pp-raised | #FDFDFC | expanded row body |
| --pp-ink | #16181A | primary text, strong rules, active segments |
| --pp-graphite | #3B4045 | body text |
| --pp-grey | #71787E | secondary text, captions |
| --pp-faint | #9BA1A6 | tertiary text, placeholders, pending refs |
| --pp-hairline | #DFE2DD | default 1px border |
| --pp-hairline-soft | #EDEFEA | row separators inside sheets |
| --pp-frame | #C5C8C2 | outer sheet border, control borders |
| --pp-petrol | #0B5156 | brand accent: refs, selection, primary actions, links |
| --pp-petrol-hover | #0D6167 | primary button hover |
| --pp-petrol-tint | #E8EFEE | selected-row background, active mode segment |
| --pp-pass / -tint / -border | #1B7A43 / #EAF3ED / #C4DECD | PASS · CONFORME |
| --pp-fail / -tint / -border | #B42318 / #F9ECEA / #E5C4BE | FAIL · ÉCHEC, errors, reject |
| --pp-miss / -tint / -border | #5D6572 / #EEF0F2 / #B9BFC7 (dashed) | MISSING · MANQUANT |
| --pp-warn / -tint / -border | #96690D / #F7F0DF / #E4D3A8 | WARNING · ALERTE, edited, unresolved |
| --pp-crit | #7A1512 | CRITICAL severity text |
| --pp-fail-surface | #FDF5F4 | error notice bg, reject button bg |
| --pp-warn-row | #FDFBF7 | receipt override-row bg |
| --pp-warn-text | #6B4E10 | text on warn tint |

Status glyphs (always with the word): PASS ✓ · FAIL ✕ · MISSING ⌀ · WARNING ! · override ✎ · contradiction ≠.
MISSING is the only dashed border in the system.

## Typography

Families: Archivo (UI) · Source Serif 4 (source material ONLY) · Spline Sans Mono (data ONLY).
Google Fonts, weights: Archivo 400/500/600/700 · SS4 400/600 + italic · SSM 400/500/600.

| Token | px/weight | Use |
|---|---|---|
| display | 26/600, ls -0.01em | app screen titles (24px inside app shell) |
| title | 20/600 | decision paper title |
| section | 18/600 | inspector title |
| body | 13.5/400, lh 1.55 | primary body |
| ui | 13/400–500 | rows, buttons |
| label | 12/500 | form labels |
| caption | 11/500, ls .1em, UPPERCASE | column heads, section captions (10–10.5px in dense heads) |
| source-policy | serif 15/400, lh 1.5 | policy requirement text |
| source-excerpt | serif 14/400, lh 1.45 | evidence excerpts |
| source-quote | serif 13/400 italic | requirement quote in inspector |
| data | mono 12.5/500 | amounts, dates |
| data-ref | mono 11–12/600 | CTRL-/DOC-/DEC-/FACT- refs |
| data-meta | mono 10–10.5/400 | provenance lines, context strip |

## Spacing
4 / 8 / 12 / 16 / 24 / 32 / 48. Page gutter: 28–32px desktop · 20px tablet · 16px mobile.
Row vertical padding: 11–12px. Sheet inner padding: 14–24px.

## Radii
0 sheets/rows · 2px chips, buttons, inputs, toggles. Nothing larger.

## Borders
1px hairline default · 2px petrol selection spine · 2px semantic notice spine · 2–3px ink folio top border · 1px ink receipt rules.

## Shadows
None inside the workspace. Overlays only: 0 8px 24px rgba(22,24,26,.10).

## Motion (see MOTION_SPEC.md)
--pp-fast 150ms · --pp-med 200ms · --pp-slow 280ms · easing ease-out; progress loop 1.0–1.4s linear.

## Focus
2px solid #0B5156 outline, offset 2px, on :focus-visible. Never removed.

## Breakpoints
390 · 760 (mobile ceiling) · 1024 · 1120 (split ceiling in app) · 1280 · 1440 (design width). Max content width 1440px centered.

## Z-index
0 workspace · 10 sticky chrome · 40 guided-demo panel · 50 toast.
