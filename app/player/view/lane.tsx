import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext } from "react";
import { PlayerContext } from "../context/player";
const width = 16;
export function Lane() {
  const { radius } = useContext(PlayerContext);
  const draw = useCallback((g: PixiGraphics) => {
    g.clear();
    g.endFill()
      .lineStyle({ width: 2, color: 0xffc0cb, alignment: 0.5, alpha: 1 })
      .moveTo(-width / 2, 0)
      .lineTo(width / 2, 0)
      .lineTo(width / 2, radius)
      .lineTo(-width / 2, radius)
      .lineTo(-width / 2, 0);
  }, []);

  return <Graphics draw={draw} anchor={0.5} />;
}
