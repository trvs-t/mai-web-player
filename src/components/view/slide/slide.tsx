import { getLaneDifference, getLaneRotationRadian } from "../../../../utils/lane";
import { AngledPoint, splitPath } from "../../../../utils/svg";
import { Container, Graphics } from "@pixi/react";
import { type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSlideAnimation } from "../../../hooks/use-slide-animation";
import { PlayerContext } from "../../../contexts/player";
import { SlideVisualizationData } from "../../../lib/visualization";
import { useSlidePath } from "./slide-path.hook";
import {
  calculateArrowAlpha,
  calculateChevronAngle,
  transformSlidePoint,
} from "./slide-calculations";

const CHEVRON_SIZE = 8;

function drawRotatedChevron(
  g: PixiGraphics,
  x: number,
  y: number,
  angle: number,
  size: number,
  alpha: number,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const rotate = (px: number, py: number): [number, number] => [
    x + px * cos - py * sin,
    y + px * sin + py * cos,
  ];

  const [x1, y1] = rotate(-size, -size);
  const [x2, y2] = rotate(size, 0);
  const [x3, y3] = rotate(-size, size);

  g.lineStyle(2, 0xffffff, alpha);
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.moveTo(x3, y3);
  g.lineTo(x2, y2);
}

export function Slide({
  lane,
  data,
}: {
  lane: number;
  data: SlideVisualizationData;
}) {
  const { slideType, direction, destinationLane, hitTime, startTime, duration, measureDurationMs } = data;
  const { radius } = useContext(PlayerContext);
  const destinationDifference = getLaneDifference(lane, destinationLane);
  const { slidePath: path, mirror } = useSlidePath({
    slideType,
    direction,
    destinationDifference,
  });
  const [points, setPoints] = useState<AngledPoint[]>([]);

  const { phase, fadeInProgress, disappearProgress } = useSlideAnimation(
    hitTime,
    startTime,
    duration,
    points.length,
    measureDurationMs,
  );

  const laneRotation = getLaneRotationRadian(lane);
  const laneOffsetAngle = useMemo(() => {
    // SVG paths are designed for lane 1, so rotate to match actual lane
    return laneRotation - getLaneRotationRadian(1);
  }, [laneRotation]);

  useEffect(() => {
    if (!path) return;
    const sampledPoints = splitPath(path, 20);
    setPoints(sampledPoints);
  }, [path]);

  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      if (phase === "BEFORE_START" || phase === "COMPLETE") {
        return;
      }

      if (points.length === 0) return;

      const svgCenter = 540;
      const scaleFactor = radius / svgCenter;

      for (let i = 0; i < points.length; i++) {
        const angledPoint = points[i];

        // Calculate alpha based on phase
        const { alpha: arrowAlpha, shouldRender } = calculateArrowAlpha(
          i,
          points.length,
          phase,
          fadeInProgress,
          disappearProgress,
        );

        if (!shouldRender) continue;

        // Transform point from SVG to canvas coordinates
        const [x, y] = transformSlidePoint(
          angledPoint.point,
          svgCenter,
          scaleFactor,
          laneOffsetAngle,
          mirror,
        );

        // Calculate chevron angle (point along tangent, not toward center)
        const chevronAngle = calculateChevronAngle(angledPoint.angle, laneOffsetAngle);

        drawRotatedChevron(g, x, y, chevronAngle, CHEVRON_SIZE, arrowAlpha);
      }
    },
    [points, phase, fadeInProgress, disappearProgress, radius, laneOffsetAngle, mirror],
  );

  return (
    <Container position={[0, 0]}>
      <Graphics draw={draw} />
    </Container>
  );
}
