import { AngledPoint, splitPath } from "@/utils/svg";
import { Container, Graphics } from "@pixi/react";
import { type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTimerTween } from "../../animation/timer-tween";
import { PlayerContext } from "../../context/context";
import { SlideData } from "./slide-data";
import { useSlidePath } from "./slide-path.hook";

interface SlideProps extends SlideData {
  startTime: number;
  endTime: number;
}

const slideWidth = 12,
  slideHeight = 11;

export function Slide({ startTime, endTime, ...data }: SlideProps) {
  const { radius } = useContext(PlayerContext);
  const scale = radius / (1080 / 2);
  const [points, setPoints] = useState<AngledPoint[]>([]);

  const path = useSlidePath(data);
  useEffect(() => {
    if (path) {
      setPoints(splitPath(path, 30));
    }
  }, [path]);

  const { progress, isStart, isEnd } = useTimerTween(
    startTime,
    endTime - startTime
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

  if (isEnd) return null;

  const firstVisiblePointIndex =
    progress < 0 ? 0 : Math.ceil(progress * points.length);
  const pointsToDraw = points.slice(firstVisiblePointIndex);

  return (
    // to undo rotation at button 1, we need to rotate the container
    // the rotation should be 7/8 but original svgs seems a bit off
    <Container anchor={0.5} rotation={(6.9 / 8) * Math.PI}>
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
    </Container>
  );
}
