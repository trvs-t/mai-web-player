import type { SlideType } from "./chart";

export interface SlidePathData {
  slideType: SlideType;
  destinationDifference: number;
  direction: "cw" | "ccw";
  lane: number;
}

export interface PathDataEntry {
  diffIndexOffset: number;
  paths: (string | null)[];
}

// All paths are counter-clockwise by default
export const slidePathData: Record<SlideType, PathDataEntry> = {
  CUP: {
    diffIndexOffset: 0,
    paths: [
      "CUP_x5F_Curve_x5F_1",
      "CUP_x5F_Curve_x5F_2",
      "CUP_x5F_Curve_x5F_3",
      "CUP_x5F_Curve_x5F_4_1_",
      "CUP_x5F_Curve_x5F_5",
      "CUP_x5F_Curve_x5F_6",
      "CUP_x5F_Curve_x5F_7",
      "CUP_x5F_Curve_x5F_8",
    ],
  },
  Circle: {
    diffIndexOffset: 0,
    paths: [
      "Circle_x5F_1",
      "Circle_x5F_2",
      "Circle_x5F_3",
      "Circle_x5F_4",
      "Circle_x5F_5",
      "Circle_x5F_6",
      "Circle_x5F_7",
      "Circle_x5F_8",
    ],
  },
  U: {
    diffIndexOffset: 0,
    paths: [
      "U_x5F_Curve_x5F_1",
      "U_x5F_Curve_x5F_2",
      "U_x5F_Curve_x5F_3",
      "U_x5F_Curve_x5F_4",
      "U_x5F_Curve_x5F_5",
      "U_x5F_Curve_x5F_6",
      "U_x5F_Curve_x5F_7",
      "U_x5F_Curve_x5F_8",
    ],
  },
  L: {
    diffIndexOffset: 1,
    paths: ["L_x5F_2", "L_x5F_3", "L_x5F_4", "L_x5F_5"],
  },
  Thunder: {
    diffIndexOffset: 4,
    paths: ["Thunder_x5F_5"],
  },
  V: {
    diffIndexOffset: 0,
    paths: [
      "V_x5F_1_1_", // index 0: destination diff 0 (lane 1 -> lane 1)
      "V_x5F_2_1_", // index 1: destination diff 1 (lane 1 -> lane 2)
      "V_x5F_3", // index 2: destination diff 2 (lane 1 -> lane 3)
      "V_x5F_4_2_", // index 3: destination diff 3 (lane 1 -> lane 4)
      null, // index 4: destination diff 4 (lane 1 -> lane 5) - no V_x5F_5 path available
      "V_x5F_6", // index 5: destination diff 5 (lane 1 -> lane 6)
      "V_x5F_7", // index 6: destination diff 6 (lane 1 -> lane 7)
      "V_x5F_8_1_", // index 7: destination diff 7 (lane 1 -> lane 8)
    ],
  },
  Straight: {
    diffIndexOffset: 2,
    paths: [
      "Straight_x5F_3",
      "Straight_x5F_4_1_",
      "Straight_x5F_5",
      "Straight_x5F_6",
      "Straight_x5F_7",
    ],
  },
  WiFi: {
    diffIndexOffset: 0,
    paths: [
      "WiFi_x5F_1",
      "WiFi_x5F_2",
      "WiFi_x5F_3",
      "WiFi_x5F_4",
      "WiFi_x5F_5",
      "WiFi_x5F_6",
      "WiFi_x5F_7",
      "WiFi_x5F_8",
    ],
  },
};

/**
 * Calculates the path index for a slide type based on destination and direction.
 * Returns -1 if the destination is invalid for the slide type.
 *
 * For L slides, paths are indexed by distance from midpoint (dest - mid = destinationDifference - 2).
 * For other slides with 8 paths, uses modulo wraparound for CW direction.
 * Thunder always returns 0 (single path).
 */
export function getSlidePathIndex({
  slideType,
  destinationDifference,
  direction,
  lane,
}: SlidePathData): number {
  if (slideType === "Thunder") return 0;

  const isLowerHalf = lane >= 3 && lane <= 6;
  const effectiveDirection = isLowerHalf
    ? direction === "cw"
      ? "ccw"
      : "cw"
    : direction;

  const rawIndex =
    (destinationDifference < 0 ? 8 : 0) +
    destinationDifference -
    slidePathData[slideType].diffIndexOffset;

  if (slideType === "L") {
    const midToDestDistance = rawIndex - 1;
    if (midToDestDistance < 2 || midToDestDistance > 5) {
      return -1;
    }
    const pathIndex = midToDestDistance - 2;
    return effectiveDirection === "ccw" ? pathIndex : 3 - pathIndex;
  }

  return effectiveDirection === "ccw" ? rawIndex : (8 - rawIndex) % 8;
}

/**
 * Gets the SVG path ID for a slide, or null if not available.
 * Returns undefined if the index is invalid.
 */
export function getSlidePathId(
  slideType: SlideType,
  pathIndex: number,
): string | null | undefined {
  const paths = slidePathData[slideType].paths;

  if (pathIndex < 0 || pathIndex >= paths.length) {
    return undefined;
  }

  return paths[pathIndex];
}
