# Accessibility release checklist

PolicyProof has automated and local regression coverage, but it does not claim full WCAG conformance or accessibility certification.

## Automated and locally verified

- [x] Keyboard-only access to primary review, evidence, decision, receipt, and verification actions.
- [x] Visible focus treatment on interactive controls.
- [x] Textual PASS, FAIL, MISSING, WARNING, valid, modified, malformed, unsupported, and missing-integrity labels; meaning is not color-only.
- [x] Reduced-motion preference preserves access to content and actions.
- [x] Responsive reflow at desktop, 1280 × 720, tablet, and 390 × 844 mobile sizes.
- [x] Effective 200% browser-zoom regression path.
- [x] No horizontal page overflow in the tested responsive paths.
- [x] Accessible names for primary controls and receipt actions.
- [x] English and French critical paths.
- [x] Receipt hash remains secondary to human decision and is copyable through a named action.

These checks are implemented through component and Playwright tests. They are evidence for the tested paths, not a universal accessibility guarantee.

## Owner manual verification required

- [ ] Physical iPhone Safari at 390-pixel-class width.
- [ ] VoiceOver on a physical iPhone.
- [ ] NVDA on Windows or VoiceOver on macOS desktop.
- [ ] Real browser zoom at 200%, not only an effective automated viewport.
- [ ] Real print dialog and paper/PDF preview.
- [ ] Production JSON, Markdown, and CSV downloads.
- [ ] Color-contrast spot check for body text, muted text, focus rings, and all result states.
- [ ] Private-navigation test of the deployed production URL.

## VoiceOver spot check on iPhone

1. Open **Settings → Accessibility → VoiceOver**.
2. Turn VoiceOver on and review the gesture reminder before leaving Settings.
3. Open the deployed PolicyProof URL in Safari.
4. Swipe right through the header, language selector, Focused Demo controls, result register, evidence details, human-decision controls, and receipt verification.
5. Confirm each interactive element has a useful name, role, state, and predictable order.
6. Confirm PASS/FAIL/MISSING/WARNING and receipt-integrity results are spoken as text, not inferred only from color.
7. Activate Run review, one result, the human decision, and Verify integrity using VoiceOver gestures.
8. Record any missing name, duplicate announcement, focus trap, unexpected jump, or unreachable action.
9. Turn VoiceOver off in Settings when finished.

## Desktop screen-reader spot check

### NVDA on Windows

1. Install or launch NVDA from its official distribution.
2. Open the deployed site in Chrome or Firefox.
3. Use `Tab` and `Shift+Tab` for interactive order; use heading and landmark shortcuts to inspect structure.
4. Run the Northstar path and verify result labels, exact excerpts, decision fields, validation errors, and receipt status are announced.
5. Confirm the local receipt verifier reports valid and modified states without exposing a stack trace.
6. Record browser, NVDA version, findings, and screenshots that contain fictional data only.

### VoiceOver on macOS

Use `Command+F5` to toggle VoiceOver, complete the same heading, landmark, keyboard, evidence, decision, and receipt checks, then turn it off.

## Release decision

Any blocker that prevents review, evidence inspection, decision recording, or receipt verification with keyboard or screen reader must be corrected and regression-tested before publication. Cosmetic differences that do not block meaning should be documented for later improvement.
