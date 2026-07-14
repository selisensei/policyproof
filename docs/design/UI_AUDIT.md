# PolicyProof UI Audit

Audit date: 14 July 2026
Baseline commit: `ed5db89d9fcc4b9f1bc5e608950d25b4b795d598`
Reviewed viewports: 1440, 1280, 1024, 768, and 390 pixels wide

## Executive assessment

The baseline is functional, readable, and evidence-aware, but it looks like a collection of well-formatted prototype cards rather than a focused review product. Its strongest content—the result, source excerpt, and human decision—is visually competing with repeated navigation, status, marketing, readiness, and walkthrough surfaces.

The redesign should make PolicyProof feel like a calm professional case-review workspace. The five-step journey remains, but the interface should reveal context once, place the current task first, and make evidence the most distinctive visual object.

## What already works

- Statuses use text and symbols in addition to color.
- The deterministic mode and human-review boundary are explicit.
- Evidence records preserve document names, exact excerpts, field locators, and confidence.
- The decision receipt clearly separates the computed outcome from the reviewer decision.
- English and French state preservation works across the tested journey.
- Core controls are keyboard reachable and mobile content does not overflow horizontally.

## Findings by severity

### Critical to the judge experience

1. **Too much repeated chrome before the task.** The application header, five-step bar, value banner, mode banner, event message, section heading, case-readiness card, step action card, and walkthrough can all appear at once. This delays the first meaningful action and makes every step look structurally identical.
2. **The primary workspace is too narrow.** At desktop widths, the permanent right rail duplicates counts and actions that already exist elsewhere. The evidence matrix and receipt—the most important demo surfaces—receive less width than supporting guidance.
3. **The evidence inspector is not yet the visual centerpiece.** It contains the right information, but it reads as another grey card beside a generic table. The selected control, source relationships, exact excerpts, and missing-evidence state need a clearer hierarchy.
4. **Mobile requires excessive vertical travel.** The stacked header controls, five tiny step labels, large introduction, status banners, case summary, and full walkthrough produce a very long first screen before the workflow feels usable.

### Important usability issues

5. **Navigation does not adapt enough by viewport.** The desktop step bar becomes five compressed labels on mobile, while the header controls wrap into three full-width rows.
6. **Controls are difficult to scan as a control set.** Each row has nearly identical weight, important parameters are hidden, and the expanded threshold field dominates without explaining the control logic at a glance.
7. **Documents look generic.** Document cards show type, name, and extracted-fact count, but not a compact case-file hierarchy or enough source metadata to help a reviewer orient quickly.
8. **Decision work lacks queue context.** The receipt is strong, but the reviewer has no compact way to move through unresolved results or see why a selected decision needs attention.
9. **Guided-demo guidance is overexposed.** A nine-item checklist is useful during rehearsal, but its persistent desktop rail and full mobile card make the product feel like a tutorial rather than a review tool.

### Visual-system issues

10. **Card repetition flattens hierarchy.** Similar white rectangles, borders, and shadows are used for primary tasks, notices, navigation, summaries, and secondary actions.
11. **The dark navy surfaces are overused.** Brand, introduction, value banner, case readiness, and receipt header all use nearly the same treatment, so the product lacks a single deliberate focal point.
12. **Spacing is inconsistent with information importance.** Large empty areas appear after short steps, while dense review content has comparatively limited width.
13. **Typography is legible but not sufficiently editorial.** Labels, identifiers, facts, and actions are present, yet task headings and evidence excerpts do not create a distinctive professional rhythm.

## Step-specific opportunities

### Policy

- Replace the persistent marketing hero with a concise first-run orientation inside the task.
- Present policy provenance and the seven source rules as a compact reviewable source document.
- Keep one primary action: load the fictional Northstar case.

### Controls

- Use a compact control register with clear enabled state, severity, evaluation method, parameter, and evidence expectation.
- Make row expansion optional and visually subordinate to scanning.
- Preserve the threshold edit and reset behavior.

### Case documents

- Treat documents as a case file, with document type, stable source name, extracted-fact count, and selection state aligned in rows.
- Make expanded source content clearly read-only and untrusted.

### Review

- Use a compact results rail and a dedicated evidence canvas.
- Make the selected result visually unmistakable.
- Group supporting, contradictory, and missing evidence with distinct semantic treatments.
- Keep exact excerpts and locators close together and make copy actions secondary.

### Decision

- Add an unresolved-result queue or selector.
- Keep the decision form close to the selected result context.
- Preserve the receipt as a polished printable artifact without a competing permanent rail.

## Responsive direction

- Desktop: slim utility header, persistent vertical workflow navigation, wide task canvas, and no generic right rail.
- Tablet: compact horizontal workflow switcher above a single-column task canvas.
- Mobile: short sticky top utility area, horizontally scrollable step switcher, one-column content, and collapsed optional guidance.
- At every width, the first task action should appear before secondary teaching content.

## Redesign acceptance criteria

- The application no longer looks like a stack of interchangeable cards.
- The current task is identifiable within one glance at every supported width.
- Evidence is the strongest visual surface in Review.
- The Policy first screen reaches its primary action quickly.
- The walkthrough is available but never dominates the workspace.
- All existing deterministic, mocked Live, bilingual, receipt, export, accessibility, and safety behavior remains intact.
