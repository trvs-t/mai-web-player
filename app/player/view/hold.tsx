import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext } from "react";
import { useLaneMovement } from "../animation/lane";
import { PlayerContext } from "../context/context";

interface HoldProps {
  startTime: number;
  endTime: number;
}

const HoldWidth = 24;
const StrokeWidth = 4;

function hexPoints(height: number, width: number) {
  return [
    { x: -width / 2, y: -width / 4 },
    { x: 0, y: -width / 2 },
    { x: width / 2, y: -width / 4 },
    { x: width / 2, y: height + width / 4 },
    { x: 0, y: height + width / 2 },
    { x: -width / 2, y: height + width / 4 },
  ];
}

export function Hold({ startTime, endTime }: HoldProps) {
  const { radius } = useContext(PlayerContext);
  const startMovement = useLaneMovement(startTime);
  const endMovement = useLaneMovement(endTime);
  const startDisplacement = Math.min(
    Math.max(0, startMovement.displacement),
    radius
  );
  const endDisplacement = Math.min(
    Math.max(0, endMovement.displacement),
    radius
  );
  const height = startDisplacement - endDisplacement;

  const draw = useCallback(
    (graphics: PixiGraphics) => {
      graphics.clear();
      // todo fix hold coordinates
      graphics
        .beginFill()
        .lineStyle(2, 0xff0000, 0.5)
        .drawPolygon(hexPoints(height, HoldWidth))
        .endFill()
        .beginHole()
        .drawPolygon(
          hexPoints(height - StrokeWidth * 2, HoldWidth - StrokeWidth * 2)
        )
        .endHole()
        .beginFill()
        .drawCircle(0, 0, StrokeWidth)
        .drawCircle(0, height, StrokeWidth)
        .endFill();
    },
    [height]
  );

  if (!startMovement.isStart || endMovement.isHit) return null;

  return (
    <Graphics draw={draw} anchor={[0.5, 0]} position={[0, endDisplacement]} />
  );
}
