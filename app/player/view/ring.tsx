import { getLaneRotationRadian } from "@/utils/lane";
import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext } from "react";
import { PlayerContext } from "../context/context";
export function Ring() {
  const { position, radius } = useContext(PlayerContext);
  const drawRing = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      g.beginFill(0xffffff);
      g.drawCircle(0, 0, radius);
      g.beginHole();
      g.drawCircle(0, 0, radius - radius / 50);
      g.endHole();
      new Array(8).fill(0).forEach((_, i) => {
        const x = Math.cos(getLaneRotationRadian(i + 1)) * radius;
        const y = Math.sin(getLaneRotationRadian(i + 1)) * radius;
        g.drawCircle(x, y, radius / 20);
      });
    },
    [radius]
  );
  return <Graphics draw={drawRing} position={position} />;
}
