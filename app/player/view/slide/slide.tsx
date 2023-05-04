import { getLaneRotationRadian } from "@/utils/lane";
import { AngledPoint, splitPath } from "@/utils/svg";
import { Container, Graphics } from "@pixi/react";
import { type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTimerTween } from "../../animation/timer-tween";
import { PlayerContext } from "../../context/player";
import { TimerContext } from "../../context/timer";
import { SlideVisualizationData } from "../../data/visualization";
import { drawStar } from "../graphics";
import { useSlidePath } from "./slide-path.hook";

const slideWidth = 12,
  slideHeight = 10;

const slideAppearTime = 400; // todo: config

export function Slide({
  lane,
  hitTime,
  startTime,
  duration,
  slideType,
  direction,
  destinationLane,
}: SlideVisualizationData) {
  const rotation = getLaneRotationRadian(lane);
  const { radius } = useContext(PlayerContext);
  const scale = radius / (1080 / 2);
  const [points, setPoints] = useState<AngledPoint[]>([]);

  const { slidePath: path, mirror } = useSlidePath({
    slideType,
    destinationDifference: destinationLane - lane,
    direction,
  });
  useEffect(() => {
    if (path) {
      setPoints(splitPath(path, slideHeight * 4.5));
    }
  }, [path]);

  const { time } = useContext(TimerContext);

  const { progress, isEnd } = useTimerTween(startTime, duration);

  const { progress: appearProgress } = useTimerTween(
    hitTime - slideAppearTime,
    slideAppearTime
  );

  const draw = useCallback((g: PixiGraphics) => {
    g.clear();
    g.lineStyle(2, 0x0c1f27, 1, 0.5, true);
    g.beginFill(0x5bc3c4);
    g.moveTo(0, slideHeight)
      .lineTo(-slideWidth, slideHeight / 2)
      .lineTo(-slideWidth, -slideHeight / 2)
      .lineTo(0, 0)
      .lineTo(slideWidth, -slideHeight / 2)
      .lineTo(slideWidth, slideHeight / 2)
      .closePath()
      .endFill();
  }, []);

  if (isEnd || time < hitTime - slideAppearTime || !path) return null;

  const firstVisiblePointIndex =
    progress < 0 ? 0 : Math.ceil(progress * points.length);
  const pointsToDraw = points.slice(firstVisiblePointIndex);

  const slidePoint = path.getPointAtLength(path.getTotalLength() * progress);

  return (
    <Container scale={[mirror ? -1 : 1, 1]} rotation={rotation}>
      {/* first align slide path to renderer coordinates (0 rotation = south) */}
      <Container
        anchor={0.5}
        rotation={(7 / 8) * Math.PI}
        alpha={appearProgress}
      >
        {pointsToDraw.map((point, i) => (
          <Graphics
            key={point.id}
            draw={draw}
            anchor={0.5}
            position={[
              point.point[0] * scale - radius,
              point.point[1] * scale - radius,
            ]}
            rotation={point.angle}
          />
        ))}
        <Graphics
          draw={drawStar}
          anchor={0.5}
          position={[
            slidePoint.x * scale - radius,
            slidePoint.y * scale - radius,
          ]}
        />
      </Container>
    </Container>
  );
}
