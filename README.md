# Mai Web Player

A web-based chart visualizer for **maimai**, a circular touch-based rhythm game. This project renders maimai gameplay from simai notation with synchronized audio playback.

## Overview

**maimai** is a rhythm game where notes emerge from the center of the screen toward a circular judgment border, synced to music. This visualizer supports:

- **Tap notes** - Simple circular notes hit when they reach the ring
- **Hold notes** - Hexagonal notes held for a duration
- **Slide notes** - Star-shaped notes that follow complex paths around the ring

## Demo

Visit `/player` to access the visualizer interface. You'll find:
- A simai chart editor (textarea)
- Audio file upload
- Playback controls (play, pause, reset)
- Real-time visualization of the chart

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) and navigate to `/player`.

### Example Chart

Try this simple chart in the editor:

```simai
(120){4}
1,2,3,4,5,6,7,8,
1/5,2/6,3/7,4/8,
1-5[4:1],2-6[4:1],
E
```

This creates:
- BPM 120, 4th note division
- Sequential taps on all 8 lanes
- Simultaneous tap pairs (EACH)
- Two straight slides

## Features

### Implemented
- Simai syntax parsing
- Tap, Hold, and Slide note rendering
- Audio synchronization with Howler.js
- Playback controls (play, pause, reset, time seek)
- Real-time note animation with PixiJS

### Note Types Supported
- ✅ Tap notes (including BREAK and EX variants)
- ✅ Hold notes with configurable duration
- ✅ Slide notes:
  - Straight (`-`)
  - Circle clockwise (`>`) and counter-clockwise (`<`)
  - U-shape clockwise (`q`) and counter-clockwise (`p`)
  - CUP clockwise (`qq`) and counter-clockwise (`pp`)
  - Thunder clockwise (`z`) and counter-clockwise (`s`)
  - V-shape (`v`)
  - L-shape (`V`)
  - Auto-direction circle (`^`)
- ✅ EACH notes (simultaneous notes)
- ✅ Same-origin slides (multiple slides from one star)
- ✅ Connected slides (slide chains)

### Not Implemented (Out of Scope)
- Touch/Touch Hold notes
- WiFi slides (`w`)
- User input/judgment
- Score calculation
- Touch sensor visualization

## Documentation

- **[SIMAI_SYNTAX.md](./SIMAI_SYNTAX.md)** - Complete guide to simai notation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and codebase guide

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 13.3.0 | React framework with App Router |
| React | 18.2.0 | UI library |
| TypeScript | 5.0.4 | Type safety |
| PixiJS | 7.2.4 | 2D WebGL rendering |
| @pixi/react | 7.0.3 | React bindings for PixiJS |
| Howler | 2.2.3 | Audio playback |
| Tailwind CSS | 3.3.1 | Styling |

## Project Structure

```
app/
├── player/              # Main visualizer application
│   ├── page.tsx         # Player entry page
│   ├── player.tsx       # Main player component
│   ├── controls.tsx     # Playback controls
│   ├── context/         # React contexts (audio, timer, chart, etc.)
│   ├── data/            # Data models and simai parser
│   ├── view/            # Pixi rendering components
│   └── animation/       # Animation hooks
├── page.tsx             # Home page
└── layout.tsx           # Root layout

utils/                   # Utility functions
public/                  # Static assets
```

## Development

### Available Scripts

```bash
npm run dev      # Start dev server with Turbo (port 3001)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

When adding new features:
1. Check existing patterns in `app/player/view/` for rendering components
2. Update simai parser in `app/player/data/simai.ts` for new syntax
3. Add types to `app/player/data/chart.ts`
4. Update visualization converter in `app/player/data/visualization.ts`

## Resources

- [Simai Notation Wiki (Japanese)](https://w.atwiki.jp/simai/pages/1002.html) - Official simai syntax reference
- [PixiJS Documentation](https://pixijs.download/release/docs/index.html)
- [Next.js Documentation](https://nextjs.org/docs)

## License

This project is for educational purposes. maimai is a trademark of SEGA. Simai notation is credited to Celeca.

## Contributing

Contributions are welcome! Please ensure:
1. Code follows existing TypeScript patterns
2. Components use the established context pattern
3. New note types follow the data -> visualization -> render pipeline
4. Run `npm run lint` before submitting
