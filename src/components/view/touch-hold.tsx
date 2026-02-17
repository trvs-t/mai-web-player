import { Graphics } from "@pixi/react";
import { Graphics as PixiGraphics } from "pixi.js";
import { useCallback, useContext } from "react";
import { PlayerContext } from "../../contexts/player";
import { TimerContext } from "../../contexts/timer";
import { TouchHoldVisualizeData } from "../../lib/visualization";
import { getSensorColor, getSensorPosition } from "../../../utils/sensor";

const SENSOR_SIZE = 12;

export function TouchHold({ data }: { data: TouchHoldVisualizeData }) {
  const { zone, position, hitTime, duration, isHanabi } = data;
  const { radius } = useContext(PlayerContext);
  const { time } = useContext(TimerContext);
  const sensorPos = getSensorPosition(zone, position, radius);
  const color = getSensorColor(zone);

  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      const timeSinceHit = time - hitTime;
      const isActive = timeSinceHit >= 0 && timeSinceHit < duration;
      const isFinished = timeSinceHit >= duration;

      if (isFinished) return;

      const baseY = sensorPos.y;

      if (isActive) {
        const remainingRatio = 1 - timeSinceHit / duration;
        g.beginFill(color, 0.5);
        g.drawCircle(sensorPos.x, baseY, SENSOR_SIZE * (1 + remainingRatio * 0.5));
        g.endFill();
      }

      g.beginFill(color, 0.9);
      g.drawCircle(sensorPos.x, baseY, SENSOR_SIZE);
      g.endFill();

      if (isHanabi) {
        g.lineStyle(2, 0xffd700);
        g.drawCircle(sensorPos.x, baseY, SENSOR_SIZE + 4);
      }
    },
    [sensorPos, time, hitTime, duration, color, isHanabi],
  );

  return <Graphics draw={draw} />;
}
