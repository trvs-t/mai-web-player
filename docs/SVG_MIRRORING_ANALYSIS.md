# SVG Path Mirroring Analysis for Circle Slides

## Executive Summary

**The Bug**: The `transformSlidePoint` function in `slide-calculations.ts` applies the mirror flip **after** lane rotation, when it should apply it **before**. This causes clockwise slides starting from lanes other than lane 1 to render incorrectly (e.g., a 2>5 slide appears as 7>2).

## The Problem

### Current (Incorrect) Order in `transformSlidePoint`:

```typescript
export function transformSlidePoint(
  point: [number, number],
  svgCenter: number,
  scaleFactor: number,
  laneOffsetAngle: number,
  mirror: boolean,
): [number, number] {
  // 1. Transform from SVG to canvas coordinates
  let x = (point[0] - svgCenter) * scaleFactor;
  let y = (point[1] - svgCenter) * scaleFactor;

  // 2. Apply lane rotation
  const cos = Math.cos(laneOffsetAngle);
  const sin = Math.sin(laneOffsetAngle);
  const rotatedX = x * cos - y * sin;
  const rotatedY = x * sin + y * cos;
  x = rotatedX;
  y = rotatedY;

  // 3. Apply mirror flip for clockwise slides (BUG: happens AFTER rotation)
  if (mirror) {
    x = -x;
  }

  return [x, y];
}
```

### Why This Is Wrong

The SVG paths are designed for **lane 1** (starting at top-left of the circle). When we want a clockwise slide:

1. **Correct approach**: Mirror the path around the SVG's vertical axis (y-axis), THEN rotate to the target lane
2. **Current approach**: Rotate to the target lane first, THEN mirror around the rotated coordinate system's x-axis

When you rotate first and then mirror, you're mirroring around the wrong axis! The mirror should happen in the original SVG coordinate space.

## Example: 2>5 Circle Slide (Clockwise)

### Lane Positions (in radians)

- Lane 1: 9/16 × 2π ≈ 3.53 rad (202.5°) - top-left
- Lane 2: 11/16 × 2π ≈ 4.32 rad (247.5°) - bottom-left
- Lane 5: 17/16 × 2π ≈ 6.68 rad (382.5° = 22.5°) - top-right
- Lane 7: 15/16 × 2π ≈ 5.89 rad (337.5°) - bottom-right

### SVG Path Design

- `Circle_x5F_1` is a CCW arc from lane 1 curving toward lanes 2, 3, 4, 5, 6, 7
- For a CW slide from lane 1 to lane 5, we mirror this path (flip x coordinates)

### Current Buggy Flow for Lane 2 CW Slide:

1. **SVG coordinates**: Path starts at lane 1 position (top-left)
2. **Rotate by laneOffsetAngle** (lane 2 - lane 1 = 45°):
   - Path now starts at lane 2 position (bottom-left)
   - Path curves toward lanes 3, 4, 5 (CCW direction from lane 2)
3. **Mirror (flip x)**:
   - Now the path curves toward lanes 1, 8, 7 (CW direction from lane 2)
   - **But wait!** The path is now starting from the wrong side!
   - After rotation to lane 2, flipping x mirrors around the vertical axis through lane 2
   - This places the start point at lane 7 position instead of lane 2!

### Correct Flow for Lane 2 CW Slide:

1. **SVG coordinates**: Path starts at lane 1 position
2. **Mirror (flip x) in SVG space**:
   - Path now curves CW from lane 1 toward lanes 8, 7, 6, 5
   - Start point is still at lane 1 position (just mirrored)
3. **Rotate by laneOffsetAngle** (45°):
   - Path rotates to start at lane 2 position
   - Path now curves CW from lane 2 toward lanes 1, 8, 7, 6, 5
   - **Result**: Correct 2>5 CW slide!

## The Fix

The mirror operation must happen **before** the lane rotation:

```typescript
export function transformSlidePoint(
  point: [number, number],
  svgCenter: number,
  scaleFactor: number,
  laneOffsetAngle: number,
  mirror: boolean,
): [number, number] {
  // 1. Transform from SVG to canvas coordinates
  let x = (point[0] - svgCenter) * scaleFactor;
  let y = (point[1] - svgCenter) * scaleFactor;

  // 2. Apply mirror flip for clockwise slides (BEFORE rotation)
  if (mirror) {
    x = -x;
  }

  // 3. Apply lane rotation
  const cos = Math.cos(laneOffsetAngle);
  const sin = Math.sin(laneOffsetAngle);
  const rotatedX = x * cos - y * sin;
  const rotatedY = x * sin + y * cos;

  return [rotatedX, rotatedY];
}
```

## Mathematical Explanation

### Transformation Order Matters

Matrix multiplication is not commutative: A × B ≠ B × A

**Current (wrong):**

```
point_final = Mirror × Rotation × point_svg
```

**Correct:**

```
point_final = Rotation × Mirror × point_svg
```

### Why Mirror Must Come First

The SVG paths are authored in a specific coordinate system where:

- The y-axis points down (standard SVG)
- Lane 1 is at the top-left
- CCW arcs curve "left" (toward increasing lane numbers)

To get a CW arc, we need to mirror around the SVG's vertical axis. This mirror must happen in the SVG coordinate space before we rotate to other lanes.

If we rotate first, we're mirroring around a rotated axis, which produces the wrong geometry.

## Related: slide-path.hook.ts

The `slide-path.hook.ts` file has a separate issue where it tries to compensate for the lower half lanes (3-6) by flipping the direction:

```typescript
const isLowerHalf = lane >= 3 && lane <= 6;
const effectiveDirection = isLowerHalf
  ? direction === "cw"
    ? "ccw"
    : "cw"
  : direction;
```

This is a workaround that may have been added to compensate for the mirroring bug. After fixing `transformSlidePoint`, this workaround might need to be revisited or removed.

## Testing the Fix

To verify the fix works:

1. Create a test slide `2>5[4:1]` (circle slide from lane 2 to lane 5, clockwise)
2. The slide should start at lane 2 (bottom-left) and curve clockwise toward lane 5 (top-right)
3. The path should pass through lanes 1, 8, 7, 6 on its way to lane 5
4. Before the fix: The slide would incorrectly start at lane 7 (bottom-right)

## Summary

| Aspect         | Current (Bug)             | Correct                        |
| -------------- | ------------------------- | ------------------------------ |
| Mirror timing  | After rotation            | Before rotation                |
| 2>5 CW result  | Starts at lane 7          | Starts at lane 2               |
| Axis of mirror | Rotated coordinate system | Original SVG coordinate system |
| Fix complexity | Swap 2 code blocks        | Simple reordering              |

The fix is straightforward: move the mirror flip to happen before the lane rotation in `transformSlidePoint`.
