import { useContext } from "react";
import { PlayerContext } from "../context/context";
import { useTimerTween } from "./timer-tween";

export const useLaneMovement = (hitTime: number) => {
  const { radius, noteDuration } = useContext(PlayerContext);
  const { progress, isStart, isEnd } = useTimerTween(
    hitTime - noteDuration,
    noteDuration
  );
  const displacement = progress * radius;
  return { displacement, isHit: isEnd, isStart };
};
