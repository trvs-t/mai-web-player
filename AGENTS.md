# Mai Web Player - Knowledge Base

**Generated**: 2026-02-17
**Project**: maimai chart visualizer (Next.js + PixiJS)

## OVERVIEW

Web-based chart visualizer for maimai rhythm game. Renders gameplay from simai notation with synchronized audio.

## STRUCTURE

```
.
├── app/                    # Next.js App Router
│   ├── player/            # Main visualizer (COMPLEX)
│   │   ├── context/       # React contexts (timer, audio, chart, player)
│   │   ├── data/          # Simai parser + types
│   │   ├── view/          # PixiJS rendering components
│   │   └── animation/     # Animation hooks
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── utils/                 # Shared utilities
├── public/                # Static assets
└── docs/                  # SIMAI_SYNTAX.md, ARCHITECTURE.md
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add note type | `app/player/data/chart.ts` → `simai.ts` → `view/` | See ARCHITECTURE.md |
| Fix rendering | `app/player/view/*.tsx` | PixiJS components |
| Timing issues | `app/player/context/timer.tsx` | ms-based system |
| Parser bug | `app/player/data/simai.ts` | Regex patterns |
| New slide type | `view/slide/slide-paths.tsx` | SVG path + type |

## COMMANDS

```bash
# Dev (port 3001 with Turbo)
npm run dev

# Build & lint
npm run build
npm run lint

# Test (Bun test runner)
npm run test
npm run test:watch
```

## CONVENTIONS

- **Contexts**: Separate files per domain (timer.tsx, audio.tsx, chart.ts)
- **Naming**: kebab-case files, PascalCase components
- **Imports**: Use `@/` path alias for project root
- **Types**: Strict TypeScript, interfaces in data/chart.ts

## ARCHITECTURE NOTES

- **Timing**: Millisecond-based (converted from beats via BPM)
- **Coordinates**: Polar system centered on screen (8 lanes at 45°)
- **Rendering**: PixiJS in separate React tree via ContextBridge
- **Data flow**: simai string → Chart → VisualizationData → render

## TESTS

- Bun test runner
- Files: `**/__tests__/*.test.ts`
- 6 test files in `app/player/` subdirs

## ANTI-PATTERNS

- Don't suppress types with `as any` or `@ts-ignore`
- Don't create Pixi objects in render loop (reuse)
- Don't use pages router patterns (App Router only)

## EXTERNAL DOCS

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed technical guide
- [SIMAI_SYNTAX.md](./SIMAI_SYNTAX.md) - Notation reference
