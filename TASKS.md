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
- `app/player/context/audio.tsx` - Add FreeRunTimerProvider with requestAnimationFrame
- `app/player/context/timer.tsx` - Add TimerMode and PlaybackSpeed types
- `app/player/controls.tsx` - Add mode toggle and speed control UI
- `app/player/page.tsx` - Integrate both timer providers
- `app/player/view/metronome.tsx` - Create metronome component

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
- `app/player/data/chart.ts` - Add metadata types
- `app/player/data/simai.ts` - Parse header comments, export metadata
- `app/player/page.tsx` - Add metadata panel UI
- `app/player/context/audio.tsx` - BPM fallback
- `app/player/data/visualization.ts` - BPM fallback
- `app/player/components/metadata-panel.tsx` - New component

---

### 3. Enhanced Parser Error Handling
**Priority**: 🟠 High  
**Status**: ⏳ Not Started  
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
- [ ] Parser reports line/column for syntax errors
- [ ] Error messages are human-readable
- [ ] Common mistakes have helpful suggestions
- [ ] Invalid notes don't crash the entire parser
- [ ] Editor shows error indicators on problematic lines

**Files to Modify**:
- `app/player/data/simai.ts` - Add error tracking and messages
- `app/player/page.tsx` - Add error display UI
- `app/globals.css` - Add error highlighting styles

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
- `app/player/data/visualization.ts` - Calculate measure boundaries
- `app/player/controls.tsx` - Add measure display
- `app/player/view/` - Optional beat markers

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
- `app/player/data/chart.ts` - Add TOUCH types
- `app/player/data/simai.ts` - Parse touch syntax
- `app/player/view/touch.tsx` - New renderer (create)
- `app/player/view/touch-hold.tsx` - New renderer (create)
- `app/player/player.tsx` - Include touch renderers
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
- `app/player/data/chart.ts` - Add 'WiFi' to SlideType
- `app/player/data/simai.ts` - Add 'w' parsing and validation
- `app/player/view/slide/slide-paths.tsx` - Add WiFi SVG path
- `app/player/view/slide/slide-path.hook.ts` - Add WiFi path resolution

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
- `app/player/data/chart.ts` - Add visibility field to SlideNote
- `app/player/data/simai.ts` - Parse modifiers
- `app/player/view/slide/star.tsx` - Handle visibility modes

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
- `app/player/data/visualization.ts` - Add time-sorted index
- `app/player/player.tsx` - Implement culling logic
- `app/player/view/` - Components handle missing data gracefully

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
- `app/player/page.tsx` - Add export/import UI
- `app/player/context/chart.ts` - Add import/export methods
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
- `app/player/controls.tsx` - New control buttons
- `app/player/context/timer.tsx` - Add bookmark state
- `app/player/page.tsx` - Bookmark panel UI

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
- `app/player/view/` - All renderers use pooling
- New utility: `utils/object-pool.ts`

---

### 12. Chart Statistics and Analysis
**Priority**: 🟢 Low  
**Status**: ⏳ Not Started  
**Dependencies**: Task #2 (Metadata Support)  
**Estimated Effort**: Low

---

### 13. Dependency Upgrade
**Priority**: 🟠 High  
**Status**: ⏳ Not Started  
**Dependencies**: None  
**Estimated Effort**: Medium

**Description**:  
Upgrade all project dependencies to their latest stable versions to ensure security patches, bug fixes, and access to new features. This includes React, Next.js, Pixi.js, Howler, and all dev dependencies.

**Implementation Details**:
- Run `npm outdated` to identify outdated packages
- Update `package.json` with latest compatible versions
- Address breaking changes in major version updates
- Test all core functionality after upgrades:
  - Chart parsing and rendering
  - Audio playback with Howler
  - Pixi.js graphics rendering
  - UI interactions and state management
- Update TypeScript types if needed
- Verify build process still works

**Acceptance Criteria**:
- [ ] All dependencies updated to latest stable versions
- [ ] No security vulnerabilities (`npm audit` passes)
- [ ] Application builds successfully
- [ ] All core features work correctly (playback, rendering, parsing)
- [ ] No TypeScript errors or warnings
- [ ] No console warnings or errors

**Files to Modify**:
- `package.json` - Update dependency versions
- `package-lock.json` - Regenerated after update
- Address any breaking changes in source files as needed

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
- `app/player/data/visualization.ts` - Calculate statistics
- `app/player/page.tsx` - Statistics panel UI

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

*Last updated: 2024-01-XX*
