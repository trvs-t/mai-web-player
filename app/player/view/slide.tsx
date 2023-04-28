import { AngledPoint, splitPath } from "@/utils/svg";
import { Container, Graphics } from "@pixi/react";
import { type Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTimerTween } from "../animation/timer-tween";
import { PlayerContext } from "../context/context";
import { SlideData } from "./slide-data";
import { useSlidePath } from "./slide-path.hook";

interface SlideProps extends SlideData {
  startTime: number;
  endTime: number;
}

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
    var triangleWidth = 20,
      triangleHeight = triangleWidth,
      triangleHalfway = triangleWidth / 2;

    // draw triangle
    // g.beginFill(0xff0000, 1);
    g.lineTextureStyle({
      width: 2,
      color: 0xff0000,
    })
      .moveTo(0, triangleHeight + 2)
      .lineTo(-triangleHalfway, 0)
      .lineTo(0, triangleHeight)
      .lineTo(triangleHalfway, 0)
      .lineTo(0, triangleHeight + 2);

    // g.endFill();
  }, []);

  if (isEnd) return null;

  const firstVisiblePointIndex =
    progress < 0 ? 0 : Math.ceil(progress * points.length);
  const pointsToDraw = points.slice(firstVisiblePointIndex);

  return (
    <Container anchor={0.5} rotation={(7 / 8) * Math.PI}>
      {pointsToDraw.map((point, i) => (
        <Graphics
          key={point.id}
          draw={draw}
          anchor={0.5}
          position={[
            point.point[0] * scale - radius + 8,
            point.point[1] * scale - radius - 16,
          ]}
          rotation={point.angle}
        />
      ))}
    </Container>
  );
}
