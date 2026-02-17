# Player Module - Knowledge Base

**Scope**: Chart visualizer implementation

## OVERVIEW

Core visualizer: parses simai notation → renders notes with PixiJS.

## STRUCTURE

```
player/
├── context/           # State management
│   ├── timer.tsx     # Playback time (ms)
│   ├── audio.tsx     # Howler.js sync
│   ├── chart.ts      # Parsed chart data
│   ├── player.ts     # Visual config (radius, duration)
│   └── bridge.tsx    # Pixi ContextBridge
├── data/             # Data layer
│   ├── chart.ts      # Type definitions
│   ├── simai.ts      # Parser (regex-based)
│   ├── visualization.ts  # Beat → ms conversion
│   └── __tests__/    # Parser tests
├── view/             # Pixi renderers
│   ├── tap.tsx       # Pink/yellow circles
│   ├── hold.tsx      # Hexagonal holds
│   ├── ring.tsx      # Judgment ring
│   ├── metronome.tsx # Beat indicator
│   └── slide/        # Complex slides
│       ├── slide.tsx     # Path rendering
│       ├── star.tsx      # Start star
│       ├── slide-paths.tsx # SVG definitions
│       └── slide-path.hook.ts  # Path resolution
├── animation/        # Animation hooks
│   ├── lane.ts       # Position calculation
│   └── timer-tween.ts # Interpolation
└── components/       # UI components
    └── metadata-panel.tsx
```

## DATA FLOW

```
simai string
    ↓
parseSimai() → Chart (beat-based)
    ↓
convertChartVisualizationData() → VisualizationData (ms-based)
    ↓
Player.tsx renders via contexts
```

## KEY PATTERNS

**Context Usage**:
```tsx
const { time } = useContext(TimerContext);
const position = useLaneMovement(hitTime); // From animation/lane.ts
```

**Pixi Component**:
```tsx
import { Container, Graphics } from "@pixi/react";
// Use useTick() for animation, not setInterval
```

## ADDING NOTES

1. **Type**: `data/chart.ts` - Add to `NoteType`, create interface
2. **Parser**: `data/simai.ts` - Add regex, parse function
3. **Conversion**: `data/visualization.ts` - Add time calculation
4. **Render**: `view/newtype.tsx` - Create Pixi component
5. **Register**: `player.tsx` - Add to switch/case

## ADDING SLIDES

1. `slide-paths.tsx` - Add SVG `<path id="..." d="..." />`
2. `chart.ts` - Add to `SlideType` enum
3. `simai.ts` - Add symbol to `slideExp` regex
4. `slide-path.hook.ts` - Add path resolution case

## TIMING SYSTEM

- All times in **milliseconds**
- Notes spawn at `hitTime - noteDuration`
- `useLaneMovement(hitTime)` calculates position
- Audio sync via `useTick()` polling Howler

## ANTI-PATTERNS

- Don't create Graphics in render loop
- Don't use setState in useTick (use refs)
- Don't forget to filter notes by time window (culling)
- Don't mutate Chart objects (create new)

## TESTING

```bash
bun test app/player/data/__tests__/simai.test.ts
```

Parser tests validate simai → Chart conversion.
