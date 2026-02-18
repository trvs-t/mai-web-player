import {
  getLaneDifference,
  getLaneRotationRadian,
} from "../../../../utils/lane";
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
const WIFI_CHEVRON_SIZE = 14;

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
  const {
    slideType,
    direction,
    destinationLane,
    hitTime,
    startTime,
    duration,
    measureDurationMs,
  } = data;
  const { radius } = useContext(PlayerContext);
  const destinationDifference = getLaneDifference(lane, destinationLane);
  // WiFi uses straight slide path for movement, but renders with fanned arrows
  const pathSlideType = slideType === "WiFi" ? "Straight" : slideType;
  const { slidePath: path, mirror } = useSlidePath({
    slideType: pathSlideType,
    direction,
    destinationDifference,
    lane,
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
    // SVG paths are designed for lane 1 CCW paths
    // For CW slides, mirroring shifts the start from lane 1 to lane 8
    // So we need to rotate 1 extra lane (45°) for CW slides
    const baseOffset = laneRotation - getLaneRotationRadian(1);
    const cwAdjustment = mirror
      ? getLaneRotationRadian(2) - getLaneRotationRadian(1)
      : 0;
    return baseOffset + cwAdjustment;
  }, [laneRotation, mirror]);

  useEffect(() => {
    if (path) {
      const sampledPoints = splitPath(path, 20);
      setPoints(sampledPoints);
    }
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

      // For WiFi, sample fewer points for wider visual spread
      const step = slideType === "WiFi" ? 2 : 1;

      for (let i = 0; i < points.length; i += step) {
        const angledPoint = points[i];

        const effectiveIndex = Math.floor(i / step);
        const totalArrows =
          slideType === "WiFi"
            ? Math.ceil(points.length / step)
            : points.length;

        const { alpha: arrowAlpha, shouldRender } = calculateArrowAlpha(
          effectiveIndex,
          totalArrows,
          phase,
          fadeInProgress,
          disappearProgress,
        );

        if (!shouldRender) continue;

        const [baseX, baseY] = transformSlidePoint(
          angledPoint.point,
          svgCenter,
          scaleFactor,
          laneOffsetAngle,
          mirror,
        );

        const chevronAngle = calculateChevronAngle(
          angledPoint.angle,
          laneOffsetAngle,
          mirror,
        );

        if (slideType === "WiFi") {
          // Arrow fans out from small (start) to large (covers lanes 4,5,6 at destination)
          const progress =
            totalArrows > 1 ? effectiveIndex / (totalArrows - 1) : 0;
          const wifiSize = 4 + progress * (WIFI_CHEVRON_SIZE - 4);
          drawRotatedChevron(
            g,
            baseX,
            baseY,
            chevronAngle,
            wifiSize,
            arrowAlpha,
          );
        } else {
          drawRotatedChevron(
            g,
            baseX,
            baseY,
            chevronAngle,
            CHEVRON_SIZE,
            arrowAlpha,
          );
        }
      }
    },
    [
      points,
      phase,
      fadeInProgress,
      disappearProgress,
      radius,
      laneOffsetAngle,
      mirror,
      slideType,
    ],
  );

  return (
    <Container position={[0, 0]}>
      <Graphics draw={draw} />
    </Container>
  );
}
