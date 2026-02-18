# SVG Path Mirroring Bug - Visual Explanation

## The Core Issue: Transformation Order

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CORRECT ORDER (Mirror → Rotate)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Step 1: SVG Path (Lane 1 CCW to Lane 5)                                   │
│   ┌─────────────────────────────────────┐                                   │
│   │         Lane 1 (start)              │                                   │
│   │              ●                      │                                   │
│   │           ╱                         │                                   │
│   │         ╱   CCW arc                 │                                   │
│   │       ╱     (curves left)          │                                   │
│   │     ╱                               │                                   │
│   │   ●──────────────●                  │                                   │
│   │ Lane 2          Lane 5 (end)        │                                   │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
│   Step 2: Mirror (Flip X) - Now CW from Lane 1 to Lane 5                    │
│   ┌─────────────────────────────────────┐                                   │
│   │         Lane 1 (start)              │                                   │
│   │              ●                      │                                   │
│   │                ╲                    │                                   │
│   │          CW arc ╲                   │                                   │
│   │    (curves right) ╲                 │                                   │
│   │                    ╲                │                                   │
│   │   ●──────────────●                  │                                   │
│   │ Lane 5          Lane 8              │                                   │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
│   Step 3: Rotate to Lane 2 - Now CW from Lane 2 to Lane 5 ✓                 │
│   ┌─────────────────────────────────────┐                                   │
│   │                                     │                                   │
│   │   ● Lane 5 (end)                    │                                   │
│   │    ╲                                │                                   │
│   │     ╲                               │                                   │
│   │      ╲  CW arc                      │                                   │
│   │       ╲                             │                                   │
│   │        ● Lane 2 (start)              │                                   │
│   │                                     │                                   │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                  BUGGY ORDER (Rotate → Mirror) - CURRENT CODE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Step 1: SVG Path (Lane 1 CCW to Lane 5)                                   │
│   ┌─────────────────────────────────────┐                                   │
│   │         Lane 1 (start)              │                                   │
│   │              ●                      │                                   │
│   │           ╱                         │                                   │
│   │         ╱   CCW arc                 │                                   │
│   │       ╱     (curves left)          │                                   │
│   │     ╱                               │                                   │
│   │   ●──────────────●                  │                                   │
│   │ Lane 2          Lane 5 (end)        │                                   │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
│   Step 2: Rotate to Lane 2 - Now CCW from Lane 2 toward Lane 3             │
│   ┌─────────────────────────────────────┐                                   │
│   │                                     │                                   │
│   │   ● Lane 5                          │                                   │
│   │    ╱                                │                                   │
│   │   ╱                                 │                                   │
│   │  ╱  CCW arc                         │                                   │
│   │ ╱   (curves toward Lane 3)         │                                   │
│   │● Lane 2 (start)                     │                                   │
│   │                                     │                                   │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
│   Step 3: Mirror (Flip X) - WRONG! Starts at Lane 7 instead of Lane 2 ✗      │
│   ┌─────────────────────────────────────┐                                   │
│   │                                     │                                   │
│   │   ● Lane 5 (end)                    │                                   │
│   │    ╱                                │                                   │
│   │     ╲                               │                                   │
│   │      ╲  CW arc                      │                                   │
│   │       ╲                             │                                   │
│   │        ● Lane 7 (WRONG START!)       │                                   │
│   │         (should be Lane 2)           │                                   │
│   └─────────────────────────────────────┘                                   │
│                                                                             │
│   The mirror flips around the rotated coordinate system's Y-axis,           │
│   which is NOT the same as the SVG's Y-axis!                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Why the Bug Happens

### Mathematical Explanation

Transformations are applied as matrix multiplications. The order matters!

**Correct:** `point_final = Rotation × Mirror × point_svg`

**Buggy:** `point_final = Mirror × Rotation × point_svg`

When you rotate first, the coordinate system rotates with it. Then when you mirror (flip x), you're flipping around the **rotated** x-axis, not the original SVG x-axis.

### Concrete Example: 2>5 CW Slide

**Lane positions (degrees):**
- Lane 1: 202.5° (top-left)
- Lane 2: 247.5° (bottom-left)
- Lane 5: 22.5° (top-right)
- Lane 7: 337.5° (bottom-right)

**What should happen:**
1. Start at Lane 2 (247.5°)
2. Curve clockwise through Lanes 1, 8, 7, 6
3. End at Lane 5 (22.5°)

**What actually happens (bug):**
1. Start at Lane 7 (337.5°) ← WRONG!
2. Curve clockwise through Lanes 6, 5
3. End at Lane 5 (22.5°)

The slide is mirrored around the wrong axis, placing the start point at Lane 7 instead of Lane 2.

## The Fix

In `slide-calculations.ts`, change the order:

```typescript
// BEFORE (buggy):
function transformSlidePoint(point, svgCenter, scaleFactor, laneOffsetAngle, mirror) {
  let x = (point[0] - svgCenter) * scaleFactor;
  let y = (point[1] - svgCenter) * scaleFactor;
  
  // Rotate first
  const cos = Math.cos(laneOffsetAngle);
  const sin = Math.sin(laneOffsetAngle);
  x = x * cos - y * sin;
  y = x * sin + y * cos;
  
  // Then mirror (WRONG!)
  if (mirror) x = -x;
  
  return [x, y];
}

// AFTER (fixed):
function transformSlidePoint(point, svgCenter, scaleFactor, laneOffsetAngle, mirror) {
  let x = (point[0] - svgCenter) * scaleFactor;
  let y = (point[1] - svgCenter) * scaleFactor;
  
  // Mirror first (CORRECT!)
  if (mirror) x = -x;
  
  // Then rotate
  const cos = Math.cos(laneOffsetAngle);
  const sin = Math.sin(laneOffsetAngle);
  const rotatedX = x * cos - y * sin;
  const rotatedY = x * sin + y * cos;
  
  return [rotatedX, rotatedY];
}
```

## Impact on slide-path.hook.ts

The hook has a workaround for lower-half lanes (3-6):

```typescript
const isLowerHalf = lane >= 3 && lane <= 6;
const effectiveDirection = isLowerHalf
  ? direction === "cw" ? "ccw" : "cw"
  : direction;
```

This workaround was likely added to compensate for the mirroring bug. After fixing `transformSlidePoint`, this may need to be revisited or removed.

## Test Cases to Verify Fix

1. **2>5 CW Circle**: Should start at Lane 2, curve through Lanes 1-8-7-6, end at Lane 5
2. **3>7 CW Circle**: Should start at Lane 3, curve through Lanes 2-1-8, end at Lane 7
3. **6>2 CW Circle**: Should start at Lane 6, curve through Lanes 5-4-3, end at Lane 2
4. **All CCW slides**: Should continue to work correctly (no mirror applied)

## Summary

| Aspect | Bug | Fix |
|--------|-----|-----|
| Mirror timing | After rotation | Before rotation |
| 2>5 CW result | 7>5 (wrong start) | 2>5 (correct) |
| Affected lanes | All except Lane 1 | All lanes work correctly |
| Code change | Reorder 2 code blocks | Simple and minimal |
