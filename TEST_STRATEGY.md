# Test Strategy: Timer-Animation Synchronization

## Problem Statement

The timer plays but the canvas animation doesn't update because the `TimerContext` is not bridged through the Pixi Stage's React tree.

## Architecture

```
TimerProvider (provides TimerContext)
├── TimerProviderSelector
│   ├── FreeRunTimerProvider (provides updated TimerContext)
│   │   ├── BridgedStage (creates new React tree via Pixi Stage)
│   │   │   └── Player (tries to read TimerContext - FAILS, gets stale context)
│   │   └── TimerControls (reads TimerContext correctly)
```

## Test Strategy

### 1. Unit Tests for Context Providers

**File**: `src/contexts/__tests__/audio.test.tsx`

**Test Cases**:

- `FreeRunTimerProvider` should update `TimerContext.time` when playing
- `AudioTimerProvider` should sync time with audio playback
- `TimerContext` values should be consistent across re-renders

### 2. Integration Tests for BridgedStage

**File**: `src/contexts/__tests__/bridge.test.tsx`

**Test Cases**:

- All contexts (`TimerContext`, `TimeControlContext`, `PlayerContext`, `ChartContext`, `AudioContext`) should be accessible inside `BridgedStage`
- Context updates outside should propagate inside `BridgedStage`
- Multiple context consumers inside Stage should receive same values

### 3. Component Tests for Player

**File**: `src/components/__tests__/player.test.tsx`

**Test Cases**:

- `Player` should re-render when `TimerContext.time` changes
- Notes should become visible when time approaches their hit time
- Animation should progress smoothly (not skip frames)

### 4. E2E Tests for Full Playback

**File**: `tests/player.spec.ts` (Playwright)

**Test Cases**:

- Timer display and canvas animation should stay in sync
- Clicking Play should start both timer and animation
- Notes should move toward the ring as time progresses
- Pausing should freeze both timer and animation

## Regression Prevention

### Automated Tests

1. **Pre-commit hook**: Run unit tests for timer contexts
2. **CI/CD**: Run full Playwright E2E suite on PRs
3. **Visual regression**: Capture canvas screenshots and compare

### Code Patterns

1. **Context Bridge Checklist**: When adding new contexts, must add to `BridgedStage`
2. **Type Safety**: Export context type definitions and verify with TypeScript
3. **Documentation**: Add architecture diagram to AGENTS.md

## Implementation Plan

1. Write unit tests for context bridging (fails initially)
2. Fix `bridge.tsx` to include `TimerContext` and `TimeControlContext`
3. Verify all tests pass
4. Add E2E test with screenshot comparison
5. Update documentation
