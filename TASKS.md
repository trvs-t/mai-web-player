# Project Tasks

This document tracks planned features and improvements for the mai-web-player project. Tasks are organized by **dependency level** (foundational → dependent) and **importance** (critical → nice-to-have).

## Legend

- **Priority**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- **Status**: ⏳ Not Started / 🔄 In Progress / ✅ Complete / 🚧 Blocked
- **Dependencies**: List of tasks that must be completed first

---

## Tier 1: Foundational (No Dependencies)

These tasks provide core infrastructure needed by other features.

### 1. Audio-Less Chart Playback Mode

**Priority**: 🔴 Critical  
**Status**: ✅ Complete  
**Dependencies**: None  
**Estimated Effort**: Medium

**Description**:  
Enable chart visualization without requiring an audio file. This is essential for chart editing workflows where the charter wants to quickly preview patterns without uploading music.

**Implementation Details**:

- Add a toggle/button to switch between "audio-synced" and "free-run" modes
- In free-run mode, use a simple `setInterval` or `requestAnimationFrame` timer instead of Howler's `seek()`
- Maintain the same `TimerContext` interface so components don't need changes
- Add adjustable playback speed (0.25x, 0.5x, 1x, 2x) for detailed editing
- Show a metronome beat indicator when in audio-less mode

**Acceptance Criteria**:

- [x] Player works without audio file upload
- [x] Playback controls (play/pause/seek) function normally
- [x] Visual metronome shows beat numbers
- [x] Speed control affects both visual and timing
- [x] Mode can be toggled mid-session

**Files Modified**:

- `src/contexts/audio.tsx` - Add FreeRunTimerProvider with requestAnimationFrame
- `src/contexts/timer.tsx` - Add TimerMode and PlaybackSpeed types
- `src/components/controls.tsx` - Add mode toggle and speed control UI
- `src/routes/player.tsx` - Integrate both timer providers
- `src/components/view/metronome.tsx` - Create metronome component

---

### 2. Chart Metadata Support

**Priority**: 🟠 High  
**Status**: ✅ Complete  
**Dependencies**: None  
**Estimated Effort**: Low

**Description**:  
Parse and display chart metadata (title, artist, BPM, difficulty, charter name) from simai comments or a separate header format. Currently charts are anonymous and lack context.

**Implementation Details**:

- Support simai header format (common in the community):
  ```
  &title=Song Title
  &artist=Artist Name
  &bpm=150
  &charter=Your Name
  &difficulty=13+
  ```
- Parse from comments in simai: `# TITLE: My Song`
- Store metadata in `Chart` type
- Display in a collapsible info panel
- Support exporting metadata back to simai format
- Added BPM fallback in player components

**Acceptance Criteria**:

- [x] Parser extracts metadata from simai comments/headers
- [x] Metadata displayed in UI (title, artist, BPM, charter, difficulty)
- [x] Editable metadata fields in editor
- [x] Metadata persisted when saving/exporting

**Files Modified**:

- `src/lib/chart.ts` - Add metadata types
- `src/lib/simai.ts` - Parse header comments, export metadata
- `src/routes/player.tsx` - Add metadata panel UI
- `src/contexts/audio.tsx` - BPM fallback
- `src/lib/visualization.ts` - BPM fallback
- `src/components/metadata-panel.tsx` - New component

---

### 3. Enhanced Parser Error Handling

**Priority**: 🟠 High  
**Status**: ✅ Complete  
**Dependencies**: None  
**Estimated Effort**: Medium

**Description**:  
Improve the simai parser to provide helpful error messages with line/column information when syntax errors occur. Currently, invalid syntax often fails silently or with cryptic errors.

**Implementation Details**:

- Track line and column numbers during parsing
- Create custom error types: `SimaiParseError` with context
- Validate syntax before attempting to parse
- Provide suggestions for common mistakes (e.g., "Did you forget a comma?")
- Display errors inline in the editor with line highlighting
- Graceful degradation: skip invalid notes, continue parsing rest of chart

