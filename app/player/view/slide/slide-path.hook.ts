import { useEffect, useState } from "react";
import { SlideType } from "../../data/chart";

function getIndexInType(type: SlideType, destinationDifference: number) {
  const typePathIds = pathIdByType[type];
  let index = destinationDifference,
    mirror = false;
  switch (type) {
    case "Thunder":
      return 0;
    case "Straight":
      index += 2;
    default:
      if (index > typePathIds.length) {
        index = 8 - index;
        mirror = true;
      }
  }
  return index;
}

export const useSlidePath = (
  slideType: SlideType,
  destinationDifference: number
) => {
  const [slidePath, setSlidePath] = useState<SVGGeometryElement>();

  useEffect(() => {
    const typePathIds = pathIdByType[slideType];
    const indexInType = getIndexInType(slideType, destinationDifference);
    const slide = document.querySelector<SVGGeometryElement>(
      `#${typePathIds[indexInType]}`
    );
    if (slide) {
      setSlidePath(slide);
    }
  }, [slideType, destinationDifference]);
  return slidePath;
};
const pathIdByType = {
  CUP: [
    "CUP_x5F_Curve_x5F_1",
    "CUP_x5F_Curve_x5F_2",
    "CUP_x5F_Curve_x5F_3",
    "CUP_x5F_Curve_x5F_4_1_",
    "CUP_x5F_Curve_x5F_5",
    "CUP_x5F_Curve_x5F_6",
    "CUP_x5F_Curve_x5F_7",
    "CUP_x5F_Curve_x5F_8",
  ],
  Circle: [
    "Circle_x5F_1",
    "Circle_x5F_2",
    "Circle_x5F_3",
    "Circle_x5F_4",
    "Circle_x5F_5",
    "Circle_x5F_6",
    "Circle_x5F_7",
    "Circle_x5F_8",
  ],
  U: [
    "U_x5F_Curve_x5F_1",
    "U_x5F_Curve_x5F_2",
    "U_x5F_Curve_x5F_3",
    "U_x5F_Curve_x5F_4",
    "U_x5F_Curve_x5F_5",
    "U_x5F_Curve_x5F_6",
    "U_x5F_Curve_x5F_7",
    "U_x5F_Curve_x5F_8",
  ],
  L: ["L_x5F_2", "L_x5F_3", "L_x5F_4", "L_x5F_5"],
  Thunder: ["Thunder_x5F_5"],
  V: [
    "V_x5F_1_1_",
    "V_x5F_2_1_",
    "V_x5F_3",
    "V_x5F_4_2_",
    "V_x5F_6",
    "V_x5F_7",
    "V_x5F_8_1_",
  ],
  Straight: [
    "Straight_x5F_3",
    "Straight_x5F_4_1_",
    "Straight_x5F_5",
    "Straight_x5F_6",
    "Straight_x5F_7",
  ],
};
