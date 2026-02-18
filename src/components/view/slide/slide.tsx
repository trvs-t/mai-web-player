import { getLaneDifference, getLaneRotationRadian } from "../../../../utils/lane";
import { AngledPoint, splitPath } from "../../../../utils/svg";
import { Container, Graphics } from "@pixi/react";
import { type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSlideAnimation } from "../../../hooks/use-slide-animation";
import { PlayerContext } from "../../../contexts/player";
import { SlideVisualizationData } from "../../../lib/visualization";
import { useSlidePath } from "./slide-path.hook";

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

  const { phase, fadeInProgress, isArrowVisible } = useSlideAnimation(
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

      const transformPoint = (point: [number, number]): [number, number] => {
        const x = (point[0] - svgCenter) * scaleFactor;
        const y = (point[1] - svgCenter) * scaleFactor;
        return [x, y];
      };

      const rotatePoint = (point: [number, number], angle: number): [number, number] => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const [x, y] = point;
        return [x * cos - y * sin, x * sin + y * cos];
      };

      for (let i = 0; i < points.length; i++) {
        if (!isArrowVisible(i)) continue;

        const angledPoint = points[i];
        let [x, y] = transformPoint(angledPoint.point);

        // Apply lane rotation offset so path starts at correct lane
        [x, y] = rotatePoint([x, y], laneOffsetAngle);

        // Apply mirror flip for clockwise slides if needed
        if (mirror) {
          x = -x;
        }

        const arrowThreshold = i / points.length;
        let alpha = 1;
        if (phase === "FADING_IN") {
          const fadeRange = 0.1;
          const localProgress = (fadeInProgress - arrowThreshold) / fadeRange;
          alpha = Math.max(0, Math.min(1, localProgress));
        }

        drawRotatedChevron(g, x, y, angledPoint.angle + laneOffsetAngle, CHEVRON_SIZE, alpha);
      }
    },
    [points, phase, fadeInProgress, isArrowVisible, radius, laneOffsetAngle, mirror],
  );

  return (
    <Container position={[0, 0]}>
      <Graphics draw={draw} />
    </Container>
  );
}
