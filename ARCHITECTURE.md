# Architecture Documentation

This document provides a technical overview of the mai-web-player codebase for developers and LLM agents working on the project.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                   (TanStack Start + React + Tailwind)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│              (Contexts + State Management)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Timer   │ │  Audio   │ │  Chart   │ │  Player  │       │
│  │ Context  │ │ Context  │ │ Context  │ │ Context  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Processing Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Simai Parser │→│ Chart Data   │→│ Visualization│       │
│  │  (simai.ts)  │  │ (chart.ts)   │  │ (viz.ts)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Rendering Layer                          │
│                    (PixiJS + @pixi/react)                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────────────┐   │
│  │  Tap   │ │  Hold  │ │  Ring  │ │      Slide         │   │
│  │ Renderer│ │Renderer│ │Renderer│ │    (complex)       │   │
│  └────────┘ └────────┘ └────────┘ └────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### 1. Timing System

The visualizer uses a millisecond-based timing system:

```typescript
// Current playback time in milliseconds
type TimeMs = number;

// Notes have hit times calculated from BPM and beat positions
interface NoteTiming {
  hitTime: number; // When note reaches judgment ring (ms)
  startTime: number; // When note appears on screen (ms)
  duration?: number; // For holds/slides (ms)
}
```

**Key Insight**: All chart data starts as "beat-based" (musical notation) and is converted to "time-based" (milliseconds) for rendering.

### 2. Coordinate System

The visualizer uses a polar coordinate system centered on the screen:

```
                    Y-
                    │
               ⑧    │    ①
                 ╲  │  ╱
            ⑦ ──────┼────── ②
                    │
            ⑥ ──────┼────── ③
                 ╱  │  ╲
               ⑤    │    ④
                    │
                    Y+

        ←─────────── X+ ───────────→
```

- **Center**: `(0, 0)` in local coordinates
- **Judgment Ring**: Circular border at configurable radius
- **Lanes**: 8 positions at 45° intervals (0°, 45°, 90°, etc.)

**Lane Position Calculation**:

```typescript
// From utils/lane.ts
function getLanePosition(lane: 1-8, radius: number): [x, y] {
  const angle = (lane - 1) * 45° - 90°;  // 1 is at 12 o'clock
  return [cos(angle) * radius, sin(angle) * radius];
}
```

### 3. Note Lifecycle

```
Creation → Spawn → Travel → Hit → (Hold/Slide continues) → Release
   │         │        │      │            │                │
   │         │        │      │            │                └── Hold/Slide end
   │         │        │      │            └── Hold: wait for release
   │         │        │      │               Slide: star travels path
   │         │        │      └── Note reaches judgment ring
   │         │        └── Note moves from outer to inner radius
   │         └── Note becomes visible
   └── Note created from chart data
```

**Travel Animation**:

- Notes spawn at `hitTime - noteDuration` (e.g., 1000ms before hit)
- Move from outer radius toward judgment ring
- Hit the ring exactly at `hitTime`

## Data Flow

### Step 1: Parsing (simai.ts)

**Input**: Raw simai string

```
(120){4}
1,2,1h[4:1],1-5[4:1],
E
```

**Process**:

1. Split by commas
2. Parse timing directives `(BPM){division}`
3. Parse note syntax with regex patterns
4. Calculate beat positions

**Output**: `Chart` object (beat-based)

```typescript
interface Chart {
  items: ChartItem[]; // Sorted by beat position
}

interface ChartItem {
  time: BeatTime; // { beat: number, division: number }
  notes: NoteData[];
}
```

### Step 2: Visualization Conversion (visualization.ts)

**Process**:

1. Convert beat positions to milliseconds using BPM
2. Calculate `hitTime`, `startTime`, `duration` for each note
3. Group notes by lane for efficient rendering

**Output**: `VisualizationData` (time-based, ready for rendering)

```typescript
interface VisualizationData {
  items: VisualizationItem[];
  duration: number; // Total chart duration
}
```

### Step 3: Rendering (view components)

**Process**:

1. Subscribe to `TimerContext` for current time
2. Calculate progress: `(hitTime - currentTime) / noteDuration`
3. Map progress to position (outer radius → judgment ring)
4. Render with PixiJS graphics

