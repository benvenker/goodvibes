# goodvibes

## 3.0.0

### Major Changes

- Migrate networking layer to Vibescale

  - Remove custom WebSocket implementation and Cloudflare Durable Objects
  - Integrate Vibescale for multiplayer networking
  - Add persistent audio preferences syncing across sessions
  - Update player state management to use Vibescale room events
  - Simplify deployment configuration by removing Cloudflare Worker setup

### Minor Changes

- Add centralized game state management

  - Implement new store.ts for managing game state
  - Add type-safe state management with TypeScript
  - Provide reactive state updates for game components

### Patch Changes

- Improve development setup and documentation

  - Add .env.template for environment configuration
  - Add Cursor rules for consistent development practices
  - Document changeset, coding, and Vibescale integration guidelines

## 2.0.1

### Patch Changes

- Dependency fixes

## 2.0.0

### Major Changes

- Consolidated to Cloudflare Vite project
