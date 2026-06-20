# Design QA

## Comparison target

- Source visual truth: `artifacts/mobile-direction-selected.png`
- Implementation screenshot: `artifacts/mobile-redesign-active.png`
- Full-view comparison: `artifacts/mobile-redesign-comparison.jpg`
- Viewport: `390 x 844`
- State: active round with two pieces placed and a third valid placement preview

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: the implementation uses Noto Sans SC for readable Chinese UI and Chakra Petch for compact telemetry. The hierarchy follows the source with concise labels, strong numeric readouts, and restrained helper copy.
- Spacing and layout rhythm: HUD, verified item list, packing board, conveyor, action controls, and next-round preview all fit the target viewport without horizontal or vertical overflow. A grid intrinsic-width issue found during QA was fixed by constraining all game tracks with `minmax(0, 1fr)`.
- Colors and visual tokens: deep navy surfaces, cyan selection and telemetry, green solvability/success, amber timing, and coral invalid-placement feedback map directly to the selected direction.
- Image quality and asset fidelity: the source direction contains no photographic or illustrative assets that need extraction. Product shapes are functional game-state geometry; all UI controls use the existing Phosphor icon library.
- Copy and content: labels explain the touch workflow, explicitly state that each combination is solvable, and preview how the next round becomes harder.
- Interaction states: ready, active, selected, valid preview, invalid preview, placed, undo, paused, failed, round complete, next round, and final completion are implemented.
- Accessibility and responsiveness: controls are semantic buttons with accessible labels, reduced motion is supported, and both `390 x 844` and `360 x 800` render without document overflow.

Focused region comparison was not required because the combined full-view image preserves readable typography and controls at native target scale.

## Patches made

- Replaced precision drag and desktop right-click rotation with explicit mobile controls.
- Added five distinct layouts generated into exact solvable piece sets.
- Added valid/invalid placement previews, undo, pause, hints, timers, scoring, combos, failure/retry, and round progression.
- Fixed the second-round horizontal offset caused by intrinsic button widths.

## Verification

- Production build passes with Vite.
- First round was completed to exactly 100% using its generated solution.
- Round two starts with 20 cells and six different pieces, confirming progression changes.
- Left/right rotation, valid placement, invalid edge blocking, undo, pause/resume, and next-round transition pass.
- Browser console reports no warnings or errors.
- Layout measures exactly `390 x 844` with no overflow; `360 x 800` also passes.

## Follow-up polish

- P3: add subtle conveyor motion and placement sound after gameplay timing is tuned with players.
- P3: add a contextual one-step solution hint instead of the current general strategy hint.

final result: passed