## Key Files and Their Roles

### Data Layer (`src/lib/`)

| File               | Purpose          | Key Exports                                   |
| ------------------ | ---------------- | --------------------------------------------- |
| `chart.ts`         | Type definitions | `Chart`, `ChartItem`, `NoteData`, `SlideType` |
| `simai.ts`         | Simai parser     | `parseSimaiChart()`, regex patterns           |
| `visualization.ts` | Time conversion  | `convertChartVisualizationData()`             |

**Parser Regex Patterns** (in `simai.ts`):

```typescript
const timeSignatureExp = /\((\d+(?:\.\d+)?)\)\{(\d+)\}/;
const noteExp = /([1-8])([bx$@]?)/;
const holdExp = /([1-8])h\[(\d+):(\d+)\]/;
const slideExp = /([1-8])([-<>pq^vVsz]|pp|qq)([1-8])([1-8]?)\[(\d+):(\d+)\]/;
```

### Context Layer (`src/contexts/`)

| File         | Purpose       | Key Exports                              |
| ------------ | ------------- | ---------------------------------------- |
| `timer.tsx`  | Playback time | `TimerContext`, `TimeControlContext`     |
| `audio.tsx`  | Audio sync    | `AudioContext`, `AudioTimerProvider`     |
| `chart.ts`   | Chart data    | `ChartContext`                           |
| `player.ts`  | Visual config | `PlayerContext` (radius, duration, etc.) |
| `bridge.tsx` | Pixi bridge   | `ContextBridge`                          |

**Audio Sync** (`audio.tsx`):

```typescript
useTick(() => {
  if (!isPlaying) return;
  const time = (music?.seek() ?? 0) - offset;
  setTime(time * 1000);
});
```

**Why Context Bridge?**
Pixi's `<Stage>` runs in a separate React tree. `ContextBridge` forwards contexts into the Pixi tree.

### View Layer (`src/components/view/`)

| File              | Renders       | Key Feature                        |
| ----------------- | ------------- | ---------------------------------- |
| `tap.tsx`         | Tap notes     | Pink/yellow circles, lane movement |
| `hold.tsx`        | Hold notes    | Hexagons with duration             |
| `ring.tsx`        | Judgment ring | White circle with touch points     |
| `slide/slide.tsx` | Slide paths   | SVG path-based rendering           |
| `slide/star.tsx`  | Slide stars   | Blue stars at slide start          |

**Lane Movement Hook** (`hooks/lane.ts`):

```typescript
function useLaneMovement(hitTime: number) {
  const currentTime = useContext(TimerContext);
  const timeUntilHit = hitTime - currentTime;
  const progress = 1 - timeUntilHit / NOTE_DURATION;
  const position = lerp(OUTER_RADIUS, INNER_RADIUS, progress);
  return position;
}
```

### Animation Layer (`src/hooks/`)

| File             | Purpose                   |
| ---------------- | ------------------------- |
| `lane.ts`        | Note position calculation |
| `timer-tween.ts` | Time-based interpolation  |

## Slide Rendering Architecture

Slides are the most complex notes. Here's how they work:

### Path Resolution

**SVG Path Approach**:

1. Paths are defined as SVG in `slide/slide-paths.tsx`
2. At runtime, SVG is queried from DOM
3. Path data is extracted and converted to Pixi graphics

**Why SVG?**:

- Easy to visualize and edit
- Supports complex curves
- Can be mirrored for different directions

### Slide Types and Their SVG Paths

| Type       | Symbol    | Path Description            |
| ---------- | --------- | --------------------------- |
| Straight   | `-`       | Line from start to end      |
| Circle CW  | `>`       | Arc clockwise around center |
| Circle CCW | `<`       | Arc counter-clockwise       |
| U-shape    | `p`/`q`   | Arc through center          |
| CUP        | `pp`/`qq` | Large arc around outer ring |
| Thunder    | `s`/`z`   | Lightning bolt segments     |
| V-shape    | `v`       | Line to center, then to end |
| L-shape    | `V`       | Two connected lines         |

### Mirroring Logic

Most slide paths are defined for one orientation and mirrored:

