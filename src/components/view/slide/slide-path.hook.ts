import { useEffect, useMemo, useState } from "react";
import { SlideVisualizationData } from "../../../lib/visualization";
import {
  getSlidePathIndex,
  getSlidePathId,
  slidePathData,
} from "../../../lib/slide-paths";

type SlidePathData = Pick<
  SlideVisualizationData,
  "slideType" | "direction" | "lane"
> & {
  destinationDifference: number;
};

export const useSlidePath = ({
  slideType,
  destinationDifference,
  direction,
  lane,
}: SlidePathData) => {
  const [slidePath, setSlidePath] = useState<SVGGeometryElement>();

  const indexInType = getSlidePathIndex({
    slideType,
    destinationDifference,
    direction,
    lane,
  });

  useEffect(() => {
    const pathId = getSlidePathId(slideType, indexInType);

    if (pathId === undefined) {
      setSlidePath(undefined);
      return;
    }

    if (pathId === null) {
      setSlidePath(undefined);
      return;
    }

    const slide = document.querySelector<SVGGeometryElement>(`#${pathId}`);
    if (slide) {
      setSlidePath(slide);
    } else {
      console.warn(`Slide path not found: #${pathId} for ${slideType} slide`);
      setSlidePath(undefined);
    }
  }, [slideType, indexInType]);

  return useMemo(
    () => ({ slidePath, mirror: direction === "cw" }),
    [slidePath, direction],
  );
};

export { slidePathData };
