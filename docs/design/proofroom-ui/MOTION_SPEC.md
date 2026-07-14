# MOTION_SPEC.md — PolicyProof · Proofroom

Motion communicates progression, selection, causality and confirmation. Nothing decorative.
All animations respect `prefers-reduced-motion: reduce` (durations collapse to ~0).

## Durations & easing
- hover/state: 150–180ms ease-out (background, color)
- expand/collapse: 200ms ease-out (opacity + 6px translate-y on revealed body)
- panel/section entrance: 250–300ms ease-out, staggered 50ms steps
- progress loop: 1.0–1.4s linear, thin 2px bar (indeterminate)
- flash highlight: 1.6s single run
- toast: 200ms in, auto-dismiss 2.4s

## Keyframes (canonical names)
- pp-chain-in: opacity 0→1, translateY(6px)→0 — entrance for inspector blocks, notices, expanded rows
- pp-rule-grow: scaleX(0)→1, transform-origin left — chain rules and the gutter bridge
- pp-flash: background --pp-pass-tint → transparent (60% hold) — a row whose conclusion changed
- pp-pulse: box-shadow ring 0→8px fade, petrol at 35% — single pulse on the bridge node
- pp-progress: translateX(-100%→350%) — indeterminate 2px progress bar
- pp-toast-in: opacity 0→1, translate(-50%, 8px→0)

## Signature effect — the evidence chain
On selecting a result row:
1. Row snaps to selected state (petrol-tint bg, 2px petrol spine) — 180ms.
2. Gutter bridge draws left→right (pp-rule-grow 250ms) ending in an 8px petrol node with ONE pp-pulse.
3. Inspector remounts (key = control + run + language) and replays the chain top-down:
   R-ref → rule → CTRL-ref → rule → status (pp-chain-in / pp-rule-grow, 50ms stagger),
   then title, conclusion, requirement quote, evidence blocks (250–350ms window total).
Fast, one pass, no loop. Bridge renders only when panes are side-by-side.

## Threshold-change effect (demo moment)
Precondition: review ran at 10,000; threshold set to 15,000; rerun.
1. Rerun shows the 2px indeterminate bar (~950ms simulated; real: while evaluating).
2. Only CTRL-01's row plays pp-flash (1.6s); all other rows re-render with no motion.
3. Inspector (if CTRL-01 selected) shows a pass-tinted banner: "Conclusion changed — CTRL-01 FAIL → PASS
   because 12,480 EUR no longer exceeds the 15,000 EUR threshold. All other results are unchanged."
4. Summary filter counts update in place (no count-up animation).
No page transition; the ledger never unmounts.

## Micro-interactions
- Toggle: knob slides via justify-content flip + 180ms background.
- Copy actions: label swaps to "Copied ✓" for 1.6s + toast.
- Decision recorded: queue row state swaps with 180ms colour transition; toast confirms.
- Validation error: comment border → 2px fail + error line pp-chain-in 200ms; focus moves to field.
- Compile/extract: progress bar + mono ticker appending "R-0x ✓" every 150ms.
- Language switch: label swap in place, zero motion, zero state loss.

## Forbidden
Parallax, blobs, glow, particles, blur, bounce, confetti, cinematic transitions, autoplay motion,
count-up numbers, skeleton shimmer, anything longer than 400ms except progress loops and pp-flash.