```typescript
// Example: Circle from 1 to 5 (CW)
// Lane positions: 1→2→3→4→5 (clockwise)
// SVG path is defined from lane 1
// For other start positions, rotate the coordinate system

function mirrorPath(path: Path, startLane: number, endLane: number): Path {
  // Calculate rotation angle based on start lane
  const rotation = (startLane - 1) * 45°;
  return rotatePath(path, rotation);
}
```

## Adding New Features

### Adding a New Note Type

1. **Update Types** (`data/chart.ts`):

```typescript
type NoteType = "tap" | "hold" | "slide" | "newtype";

interface NewTypeNote {
  type: "newtype";
  // ... properties
}
```

2. **Update Parser** (`data/simai.ts`):

```typescript
const newtypeExp = /...regex pattern.../;
// Add to parseSimaiChart switch/case
```

3. **Update Visualization** (`data/visualization.ts`):

```typescript
// Add conversion logic in convertChartVisualizationData
```

4. **Create Renderer** (`view/newtype.tsx`):

```typescript
const NewTypeView = ({ note }: { note: NewTypeNoteData }) => {
  const position = useLaneMovement(note.hitTime);
  // Render with Pixi
};
```

5. **Register in Player** (`player.tsx`):

```typescript
// Add to the render loop
```

### Adding a New Slide Type

1. **Add SVG Path** (`view/slide/slide-paths.tsx`):

```typescript
<path id="slide-newtype" d="M... C... L..." />
```

2. **Update Slide Type Enum** (`data/chart.ts`):

```typescript
type SlideType = ... | 'NewType';
```

3. **Update Parser** (`data/simai.ts`):

```typescript
// Add symbol to slideExp regex
const slideExp = /...|newtype|.../;
// Add to convertSlideType function
```

4. **Update Path Resolution** (`view/slide/slide-path.hook.ts`):

```typescript
// Add case for new type
```

## Performance Considerations

### Optimization Strategies

1. **Time-based Culling**: Only render notes within `[currentTime - noteDuration, currentTime + noteDuration]`

2. **Lane Grouping**: Notes grouped by lane for batch processing

3. **Pixi Optimization**:
   - Use `useTick` for animation (RAF-based)
   - Reuse graphics objects when possible
   - Avoid creating new objects in render loop

4. **Memoization**: Expensive calculations cached with `useMemo`

### Current Limitations

- No object pooling (Pixi sprites created/destroyed)
- All notes processed every frame (could use spatial indexing)
- No web workers for parsing (large charts block main thread)

## Debugging Tips

### Enable Debug Mode

Add to player context or use React DevTools to inspect:

- Current time
- Active notes
- Parsed chart data

### Common Issues

| Issue               | Cause              | Solution                    |
| ------------------- | ------------------ | --------------------------- |
| Notes not appearing | Timing off         | Check `hitTime` calculation |
| Slides wrong shape  | Path mirroring     | Verify rotation calculation |
| Audio desync        | Browser throttling | Check `useTick` behavior    |
| Lag with many notes | Too many renders   | Implement culling           |

## Testing Changes

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/lib/__tests__/chart.test.ts

# Update snapshots
bun test --update-snapshots

# Run with coverage
bun test --coverage
```

### Test Structure

Tests live in `src/lib/__tests__/` alongside the modules they test:

| Test File | Tests |
|-----------|-------|
| `chart.test.ts` | Type definitions and validation |
| `simai.test.ts` | Parser output and edge cases |
| `visualization.test.ts` | Time conversion |
| `utils.test.ts` | Utility functions |
| `error-handling.test.ts` | Error cases |

### Test Helpers

Available in `src/lib/__tests__/helpers.ts`:

- `expectValidChart(result)` - Validates chart structure
- `extractNotes(result)` - Gets all notes from parsed chart
- `findFirstNoteOfType(result, type)` - Finds first note of type

Fixtures in `src/lib/__tests__/fixtures.ts` provide common test charts.

## References

- [PixiJS v7 Docs](https://pixijs.download/release/docs/index.html)
- [@pixi/react Docs](https://pixijs.io/pixi-react/)
- [Howler.js Docs](https://github.com/goldfire/howler.js#documentation)
- [Simai Notation](../SIMAI_SYNTAX.md)
