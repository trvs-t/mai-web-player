import { getLaneDifference, getLaneRotationRadian } from "../../../../utils/lane";
import { AngledPoint, splitPath } from "../../../../utils/svg";
import { Container, Graphics } from "@pixi/react";
import { type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTimerTween } from "../../../hooks/timer-tween";
import { PlayerContext } from "../../../contexts/player";
import { TimerContext } from "../../../contexts/timer";
import { SlideVisualizationData } from "../../../lib/visualization";
import { drawStar } from "../graphics";
import { useSlidePath } from "./slide-path.hook";

const slideWidth = 12,
  slideHeight = 10;

const slideAppearTime = 400;

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
  const timer = useContext(TimerContext);
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

      g.lineStyle(2, 0xffffff);
      g.moveTo(visiblePoints[0].point[0], visiblePoints[0].point[1]);
      for (let i = 1; i < visiblePoints.length; i++) {
        g.lineTo(visiblePoints[i].point[0], visiblePoints[i].point[1]);
      }
    },
    [points, progress],
  );

  return (
    <Container rotation={rotation} position={[0, 0]}>
      <Graphics draw={draw} />
    </Container>
  );
}
