import { useEffect, useMemo, useState } from "react";
import { SlideVisualizationData } from "../../../lib/visualization";

type SlidePathData = Pick<
  SlideVisualizationData,
  "slideType" | "direction" | "lane"
> & {
  destinationDifference: number;
};

function getIndexInType({
  slideType,
  destinationDifference,
  direction,
  lane,
}: SlidePathData) {
  if (slideType === "Thunder") return 0;

  // For lanes 3-6 (lower half), the arrow symbols have opposite visual meaning
  // because of how the SVG paths are rotated from lane 1's perspective.
  // Upper half (7,8,1,2): > means CW arcs, < means CCW arcs (as expected)
  // Lower half (3,4,5,6): > means CCW arcs, < means CW arcs (flipped)
  const isLowerHalf = lane >= 3 && lane <= 6;
  const effectiveDirection = isLowerHalf
    ? direction === "cw"
      ? "ccw"
      : "cw"
    : direction;

  const index =
    (destinationDifference < 0 ? 8 : 0) +
    destinationDifference -
    pathData[slideType].diffIndexOffset;

  // Use modulo to handle wraparound (e.g., when index is 8, it becomes 0)
  return effectiveDirection === "ccw"
    ? index
    : (8 - index) % 8;
}

export const useSlidePath = ({
  slideType,
  destinationDifference,
  direction,
  lane,
}: SlidePathData) => {
  const [slidePath, setSlidePath] = useState<SVGGeometryElement>();
  const indexInType = getIndexInType({
    slideType,
    destinationDifference,
    direction,
    lane,
  });

  useEffect(() => {
    const typePathIds = pathData[slideType].paths;
    const slide = document.querySelector<SVGGeometryElement>(
      `#${typePathIds[indexInType]}`,
    );
    if (slide) {
      setSlidePath(slide);
    }
  }, [slideType, indexInType]);

  return useMemo(
    () => ({ slidePath, mirror: direction === "cw" }),
    [slidePath, direction],
  );
};

// all paths are counter-clockwise by default
const pathData = {
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
      "V_x5F_1_1_",
      "V_x5F_2_1_",
      "V_x5F_3",
      "V_x5F_4_2_",
      "V_x5F_6",
      "V_x5F_7",
      "V_x5F_8_1_",
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
