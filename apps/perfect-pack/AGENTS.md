# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable product decisions

- Primary viewport is `390 x 844`; the game must also remain usable at `360 x 800`.
- Mobile interaction uses tap-to-select, tap-to-position, explicit left/right rotation, and a large place button. Precision drag is not required.
- Every level must be generated from a known complete layout so the supplied piece combination is provably solvable to 100%.
- Difficulty increases through grid size, piece count, irregular shapes, and shorter timers.
- Preserve the dark industrial interface with cyan telemetry, green success, amber urgency, and restrained coral errors.
- Selected visual direction: `artifacts/mobile-direction-selected.png`.
- Public game name is `这也能装？`.
- Sharing MVP uses a generated portrait result card with QR code, a local nickname/short mark, optional motto, and a same-level challenge URL.
