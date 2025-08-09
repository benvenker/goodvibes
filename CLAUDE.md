# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoodVibes is a multiplayer 3D web game starter kit built with Three.js and Vibescale. It provides a foundation for developing real-time multiplayer browser games with physics, 3D graphics, and spatial audio.

## Critical Project Rules

### Core Architecture Constraints
- **Bun is the package manager** - always use `bun` commands, never npm/yarn
- **Three.js is the ONLY external library allowed** - everything else must be created from scratch
- **No build chain other than Vite** - do not add webpack, rollup, or other build tools
- **TypeScript everywhere** - all files must be TypeScript
- **Use early returns** - avoid deep nesting in conditionals
- **Prefer types over interfaces** - when defining TypeScript types

### Code Style Requirements
- **Aggressive separation of concerns** - keep components focused and single-purpose
- **Component-specific CSS files** - co-locate styles with components, avoid inline styles
- **Use Tailwind/DaisyUI classes** - available in `src/styles/styles.css`
- **Follow Prettier configuration** - code formatting is enforced
- **Exceptionally brief commit messages** - be concise and direct

## Development Commands

```bash
# Install dependencies
bun install

# Development server (port 5173)
bun run dev

# Build for production
bun run build

# Deploy to Cloudflare
bun run deploy

# Build and deploy in one command
bun run ship

# Type checking
bun run typecheck
```

## Architecture

The codebase follows an Entity-Component-System inspired architecture with clear separation of concerns:

### Core Systems

1. **Game Loop** (`src/game/Game.ts`): Main orchestrator that manages initialization, animation loop, and system updates
2. **Networking** (`src/game/NetworkManager.ts`): Real-time multiplayer via Vibescale with optimized state synchronization
3. **State Management** (`src/game/store.ts`): Centralized reactive store using Vibescale's room system
4. **Input Handling** (`src/core/controls/`): Keyboard and touch controls with input aggregation
5. **Camera System** (`src/core/CameraController.ts`): Third-person following camera with smooth interpolation
6. **Physics** (`src/config/carPhysics.ts`): Tunable vehicle physics parameters

### Directory Structure (STRICT)
All code MUST live in `/src` with this organization:
- `/src/game` - Core game logic and Three.js implementation
- `/src/server` - Cloudflare Worker and Durable Objects implementation  
- `/src/ui` - User interface components
- `/src/core/controls` - Game control handlers
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions
- `/src/styles` - Global styles and Tailwind/DaisyUI configuration
- `/src/config` - Application configuration

## Development Workflow

### When Making Changes
1. **Always discuss a plan first** - wait for approval before coding (two separate interactions minimum)
2. **Use early returns** - avoid deep nesting
3. **After each task**, review code and recommend the most important single refactoring that is both helpful and minimal
4. **Create changeset entries** when marking work as 'wip':
   - One .changeset entry per distinct change
   - Update README.md and CLAUDE.md as needed
   - Follow semantic versioning (patch/minor/major)

### Changesets
When creating changesets, analyze git diff between most recent tag and HEAD:
- Breaking changes → major version bump
- New features → minor version bump  
- Bug fixes/improvements → patch version bump

Format:
```
---
'package-name': patch|minor|major
---

Description of changes
```

## Testing Strategy

Currently no test framework is implemented. When adding tests:
1. Use Vitest for unit testing (integrates with Vite)
2. Test physics calculations and state management logic
3. Mock Three.js components for unit tests
4. Test network state synchronization logic
5. Add integration tests for multiplayer scenarios

## Deployment Configuration

The project deploys to Cloudflare:
- Static assets served via Cloudflare Pages
- Vibescale handles real-time networking
- Environment variables configured in Cloudflare dashboard
- Deploy command: `bun run build && bun run deploy`
- Wrangler configuration available but mostly commented out (legacy Durable Objects)

## Vibescale Integration

For any server communication, MMO features, rooms, or room events:
- Refer to Vibescale documentation in node_modules/vibescale
- Use the reactive room system for state management
- Implement optimized state synchronization patterns
- Handle connection/disconnection gracefully

## Common Development Tasks

### Adding New Game Objects
1. Create entity class extending THREE.Group or Mesh
2. Add to Game.ts initialization
3. Implement update method for animation loop
4. Add network synchronization if multiplayer
5. Follow aggressive separation of concerns

### Modifying Physics
Edit `src/config/carPhysics.ts` for vehicle behavior:
- `maxSpeed`, `acceleration`, `friction` for movement
- `turnSpeed`, `driftFactor` for handling
- `collisionBounce` for collision response

### Adding UI Components
1. Create VanJS component in `src/ui/`
2. Import and mount in Game.ts or main.ts
3. Use Tailwind/DaisyUI classes for styling (no inline styles)
4. Create component-specific CSS file co-located with component
5. Connect to game state via store or EventEmitter

### Debugging Network Issues
1. Enable DebugPanel in development
2. Monitor Vibescale connection status
3. Check network update frequency in NetworkManager
4. Use browser DevTools Network tab for WebSocket inspection

## Important Patterns

### State Updates
Always use the store for shared state:
```typescript
// Good
store.room.set('player1Position', newPosition);

// Bad - bypasses synchronization
this.localPlayer.position = newPosition;
```

### Performance Optimization
- Use delta time for all animations: `update(deltaTime)`
- Throttle network updates with position/rotation thresholds
- Dispose Three.js resources properly to prevent memory leaks
- Use object pooling for frequently created/destroyed objects
- Optimize assets using provided image optimization plugins
- Implement proper code splitting and lazy loading
- Minimize bundle size by avoiding unnecessary dependencies

### Error Handling
- Implement proper error boundaries
- Add appropriate logging for debugging
- Test edge cases and error scenarios
- Wrap network operations in try-catch blocks
- Display errors in DebugPanel during development
- Implement reconnection logic for network disconnects
- Gracefully handle missing audio context or WebGL support
- Ensure proper cleanup in useEffect hooks and event listeners

### Security Requirements
- Never expose sensitive information in client-side code
- Implement proper input validation
- Use appropriate CORS policies
- Follow security best practices for WebSocket connections

## Quality Assurance

### After Each Task
1. Review all code for refactoring opportunities
2. Ensure TypeScript types for all variables, functions, and components
3. Verify proper error handling and type checking
4. Check that Prettier formatting is applied
5. Update documentation for complex functions and components
6. Maintain clear and concise commit messages
7. Update README.md with new features and changes
8. Document any breaking changes or major updates
- you have access to the context7 MCP server when you need dependency documentation, like Three.js