**Acceptance Criteria**:

- [x] Parser reports line/column for syntax errors
- [x] Error messages are human-readable
- [x] Common mistakes have helpful suggestions
- [x] Invalid notes don't crash the entire parser
- [x] Editor shows error indicators on problematic lines

**Files Modified**:

- `src/lib/simai.ts` - Added `SimaiParseError` class, error tracking context, validation with suggestions
- `src/routes/player.tsx` - Added error display UI with severity-based styling
- `src/lib/__tests__/error-handling.test.ts` - Added comprehensive test coverage (47 tests)

---

### 4. Time Signature and Measure Display

**Priority**: 🟡 Medium  
**Status**: ⏳ Not Started  
**Dependencies**: None  
**Estimated Effort**: Low

**Description**:  
Add visual measure/beat markers to help charters understand the musical structure. Display current measure and beat during playback.

**Implementation Details**:

- Calculate measure boundaries from time signature changes
- Add a timeline scrubber showing measures and beats
- Display current measure:beat in controls (e.g., "M12 B3")
- Visual beat markers on the ring or as a timeline overlay
- Optional: grid lines at beat divisions

**Acceptance Criteria**:

- [ ] Timeline shows measure numbers
- [ ] Current measure:beat displayed during playback
- [ ] Visual beat markers (subtle)
- [ ] Works with changing time signatures

**Files to Modify**:

- `src/lib/visualization.ts` - Calculate measure boundaries
- `src/components/controls.tsx` - Add measure display
- `src/components/view/` - Optional beat markers

---

## Tier 2: Dependent on Tier 1

These features build on foundational work from Tier 1.

### 5. Touch Note Support

**Priority**: 🟠 High  
**Status**: ⏳ Not Started  
**Dependencies**: Task #4 (Time Signatures - for positioning), Task #2 (Metadata - optional)  
**Estimated Effort**: High

**Description**:  
Implement TOUCH and TOUCH HOLD notes that appear on the screen's touch sensors (not the outer ring). This expands chart support to maimai でらっくす charts.

**Implementation Details**:

- **Sensor Layout**: Implement 34 touch sensors (A1-8, B1-8, C, D1-8, E1-8)
- **Coordinate System**: Create a new coordinate space for sensors between center and ring
- **TOUCH Rendering**: Small circular notes appearing on sensor locations
- **TOUCH HOLD**: Expanding/shrinking circles or bars for duration
- **Firework Effect**: Rainbow burst animation when TOUCH with `f` modifier is hit
- **Parser**: Add support for `A1`, `B5`, `C`, `D3`, `E7`, `Ch[4:1]`, etc.
- **Visual Design**: Semi-transparent touch area overlay showing sensor positions

**Acceptance Criteria**:

- [ ] Parser supports A, B, C, D, E sensor notation
- [ ] TOUCH notes render at correct sensor positions
- [ ] TOUCH HOLD notes show duration visually
- [ ] Firework effect (`f` modifier) implemented
- [ ] Optional: Touch sensor overlay toggle

**Files to Modify**:

- `src/lib/chart.ts` - Add TOUCH types
- `src/lib/simai.ts` - Parse touch syntax
- `src/components/view/touch.tsx` - New renderer (create)
- `src/components/view/touch-hold.tsx` - New renderer (create)
- `src/components/player.tsx` - Include touch renderers
- `utils/sensor.ts` - New: Sensor coordinate calculations

---

### 6. WiFi Slide Support

