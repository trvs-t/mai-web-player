import { useContext } from "react";
import { TimerContext } from "../contexts/timer";

export const useTimerTween = (startTime: number, duration: number) => {
  const { time } = useContext(TimerContext);
  const isStart = time > startTime;
  const isEnd = time > startTime + duration;
  if (isEnd) return { progress: 1, isStart, isEnd };
  if (!isStart) return { progress: 0, isStart, isEnd };
  const progress = (time - startTime) / duration;
  return { progress, isStart, isEnd };
};
