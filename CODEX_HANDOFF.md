# Codex Project Handoff: bobot.is-a.dev

Copy the prompt below into a new Codex project or thread whose workspace is this
repository.

---

## Handoff Prompt

You are taking over the `bobot.is-a.dev` project. Work as the primary product
engineer and maintain the project end to end: product decisions, implementation,
testing, deployment, and documentation.

### Project identity

- Public site: <https://bobot.is-a.dev/>
- GitHub repository: <https://github.com/clawbobot/clawbobot.github.io>
- GitHub account: `clawbobot`
- Deployment: GitHub Pages from the `main` branch
- Custom domain: `bobot.is-a.dev`
- Repository root contains the portfolio homepage.
- The playable game is published at <https://bobot.is-a.dev/play/>.
- Current production commit at handoff: `e928ce0`

The site is a bilingual developer portfolio and experimental product lab. It
should present serious, useful AI and educational products rather than looking
like a collection of unrelated demos.

### Current product

The first playable product is **月球能源危机**, a mobile science strategy game
for players aged roughly 10–15.

Its intended learning and gameplay loop is:

1. Track a moving optimal sunlight window.
2. Observe generated power, total demand, and power deficit.
3. Allocate scarce power among oxygen, communications, and a rover.
4. Keep the oxygen system online long enough to finish the mission.
5. Build combos, complete three increasingly difficult rounds, and improve the
   local best score.

The game deliberately applies useful Duolingo-style principles:

- Let the player start quickly.
- Use short rounds and immediate feedback.
- Keep difficulty just above current mastery.
- Show visible progress and near-miss feedback.
- Make the learning rule necessary for winning.
- Avoid meaningless currencies, loot boxes, punitive hearts, and excessive
  badges.

The game should feel like a polished science strategy game, not a worksheet and
not a preschool activity.

### Existing implementation

The production site currently contains compiled game files under:

```text
play/
```

The editable Vite/React source currently exists outside this repository at:

```text
/Users/bobot/Documents/Codex/2026-06-15/google-trial-credit-for-genai-app/work/moon-charge-game
```

Important source files:

```text
src/App.jsx
src/styles.css
public/assets/lunar-base.png
README.md
design-qa.md
artifacts/energy-rhythm-final.jpg
artifacts/energy-rhythm-final-comparison.jpg
```

Technology:

- React 19
- Vite 6
- `@phosphor-icons/react`
- No backend
- Best score stored only in browser `localStorage`
- Vite base path is `/play/`

The selected visual source is currently stored at:

```text
/Users/bobot/.codex/generated_images/019ecb88-0f48-7642-8f7f-c45fb652abfe/ig_0911298bad1206d1016a35719faf1c8198a38082a0dc4a3af4.png
```

Do not assume that this absolute image path will remain available. Preserve any
required source visual inside the project before relying on it.

### First task: consolidate the project

Before adding substantial features, bring the editable game source into this
repository so future work does not depend on a separate workspace.

Recommended structure:

```text
apps/
  moon-energy-crisis/
    src/
    public/
    artifacts/
    package.json
    vite.config.mjs
    README.md
    design-qa.md
play/
  ...generated production build...
```

Requirements:

1. Copy the editable source into `apps/moon-energy-crisis/`.
2. Keep `/play/` as generated deployment output.
3. Add root-level scripts or documentation for installing, developing, building,
   and publishing the game.
4. Do not break the existing homepage or custom domain.
5. Preserve the current live game until the replacement build is verified.
6. Never manually edit minified files under `play/assets/`.
7. Build from source, then replace `play/` with the verified `dist/` output.
8. Commit generated deployment files only because GitHub Pages currently serves
   this repository directly.

### Product direction

Treat the current game as a strong prototype, not a finished product.

Prioritized next improvements:

1. Validate the core loop with real students before adding broad progression.
2. Add lightweight anonymous local play analytics or an explicitly approved,
   privacy-safe telemetry design:
   - start rate
   - first-round completion rate
   - failure reason
   - retry rate
   - completion time
   - device viewport
