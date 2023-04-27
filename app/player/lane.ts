import { useContext } from "react";
import { PlayerContext } from "./context/context";
import { TimerContext } from "./context/timer";

export const useLaneMovement = (hitTime: number) => {
  const { radius, noteDuration } = useContext(PlayerContext);
  const { time = 0 } = useContext(TimerContext) || {};
  const timeUntilHit = hitTime - time;
  const isHit = timeUntilHit <= 0;
  const isStart = timeUntilHit < noteDuration;
  const displacement = Math.min(1, 1 - timeUntilHit / noteDuration) * radius;
  return { displacement, isHit, isStart };
};
