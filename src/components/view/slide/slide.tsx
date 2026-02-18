import { getLaneDifference, getLaneRotationRadian } from "../../../../utils/lane";
import { AngledPoint, splitPath } from "../../../../utils/svg";
import { Container, Graphics } from "@pixi/react";
import { type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTimerTween } from "../../../hooks/timer-tween";
import { PlayerContext } from "../../../contexts/player";
import { TimerContext } from "../../../contexts/timer";
import { SlideVisualizationData } from "../../../lib/visualization";
import { useSlidePath } from "./slide-path.hook";

export function Slide({
  lane,
  hitTime,
  data,
}: {
  lane: number;
  hitTime: number;
  data: SlideVisualizationData;
}) {
  const { slideType, direction, destinationLane } = data;
  const rotation = getLaneRotationRadian(lane);
  useContext(TimerContext);
  const { radius } = useContext(PlayerContext);
  const destinationDifference = getLaneDifference(lane, destinationLane);
  const { slidePath: path } = useSlidePath({
    slideType,
    direction,
    destinationDifference,
  });
  const [points, setPoints] = useState<AngledPoint[]>([]);
  const { progress } = useTimerTween(hitTime, data.duration);
  useEffect(() => {
    if (!path) return;
    const paths = splitPath(path, 20);
    setPoints(paths);
  }, [path]);

  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      if (points.length === 0) return;

      const visiblePoints = points.slice(
        0,
        Math.max(1, Math.floor(points.length * progress)),
      );

      if (visiblePoints.length < 2) return;

      // Transform SVG coordinates to canvas coordinates
      // SVG viewBox: 0 0 1080 1080, center at (540, 540)
      // Canvas: center at (0, 0), radius from PlayerContext
      const svgCenter = 540;
      const scaleFactor = radius / svgCenter;

      g.lineStyle(2, 0xffffff);

      const transformPoint = (point: [number, number]): [number, number] => {
        const x = (point[0] - svgCenter) * scaleFactor;
        const y = (point[1] - svgCenter) * scaleFactor;
        return [x, y];
      };

      const startPoint = transformPoint(visiblePoints[0].point);
      g.moveTo(startPoint[0], startPoint[1]);

      for (let i = 1; i < visiblePoints.length; i++) {
        const point = transformPoint(visiblePoints[i].point);
        g.lineTo(point[0], point[1]);
      }
    },
    [points, progress, radius],
  );

  return (
    <Container rotation={rotation} position={[0, 0]}>
      <Graphics draw={draw} />
    </Container>
  );
}
