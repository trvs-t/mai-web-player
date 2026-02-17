# Mai Web Player - Knowledge Base

**Generated**: 2026-02-17
**Project**: maimai chart visualizer (TanStack Start + Vite + PixiJS)

## OVERVIEW

Web-based chart visualizer for maimai rhythm game. Renders gameplay from simai notation with synchronized audio. Migrated from Next.js to TanStack Start for simpler client-side architecture.

## STRUCTURE

```
.
├── src/
│   ├── routes/          # TanStack Router routes
│   │   ├── __root.tsx   # Root layout with providers
│   │   ├── index.tsx    # Home page
│   │   └── player.tsx   # Main visualizer
│   ├── contexts/        # React contexts (timer, audio, chart, player)
│   ├── components/      # React components
│   │   ├── view/        # PixiJS rendering components
│   │   └── controls.tsx # Playback controls
│   ├── lib/             # Simai parser + types
│   ├── hooks/           # Animation hooks
│   └── app.tsx          # Application entry point
├── utils/               # Shared utilities (lane.ts, svg.ts)
├── public/              # Static assets
└── dist/                # Vite build output
```

## WHERE TO LOOK

| Task           | Location                                             | Notes               |
| -------------- | ---------------------------------------------------- | ------------------- |
| Add note type  | `src/lib/chart.ts` → `simai.ts` → `components/view/` | See ARCHITECTURE.md |
| Fix rendering  | `src/components/view/*.tsx`                          | PixiJS components   |
| Timing issues  | `src/contexts/timer.tsx`                             | ms-based system     |
| Parser bug     | `src/lib/simai.ts`                                   | Regex patterns      |
| New slide type | `components/view/slide/slide-paths.tsx`              | SVG path + type     |
| Route changes  | `src/routes/`                                        | TanStack Router     |

## COMMANDS

```bash
# Dev (port 3001 with Vite)
npm run dev

# Build
npm run build

# Lint with oxlint (Rust-based, fast)
npm run lint
npm run lint:fix

# Format with oxfmt (Prettier-compatible, 30x faster)
npm run format
npm run format:check

# Type check + lint + format check
npm run check

# Test (Bun test runner)
npm run test
npm run test:watch
```

## CONVENTIONS

- **Contexts**: Separate files per domain (timer.tsx, audio.tsx, chart.ts)
- **Naming**: kebab-case files, PascalCase components
- **Imports**: Use `@/` path alias for `src/` directory
- **Types**: Strict TypeScript, interfaces in lib/chart.ts
- **Linting**: oxlint with React/TypeScript plugins
- **Formatting**: oxfmt with 80 char print width, 2-space tabs

## ARCHITECTURE NOTES

- **Timing**: Millisecond-based (converted from beats via BPM)
- **Coordinates**: Polar system centered on screen (8 lanes at 45°)
- **Rendering**: PixiJS in separate React tree via ContextBridge
- **Data flow**: simai string → Chart → VisualizationData → render
- **Router**: TanStack Router with file-based route tree

## TESTS

- Bun test runner
- Files: `src/lib/__tests__/*.test.ts`
- 6 test files in `src/lib/` subdirs

## ANTI-PATTERNS

- Don't suppress types with `as any` or `@ts-ignore`
- Don't create Pixi objects in render loop (reuse)
- Don't use Next.js-specific patterns (this is a Vite SPA)
- Don't mix sync/async in useEffect without cleanup

## EXTERNAL DOCS

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed technical guide
- [SIMAI_SYNTAX.md](./SIMAI_SYNTAX.md) - Notation reference
- [TASKS.md](./TASKS.md) - Project roadmap

## MIGRATION NOTES

**From Next.js to TanStack Start:**

- `app/player/page.tsx` → `src/routes/player.tsx`
- `app/player/context/*` → `src/contexts/*`
- `app/player/data/*` → `src/lib/*`
- `app/player/animation/*` → `src/hooks/*`
- `app/player/view/*` → `src/components/view/*`
- `app/layout.tsx` → `src/routes/__root.tsx`
- No more `use client` directives (all client-side)
- No more `metadata` exports (use `head()` in routes)