**Priority**: 🟡 Medium  
**Status**: ⏳ Not Started  
**Dependencies**: None (but benefits from Task #3 Error Handling)  
**Estimated Effort**: Medium

**Description**:  
Add support for WiFi slides (`w` type) - fan-shaped slides that cover 3 endpoints from a single start point. These are common in advanced charts.

**Implementation Details**:

- **Shape**: Fan/wedge covering 3 lanes from one start point
- **Constraint**: Endpoints must be diagonal (e.g., start 1 → ends 4, 5, 6)
- **SVG Path**: Create fan-shaped path in `slide-paths.tsx`
- **Parser**: Add `w` to slide regex, validate endpoint constraints
- **Mirroring**: WiFi slides can start from any lane, mirror accordingly
- **Visual**: Large sweeping arc covering multiple lanes

**Syntax Examples**:

```simai
1w4[4:1]    # Fan from 1 covering lanes 4, 5, 6
3w6[8:3]    # Fan from 3 covering lanes 6, 7, 8
```

**Acceptance Criteria**:

- [ ] Parser validates WiFi syntax (correct endpoints)
- [ ] WiFi slides render as fan shape
- [ ] Animation covers all 3 endpoints simultaneously
- [ ] Works with EACH and same-origin slides

**Files to Modify**:

- `src/lib/chart.ts` - Add 'WiFi' to SlideType
- `src/lib/simai.ts` - Add 'w' parsing and validation
- `src/components/view/slide/slide-paths.tsx` - Add WiFi SVG path
- `src/components/view/slide/slide-path.hook.ts` - Add WiFi path resolution

---

### 7. Slide Star Visibility Modifiers

**Priority**: 🟢 Low  
**Status**: ⏳ Not Started  
**Dependencies**: None  
**Estimated Effort**: Low

**Description**:  
Support `?` and `!` modifiers for slide star visibility (defined in simai spec but not implemented).

**Implementation Details**:

- **`?` Modifier**: Star TAP fades in instead of appearing instantly (no star shape at start)
- **`!` Modifier**: Star TAP invisible, star appears only when movement starts
- **Use Cases**: Text art charts (`?`), continuous writing (`!`)
- **Parser**: Handle `?` and `!` before slide notation
- **Renderer**: Conditionally skip star rendering or change fade behavior

**Syntax Examples**:

```simai
1?-5[4:1]   # Fade-in star TAP at start of slide
1!-5[4:1]   # No star TAP, star appears on movement
```

**Acceptance Criteria**:

- [ ] Parser recognizes `?` and `!` modifiers
- [ ] `?`: Star fades in over time
- [ ] `!`: Star invisible until movement
- [ ] Slide arrow/path still visible in both cases

**Files to Modify**:

- `src/lib/chart.ts` - Add visibility field to SlideNote
- `src/lib/simai.ts` - Parse modifiers
- `src/components/view/slide/star.tsx` - Handle visibility modes

---

## Tier 3: Performance & Polish

Enhancements that improve user experience but aren't required for core functionality.

### 8. Note Culling Optimization

**Priority**: 🟡 Medium  
**Status**: ⏳ Not Started  
**Dependencies**: None  
**Estimated Effort**: Medium

**Description**:  
Optimize rendering performance by only processing notes within the visible time window. Currently all notes are iterated every frame, which becomes slow with dense charts.

**Implementation Details**:

- **Culling Window**: Only render notes where `currentTime ± noteDuration`
- **Spatial Indexing**: Use a time-sorted array with binary search to find visible range
- **Virtualization**: Don't create Pixi objects for off-screen notes
- **Lazy Loading**: Parse chart progressively for very large charts
- **Target**: Maintain 60fps with 1000+ note charts

**Acceptance Criteria**:

- [ ] Only visible notes are rendered
- [ ] 60fps maintained with complex charts
- [ ] Smooth scrolling through long charts
- [ ] Memory usage stable over time

**Files to Modify**:

- `src/lib/visualization.ts` - Add time-sorted index
- `src/components/player.tsx` - Implement culling logic
- `src/components/view/` - Components handle missing data gracefully

---

### 9. Chart Export and Sharing

**Priority**: 🟡 Medium  
**Status**: ⏳ Not Started  
**Dependencies**: Task #2 (Metadata Support)  
**Estimated Effort**: Low

**Description**:  
Allow users to export charts as files or shareable links. Currently charts exist only in the browser session.

**Implementation Details**:

- **Export to File**: Download as `.txt` or `.simai` file
- **Copy to Clipboard**: Copy simai text with one click
- **Shareable URL**: Encode chart data in URL hash for sharing
- **Import**: Drag-and-drop file upload
- **Auto-save**: Save to localStorage to prevent accidental loss

**Acceptance Criteria**:

- [ ] Export button downloads chart as file
- [ ] Copy button copies simai text
- [ ] URL contains encoded chart data
- [ ] Loading URL restores chart
- [ ] Auto-save to localStorage every 5 seconds

**Files to Modify**:

- `src/routes/player.tsx` - Add export/import UI
- `src/contexts/chart.ts` - Add import/export methods
- New utility: `utils/export.ts` - Encoding/decoding logic

---

### 10. Advanced Playback Controls

**Priority**: 🟢 Low  
**Status**: ⏳ Not Started  
**Dependencies**: Task #1 (Audio-Less Mode)  
**Estimated Effort**: Medium

**Description**:  
Enhanced playback controls for detailed chart review: bookmarks, loop sections, frame stepping.

**Implementation Details**:

- **Bookmarks**: Set markers at important sections, jump between them
- **Loop Section**: Select start/end points, loop continuously
- **Frame Step**: Advance by single frames (1/60s) for precise timing review
- **Slow Motion**: Playback at 0.1x, 0.25x, 0.5x speed
- **Measure Jump**: Jump to specific measure number
- **Note Countdown**: Show "next note in X beats"

**Acceptance Criteria**:

- [ ] Add/remove bookmarks at current time
- [ ] Bookmark list with click-to-jump
- [ ] Loop mode with draggable range selection
- [ ] Frame step forward/backward buttons
- [ ] Speed control from 0.1x to 2x

**Files to Modify**:

- `src/components/controls.tsx` - New control buttons
- `src/contexts/timer.tsx` - Add bookmark state
- `src/routes/player.tsx` - Bookmark panel UI

---

### 11. Object Pooling for Pixi Objects

**Priority**: 🟢 Low  
**Status**: ⏳ Not Started  
**Dependencies**: None  
**Estimated Effort**: High

**Description**:  
Implement object pooling for Pixi sprites/graphics to reduce GC pressure and improve performance. Currently new objects are created/destroyed frequently.

**Implementation Details**:

- **Pool Manager**: Generic pool for Graphics and Sprite objects
- **Lifecycle**: Acquire from pool → use → return to pool (don't destroy)
- **Pre-warming**: Create initial pool of common note types
- **Growth**: Pool grows dynamically if exhausted
- **Measure**: Profile memory usage before/after

**Acceptance Criteria**:

- [ ] Object pool utility created
- [ ] Note renderers use pooled objects
- [ ] No visible object creation/destruction in performance profiler
- [ ] Reduced GC pauses during playback

**Files to Modify**:

- `src/components/view/` - All renderers use pooling
- New utility: `utils/object-pool.ts`

---

### 12. Chart Statistics and Analysis

**Priority**: 🟢 Low  
**Status**: ⏳ Not Started  
**Dependencies**: Task #2 (Metadata Support)  
**Estimated Effort**: Low

---

### 13. Framework Migration: Next.js → TanStack Start

**Priority**: 🟠 High  
**Status**: ✅ Complete  
**Dependencies**: None  
**Estimated Effort**: Medium

**Description**:  
Migrated the project from Next.js 13 to TanStack Start with Vite. This simplifies the architecture for a client-side only visualizer tool, removes Server Component complexity, and provides faster dev server with Vite.

**Implementation Details**:

- Replaced Next.js with TanStack Start (React 18 + Vite)
- Migrated from App Router to TanStack Router (file-based routing)
- Moved all source files from `app/player/*` to `src/*` structure:
  - `app/player/context/*` → `src/contexts/*`
  - `app/player/data/*` → `src/lib/*`
  - `app/player/view/*` → `src/components/view/*`
  - `app/player/animation/*` → `src/hooks/*`
  - `app/player/page.tsx` → `src/routes/player.tsx`
- Removed `use client` directives (no longer needed)
- Updated build tooling from Next.js to Vite
- Migrated linting from ESLint to oxlint (Rust-based, 50-100x faster)
- Migrated formatting from Prettier to oxfmt (Rust-based, 30x faster)
- Updated all documentation (AGENTS.md, ARCHITECTURE.md, README.md)
- Fixed strict TypeScript errors that emerged

**Acceptance Criteria**:

- [x] Next.js fully removed, TanStack Start installed and configured
- [x] All source files moved to `src/` directory structure
- [x] Application builds successfully with Vite
- [x] All core features work correctly (playback, rendering, parsing)
- [x] All 316 tests passing
- [x] Documentation updated to reflect new stack
- [x] oxlint and oxfmt configured and working

**Files Modified**:

- `package.json` - Complete dependency overhaul
- `vite.config.ts` - New Vite configuration
- `src/routes/__root.tsx` - Root route (replaces layout.tsx)
- `src/routes/player.tsx` - Player route (replaces page.tsx)
- `src/routes/index.tsx` - Home route
- `src/router.tsx` - Router configuration
- `src/app.tsx` - Application entry point
- `tsconfig.json` - Updated for Vite
- All source files in `src/` directory
- `.oxlintrc.json` - New linting config
- `.oxfmtrc.jsonc` - New formatting config
- Documentation files (AGENTS.md, ARCHITECTURE.md, README.md)

---

**Description**:  
Display chart statistics: note counts, density graphs, difficulty estimation. Useful for charters to analyze their charts.

**Implementation Details**:

- **Note Counts**: TAP, HOLD, SLIDE, TOUCH breakdown
- **Density Graph**: Notes per second over time (histogram)
- **BPM Changes**: Timeline showing BPM shifts
- **Difficulty Est**: Simple algorithm based on note density and speed
- **Duration**: Total chart length
- **Peak Density**: Most dense section of chart

**Acceptance Criteria**:

- [ ] Panel showing note type counts
- [ ] Density histogram visualization
- [ ] BPM timeline visualization
- [ ] Estimated difficulty level (if possible)
- [ ] Updates in real-time as chart is edited

**Files to Modify**:

- `src/lib/visualization.ts` - Calculate statistics
- `src/routes/player.tsx` - Statistics panel UI

---

## Summary

### Quick Start Roadmap

**For a new contributor, here's the recommended order:**

1. **Week 1**: Tasks #1 (Audio-Less Mode) + #2 (Metadata)
   - Core infrastructure that enables everything else
   - Relatively self-contained

2. **Week 2**: Task #3 (Parser Error Handling)
   - Improves developer experience immediately
   - Makes debugging other features easier

3. **Week 3-4**: Task #5 (Touch Notes)
   - Major feature expansion
   - Requires new coordinate system

4. **Month 2**: Tasks #6, #7, #9, #10
   - Slide features, export, playback controls
   - Polish and usability

5. **Ongoing**: Tasks #8, #11, #12
   - Performance optimizations
   - Nice-to-have features

### Excluded Features (Out of Scope)

The following features are explicitly **not planned** for this web player:

- ❌ **User Input/Judgment**: This is a visualizer, not a playable game
- ❌ **Touch Device Support**: Keyboard/mouse only
- ❌ **Multiplayer**: Single player visualization only
- ❌ **Online Chart Database**: Local files only
- ❌ **Video Export**: Browser limitations
- ❌ **3D Rendering**: 2D visualization only

---

_Last updated: 2024-01-XX_
