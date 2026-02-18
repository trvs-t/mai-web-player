# Mai Web Player - Agent Guide

**Project**: maimai chart visualizer (TanStack Start + Vite + PixiJS + Bun)

## Quick Reference

### Commands (Use Bun, not npm)

```bash
# Development
bun run dev          # Vite dev server on port 3001

# Build
bun run build        # TypeScript + Vite build
bun run preview      # Preview production build

# Code Quality (oxlint/oxfmt - Rust-based, fast)
bun run lint         # Lint with oxlint
bun run lint:fix     # Auto-fix lint issues
bun run format       # Format with oxfmt (80 char width, 2-space)
bun run format:check # Check formatting
bun run check        # Full check: tsc + lint + format

# Testing (bun:test)
bun test                      # Run all tests
bun test --watch              # Watch mode
bun test --coverage           # With coverage
bun test --update-snapshots   # Update snapshots

# Run single test file
bun test src/lib/__tests__/chart.test.ts

# Run tests matching pattern
bun test --grep "TapChartData"
```

## Code Style

### Imports

- **Alias**: Use `@/` for `src/`, `@/utils/` for `utils/`
- **Order**: React → External libs → Internal (`@/`) → Relative (`../`)
- **Types**: Use `import type { X }` for type-only imports

```typescript
import { useState, useCallback } from "react";
import { Graphics } from "@pixi/react";
import { PlayerContext } from "@/contexts/player";
import { getLaneRotationRadian } from "@/utils/lane";
import type { Chart } from "@/lib/chart";
```

### Formatting

- **Tool**: oxfmt (Prettier-compatible, 30x faster)
- **Width**: 80 characters
- **Indent**: 2 spaces (no tabs)
- **Semicolons**: Required
- **Quotes**: Double quotes
- **Trailing commas**: Always

### Naming

- **Files**: kebab-case (`timer-context.tsx`)
- **Components**: PascalCase (`Player`, `TimerControls`)
- **Hooks**: camelCase starting with `use` (`useTimer`, `useLaneMovement`)
- **Types/Interfaces**: PascalCase (`TimerConfig`, `ChartData`)
- **Constants**: UPPER_SNAKE_CASE for true constants

### Types (Strict TypeScript)

- Enable strict mode - no `any` without justification
- Discriminated unions for note types (`type: "tap" | "hold" | "slide"`)
- Explicit return types on exported functions
- No `as` assertions unless absolutely necessary

### Error Handling

- Use custom error types with context
- Validate inputs at boundaries (parsers, API)
- Fail fast with clear error messages
- Never suppress errors silently

### React Patterns

- **Contexts**: One file per domain (`timer.tsx`, `audio.tsx`)
- **Hooks**: Co-locate related logic, extract reusable patterns
- **Components**: Prefer composition over inheritance
- **Pixi**: Don't create Graphics in render loop (reuse callbacks)

## Testing Strategy

### Test Structure (bun:test)

```typescript
import { describe, it, expect } from "bun:test";
import type { Chart } from "../chart";

describe("Feature Name", () => {
  describe("Sub-feature", () => {
    it("should do something specific", () => {
      const result = someFunction();
      expect(result).toBe(expected);
    });
  });
});
```

### Test File Organization

- **Location**: `src/lib/__tests__/*.test.ts` or `src/lib/__tests__/*.test.tsx`
- **Naming**: `feature.test.ts` (kebab-case)
- **Helpers**: `src/lib/__tests__/helpers.ts` for shared utilities
- **Fixtures**: `src/lib/__tests__/fixtures.ts` for test data

### Test Patterns

- Use `describe` blocks for grouping
- Test edge cases and error conditions
- Use snapshots for complex parser output
- Helper functions should throw descriptive errors

### Running Tests

```bash
# Single file
bun test src/lib/__tests__/chart.test.ts

# Watch mode
bun test --watch

# With pattern
bun test --grep "should parse tap"

# Update snapshots
bun test --update-snapshots
```

## Project Structure

```
src/
├── routes/          # TanStack Router (file-based)
│   ├── __root.tsx   # Root layout
│   ├── index.tsx    # Home page
│   └── player.tsx   # Main visualizer
├── contexts/        # React contexts
├── components/      # React components
│   ├── view/        # PixiJS rendering
│   └── *.tsx        # UI components
├── lib/             # Core logic + types
├── hooks/           # Custom hooks
└── app.tsx          # Entry point

utils/               # Shared utilities
public/              # Static assets
```

## Key Conventions

1. **Timing**: All time values in milliseconds (converted from beats via BPM)
2. **Coordinates**: Polar system centered on screen (8 lanes at 45° intervals)
3. **Data Flow**: simai string → Chart → VisualizationData → render
4. **Pixi Rendering**: Separate React tree bridged via ContextBridge

## Anti-Patterns (Don't Do)

- `as any` or `@ts-ignore` - fix the type issue instead
- Create Pixi Graphics in render loop - use `useCallback`
- Mix sync/async in `useEffect` without proper cleanup
- Use Next.js patterns (this is Vite SPA, not Next.js)

## Lint Rules (oxlint)

- **Plugins**: import, typescript, unicorn, react, react-hooks
- **Strict**: correctness=error, suspicious=warn, perf=warn
- **Overrides**: Test files allow `any` and unused vars

## Commit Style (Conventional Commits)

Use semantic prefixes with optional scope:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code change that neither fixes nor adds feature
- **perf**: Performance improvement
- **docs**: Documentation only
- **test**: Tests only
- **chore**: Build/config/tooling changes

### Scopes (examples)

- `(timer)`, `(audio)`, `(parser)`, `(slides)`, `(rendering)`
- `(controls)`, `(export)`, `(pooling)`, `(culling)`
- `(stats)`, `(player)`, `(bridge)`

### Examples

```
feat(slides): add WiFi slide support
fix(timer): resolve context mismatch in audio sync mode
refactor(parser): simplify simai tokenization logic
perf(culling): implement spatial indexing for notes
docs: update architecture diagram
```

## External References

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed technical guide
- [SIMAI_SYNTAX.md](./SIMAI_SYNTAX.md) - Chart notation reference
- [TEST_STRATEGY.md](./TEST_STRATEGY.md) - Testing approach

## Migration Notes

**From Next.js to TanStack Start:**

- `app/*` → `src/routes/*`
- `app/layout.tsx` → `src/routes/__root.tsx`
- No `use client` directives (all client-side)
- No `metadata` exports (use `head()` in routes)
