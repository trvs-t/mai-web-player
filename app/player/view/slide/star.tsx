import { Container, Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext } from "react";
import { useLaneMovement } from "../../animation/lane";
import { useTimerTween } from "../../animation/timer-tween";
import { PlayerContext } from "../../context/context";
import { SlideVisualizationData } from "../../data/visualization";
import { useSlidePath } from "./slide-path.hook";

// TODO: draw star
// TODO: rotation speed
export function Star({ data }: { data: SlideVisualizationData }) {
  const { hitTime, type, destinationDifference, startTime, duration } = data;
  const { radius } = useContext(PlayerContext);
  const scale = radius / (1080 / 2);

  const path = useSlidePath(type, destinationDifference);
  const { progress, isEnd } = useTimerTween(startTime, duration);
  const { displacement, isStart, isHit } = useLaneMovement(hitTime);

  const draw = useCallback((g: PixiGraphics) => {
    g.clear();
    g.beginFill(0x275a9c);
    g.drawCircle(0, 0, 16);
    g.beginHole();
    g.drawCircle(0, 0, 12);
    g.endHole();
    g.drawCircle(0, 0, 4);
  }, []);

  if (!path || !isStart || isEnd) return null;
  const slidePoint = path.getPointAtLength(path.getTotalLength() * progress);
  const position = isHit
    ? { x: slidePoint.x * scale - radius, y: slidePoint.y * scale - radius }
    : { x: 0, y: displacement };

  return (
    <Container anchor={0.5} rotation={isHit ? data.rotation : 0}>
      <Graphics draw={draw} anchor={0.5} position={position} />
    </Container>
  );
}
