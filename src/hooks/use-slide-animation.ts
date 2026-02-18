import { useContext, useMemo } from "react";
import { PlayerContext } from "../contexts/player";
import { TimerContext } from "../contexts/timer";

export type AnimationPhase =
  | "BEFORE_START"
  | "FADING_IN"
  | "VISIBLE"
  | "DISAPPEARING"
  | "COMPLETE";

export interface SlideAnimationState {
  phase: AnimationPhase;
  fadeInProgress: number;
  disappearProgress: number;
  isArrowVisible: (arrowIndex: number) => boolean;
}

export function useSlideAnimation(
  hitTime: number,
  startTime: number,
  duration: number,
  arrowCount: number,
  measureDurationMs: number,
): SlideAnimationState {
  const { time } = useContext(TimerContext);
  const { noteDuration } = useContext(PlayerContext);

  return useMemo(() => {
    const appearTime = hitTime - noteDuration;
    const endTime = startTime + duration;
    const disappearStartTime = startTime + measureDurationMs;
    const disappearDuration = duration - measureDurationMs;

    // BEFORE_START: time < appearTime
    if (time < appearTime) {
      return {
        phase: "BEFORE_START",
        fadeInProgress: 0,
        disappearProgress: 0,
        isArrowVisible: () => false,
      };
    }

    // COMPLETE: time >= endTime
    if (time >= endTime) {
      return {
        phase: "COMPLETE",
        fadeInProgress: 1,
        disappearProgress: 1,
        isArrowVisible: () => false,
      };
    }

    // FADING_IN: appearTime <= time < hitTime
    if (time < hitTime) {
      const fadeInProgress = (time - appearTime) / noteDuration;
      return {
        phase: "FADING_IN",
        fadeInProgress,
        disappearProgress: 0,
        isArrowVisible: (index: number) => {
          // Show arrows progressively during fade-in
          const arrowThreshold = index / arrowCount;
          return fadeInProgress >= arrowThreshold;
        },
      };
    }

    // VISIBLE: hitTime <= time < disappearStartTime
    if (time < disappearStartTime) {
      return {
        phase: "VISIBLE",
        fadeInProgress: 1,
        disappearProgress: 0,
        isArrowVisible: () => true,
      };
    }

    // DISAPPEARING: disappearStartTime <= time < endTime
    const disappearProgress =
      disappearDuration > 0 ? (time - disappearStartTime) / disappearDuration : 1;

    return {
      phase: "DISAPPEARING",
      fadeInProgress: 1,
      disappearProgress,
      isArrowVisible: (index: number) => {
        // Arrows disappear sequentially from start to end
        const arrowThreshold = index / arrowCount;
        return disappearProgress < arrowThreshold;
      },
    };
  }, [time, hitTime, startTime, duration, arrowCount, measureDurationMs, noteDuration]);
}
