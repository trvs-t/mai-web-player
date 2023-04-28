import { useContext } from "react";
import { TimerContext } from "../context/timer";

export const useTimerTween = (startTime: number, duration: number) => {
  const { time } = useContext(TimerContext);
  const isStart = time > startTime;
  const isEnd = time > startTime + duration;
  const progress = (time - startTime) / duration;
  return { progress, isStart, isEnd };
};
