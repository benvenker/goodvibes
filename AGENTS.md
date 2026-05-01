# AGENTS.md

## Cursor Cloud specific instructions

### Overview

GoodVibes is a multiplayer 3D browser game (Three.js + TypeScript + Vite). It is a client-side SPA that connects to an external Vibescale WebSocket server for multiplayer room state management.

### Prerequisites

- **Bun** is the package manager (lockfile: `bun.lock`). Install via `curl -fsSL https://bun.sh/install | bash`.
- After installing bun, you must add it to PATH: `export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH"`

### Key Commands

| Command | Purpose |
|---|---|
| `bun install` | Install dependencies |
| `bun run dev` | Start Vite dev server (localhost:5173) |
| `bun run build` | TypeScript check + Vite production build |
| `bunx prettier --check "src/**/*.ts"` | Run formatting/lint check |

### Gotchas

- **No automated test suite exists** in this project. There are no test scripts or test frameworks configured.
- **The "Play Now" button is disabled until a WebSocket connection to the Vibescale server is established.** The external server at `vibescale.benallfree.com` handles multiplayer. If it's unreachable, the game UI still loads but gameplay is blocked.
- **No lint command** is configured in `package.json`. Use `bunx prettier --check` for formatting checks.
- **`.env` must be created from `.env.template`** before running. The template has sensible defaults for local development.
- The Cloudflare Vite plugin is active in dev mode but Durable Objects in `wrangler.toml` are commented out - no local server component runs.
- `npx` is not available; use `bunx` instead for running binaries.
