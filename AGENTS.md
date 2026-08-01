# AGENTS.md

## Cursor Cloud specific instructions

This repo is the static, GitHub-Pages-served site `bobot.is-a.dev` (portfolio homepage + an
arXiv "museum" + several small games). GitHub Pages serves the repo contents directly, so the
`play/`, `play-pack/`, `play-ai-school/`, `play-school/`, and `play-rescue/` folders are
**committed generated build output** — do not hand-edit minified files under `play*/assets/`.
There is no lint or automated test setup in this repo.

### npm cache gotcha (important)
Each Vite app (`apps/moon-energy-crisis`, `apps/perfect-pack`, `apps/school-pack` and the
`.npmrc` used by `apps/ai-school`) contains an `.npmrc` that hardcodes a macOS-only npm cache
path (`/Users/bobot/.../.npm-cache`). On the Linux VM that path is not writable, so plain
`npm ci`/`npm install`/`npm run` inside those dirs fails. Always override the cache, e.g.
`npm ci --cache /workspace/.npm-cache` or `npm install --cache /workspace/.npm-cache`. The
startup update script already installs all four apps this way. (Running `npm run dev`/`build`
after install does not touch the cache, so those are fine.)

### Services and how to run them (dev mode)
- **Portfolio homepage + museum** (static, no build): serve the repo root with
  `python3 -m http.server 8787` (see `.claude/launch.json`). Homepage = `/` (`index.html`),
  museum = `/museum/`.
- **Vite/React games** under `apps/` — run `npm run dev` in the app dir (dev server binds
  `127.0.0.1` only). Each has a fixed base path, so open the base path, not `/`:
  - `apps/moon-energy-crisis` → `/play/` (root `npm run dev`)
  - `apps/perfect-pack` → `/play-pack/` (root `npm run dev:pack`)
  - `apps/ai-school` → `/play-ai-school/`
  - `apps/school-pack` → `/play-school/`
- **rescue-hero** (static, no build/deps): `python3 -m http.server 5176` from
  `apps/rescue-hero` (root `npm run dev:rescue`).
- **Museum Python pipeline** (`museum/pipeline/`, Python 3 stdlib only, no pip installs):
  `python3 museum/pipeline/build_manifest.py` rebuilds `manifest.json` — this rewrites only the
  `generated_at` timestamp, so don't commit that noise. `ingest.py` / `--verify-quote` call the
  live arXiv API (needs network).

### Build / deploy
`npm run build` (a.k.a. `deploy:local`) rebuilds several games and overwrites the committed
`play*/` output. Only run it intentionally; for normal development use the dev servers above.
