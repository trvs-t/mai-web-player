import { Container, Graphics, Stage } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext } from "react";
import { PlayerContext } from "./context";
import { Tap } from "./tap";

export const Player = () => {
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
        const x = Math.cos((13 / 16 - i / 8) * Math.PI * 2) * radius;
        const y = Math.sin((13 / 16 - i / 8) * Math.PI * 2) * radius;
        g.drawCircle(x, y, radius / 20);
      });
    },
    [radius]
  );

  return (
    <div>
      <Stage>
        <Graphics draw={drawRing} position={position} />
        <Container position={position} rotation={(-3 / 16) * Math.PI * 2}>
          <Tap />
        </Container>
      </Stage>
    </div>
  );
};
