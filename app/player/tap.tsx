import { Graphics, useTick } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext, useState } from "react";
import { PlayerContext } from "./context";

export function Tap() {
  const { radius } = useContext(PlayerContext);
  const [position, setPosition] = useState([0, 0]);
  const draw = useCallback((g: PixiGraphics) => {
    g.clear();
    g.beginFill(0xffc0cb);
    g.drawCircle(0, 0, 16);
    g.beginHole();
    g.drawCircle(0, 0, 12);
    g.endHole();
    g.drawCircle(0, 0, 4);
  }, []);
  useTick((delta) => {
    if (position[1] > radius) return;
    setPosition([position[0], position[1] + delta * 10]);
  });

  return <Graphics draw={draw} anchor={0.5} />;
}
