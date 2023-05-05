import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback } from "react";
import { useLaneMovement } from "../animation/lane";
import { TapVisualizeData } from "../data/visualization";

export function Tap({ data }: { data: TapVisualizeData }) {
  const { hitTime, isEach } = data;
  const { displacement, isStart, isHit } = useLaneMovement(hitTime);
  const draw = useCallback((g: PixiGraphics) => {
    g.clear();
    g.beginFill(isEach ? 0xe4d000 : 0xffc0cb);
    g.drawCircle(0, 0, 16);
    g.beginHole();
    g.drawCircle(0, 0, 12);
    g.endHole();
    g.drawCircle(0, 0, 4);
  }, []);
  if (!isStart || isHit) return null;

  return <Graphics draw={draw} anchor={0.5} position={[0, displacement]} />;
}
