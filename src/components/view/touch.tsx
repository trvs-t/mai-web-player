import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext } from "react";
import { PlayerContext } from "../../contexts/player";
import { useLaneMovement } from "../../hooks/lane";
import { TouchVisualizeData } from "../../lib/visualization";
import { getSensorColor, getSensorPosition } from "../../../utils/sensor";

const SENSOR_SIZE = 12;

export function Touch({ data }: { data: TouchVisualizeData }) {
  const { zone, position, hitTime, isHanabi } = data;
  const { radius } = useContext(PlayerContext);
  const { displacement, isStart, isHit } = useLaneMovement(hitTime);

  if (!isStart || isHit) return null;

  const sensorPos = getSensorPosition(zone, position, radius);
  const color = getSensorColor(zone);

  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      g.beginFill(color, 0.9);
      g.drawCircle(sensorPos.x, sensorPos.y + displacement, SENSOR_SIZE);
      g.endFill();

      if (isHanabi) {
        g.lineStyle(2, 0xffd700);
        g.drawCircle(sensorPos.x, sensorPos.y + displacement, SENSOR_SIZE + 4);
      }
    },
    [sensorPos, displacement, color, isHanabi],
  );

  return <Graphics draw={draw} />;
}