3. Improve touch feel:
   - panel rotation tied to tracking position
   - optional haptics
   - clearer first-action affordance
4. Tune difficulty using observed completion data rather than intuition.
5. Add one additional mission only after the first mission's retention loop is
   validated.
6. Integrate the game into the portfolio homepage as a featured product with a
   clear play CTA, screenshot, target audience, and product rationale.

Do not add accounts, payments, cloud storage, classrooms, global rankings, or AI
features until there is evidence that the core game is enjoyable.

### Design constraints

- Primary viewport: `390 x 844`.
- Must remain usable on desktop without pretending to be a desktop game.
- Visual direction: dark lunar environment, cyan telemetry, amber solar energy,
  green success, restrained coral warnings.
- Use real image assets for scene artwork and a consistent icon library for UI
  icons.
- Do not use emoji, handcrafted SVG, ASCII art, or placeholder boxes as visible
  product assets.
- Avoid excessive cards, giant bubbly typography, toy-like controls, decorative
  rewards, or mascot-dominated layouts.
- Keep Chinese UI copy concise and readable.
- Preserve keyboard access and reduced-motion behavior.

### Engineering rules

- Inspect the repository and current git status before editing.
- Preserve unrelated user changes.
- Use existing patterns and keep changes scoped.
- Never use destructive git commands.
- Run the production build after changes.
- Test the actual local app at `390 x 844`.
- Verify click/touch-style tracking, keyboard controls, power toggles, pause,
  failure, retry, round completion, and the next round.
- Check console warnings/errors and horizontal/vertical overflow.
- Keep `design-qa.md` current for meaningful visual changes.
- Do not publish until the build and browser verification pass.
- After publishing, verify both:
  - <https://bobot.is-a.dev/>
  - <https://bobot.is-a.dev/play/>

### Deployment workflow

The current safe workflow is:

```bash
cd apps/moon-energy-crisis
npm install
npm run build

cd ../..
rm -rf play/*
cp -R apps/moon-energy-crisis/dist/. play/
git add apps/moon-energy-crisis play
git commit -m "<clear change description>"
git push origin main
```

Before using `rm -rf play/*`, confirm that `play/` contains only generated game
output and that the source is safely stored under `apps/moon-energy-crisis/`.
Prefer a repository build script that performs these checks.

GitHub Pages can take tens of seconds to refresh. Confirm the live page title and
core UI after the push rather than assuming deployment succeeded.

### Current known-good behavior

At handoff, the following were verified:

- Homepage returns HTTP 200.
- `/play/` returns HTTP 200.
- Production title is `月球能源危机 · 科学策略游戏`.
- Game starts from the mission overlay.
- Click-to-position and keyboard tracking work.
- Power-system toggles change demand.
- Round 1 can be completed.
- Failure and retry work.
- Round 2 starts with increased difficulty.
- Pause and resume work.
- No browser console warnings or errors were observed.
- The game fits a `390 x 844` viewport without overflow.

### How to begin

Start by:

1. Reading this file and the repository `README.md`.
2. Inspecting `git status`, recent commits, homepage structure, and `play/`.
3. Confirming the external editable source directory still exists.
4. Creating a short plan to consolidate the game source into this repository.
5. Performing the consolidation, build, browser verification, and documentation
   update end to end.

Do not stop after proposing a plan unless a destructive ambiguity or missing
source blocks the work.

---

## Short Prompt

Use this shorter version when the Codex project already has access to
`CODEX_HANDOFF.md`:

```text
Take over the bobot.is-a.dev project as the primary product engineer. Read
CODEX_HANDOFF.md and README.md, inspect the repository and git history, then
execute the first-task consolidation described there: bring the editable
月球能源危机 React/Vite source into apps/moon-energy-crisis, keep play/ as
generated GitHub Pages output, add a safe build/publish workflow, verify the
homepage and game at 390x844, and preserve the current live behavior. Continue
through implementation, testing, documentation, and deployment; do not stop at
a plan.
```
