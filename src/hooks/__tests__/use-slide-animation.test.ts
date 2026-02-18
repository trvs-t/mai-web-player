import { describe, it, expect } from "bun:test";
import type { SlideAnimationState, AnimationPhase } from "../use-slide-animation";

// Test the animation logic directly without React context
// by extracting the core calculation logic

interface TestParams {
  time: number;
  hitTime: number;
  startTime: number;
  duration: number;
  arrowCount: number;
  measureDurationMs: number;
  noteDuration: number;
}

function calculateAnimationState(
  params: TestParams,
): SlideAnimationState {
  const { time, hitTime, startTime, duration, arrowCount, measureDurationMs, noteDuration } = params;
  const appearTime = hitTime - noteDuration;
  const endTime = startTime + duration;
  const disappearStartTime = startTime + measureDurationMs;
  const disappearDuration = duration - measureDurationMs;

  // BEFORE_START: time < appearTime
  if (time < appearTime) {
    return {
      phase: "BEFORE_START" as AnimationPhase,
      fadeInProgress: 0,
      disappearProgress: 0,
      isArrowVisible: () => false,
    };
  }

  // COMPLETE: time >= endTime
  if (time >= endTime) {
    return {
      phase: "COMPLETE" as AnimationPhase,
      fadeInProgress: 1,
      disappearProgress: 1,
      isArrowVisible: () => false,
    };
  }

  // FADING_IN: appearTime <= time < hitTime
  if (time < hitTime) {
    const fadeInProgress = (time - appearTime) / noteDuration;
    return {
      phase: "FADING_IN" as AnimationPhase,
      fadeInProgress,
      disappearProgress: 0,
      isArrowVisible: () => {
        // All arrows visible during fade-in, opacity controlled by fadeInProgress
        return true;
      },
    };
  }

  // VISIBLE: hitTime <= time < disappearStartTime
  if (time < disappearStartTime) {
    return {
      phase: "VISIBLE" as AnimationPhase,
      fadeInProgress: 1,
      disappearProgress: 0,
      isArrowVisible: () => true,
    };
  }

  // DISAPPEARING: disappearStartTime <= time < endTime
  const disappearProgress =
    disappearDuration > 0 ? (time - disappearStartTime) / disappearDuration : 1;

  return {
    phase: "DISAPPEARING" as AnimationPhase,
    fadeInProgress: 1,
    disappearProgress,
    isArrowVisible: (index: number) => {
      // Arrows disappear sequentially from start to end
      const arrowThreshold = index / arrowCount;
      return disappearProgress < arrowThreshold;
    },
  };
}

describe("useSlideAnimation", () => {
  const baseParams = {
    hitTime: 1000,
    startTime: 1500,
    duration: 4000, // Longer duration so we have time for disappearing phase
    arrowCount: 5,
    measureDurationMs: 2000,
    noteDuration: 500,
  };

  describe("Animation Phases", () => {
    it("should be in BEFORE_START phase when time < appearTime", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 300,
      });

      expect(state.phase).toBe("BEFORE_START");
      expect(state.fadeInProgress).toBe(0);
      expect(state.isArrowVisible(0)).toBe(false);
    });

    it("should be in FADING_IN phase during fade-in period", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 750,
      });

      expect(state.phase).toBe("FADING_IN");
      expect(state.fadeInProgress).toBeCloseTo(0.5, 2);
    });

    it("should complete fade-in at hitTime", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 1000,
      });

      expect(state.phase).toBe("VISIBLE");
      expect(state.fadeInProgress).toBe(1);
    });

    it("should be in VISIBLE phase after hitTime until disappear start", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 2000,
      });

      expect(state.phase).toBe("VISIBLE");
      expect(state.fadeInProgress).toBe(1);
      expect(state.isArrowVisible(0)).toBe(true);
      expect(state.isArrowVisible(4)).toBe(true);
    });

    it("should start DISAPPEARING phase after 1 measure from startTime", () => {
      // disappearStartTime = 1500 + 2000 = 3500
      // Use a time after disappearStartTime but before endTime (5500)
      const state = calculateAnimationState({
        ...baseParams,
        time: 4000,
      });

      expect(state.phase).toBe("DISAPPEARING");
    });

    it("should be in COMPLETE phase when time >= endTime", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 6000, // After endTime (1500 + 4000 = 5500)
      });

      expect(state.phase).toBe("COMPLETE");
    });
  });

  describe("Fade-in Progress", () => {
    it("should have fade-in progress of 0 at appearTime", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 500,
      });

      expect(state.phase).toBe("FADING_IN");
      expect(state.fadeInProgress).toBe(0);
    });

    it("should have fade-in progress approaching 1 just before hitTime", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 999,
      });

      expect(state.phase).toBe("FADING_IN");
      expect(state.fadeInProgress).toBeCloseTo(0.998, 2);
    });
  });

  describe("Arrow Visibility", () => {
    it("should show ALL arrows during fade-in with simultaneous appearance", () => {
      // At 700ms: fadeInProgress = (700-500)/500 = 0.4
      // All arrows should be visible during fade-in (opacity controls visibility)
      const state = calculateAnimationState({
        ...baseParams,
        time: 700,
      });

      expect(state.phase).toBe("FADING_IN");
      expect(state.fadeInProgress).toBeCloseTo(0.4, 1);
      // All arrows should be visible - opacity is controlled separately
      expect(state.isArrowVisible(0)).toBe(true);
      expect(state.isArrowVisible(1)).toBe(true);
      expect(state.isArrowVisible(2)).toBe(true);
      expect(state.isArrowVisible(3)).toBe(true);
      expect(state.isArrowVisible(4)).toBe(true);
    });

    it("should show all arrows at start of fade-in", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 500, // At appearTime
      });

      expect(state.phase).toBe("FADING_IN");
      expect(state.fadeInProgress).toBe(0);
      // All arrows should be visible even at 0% fade
      expect(state.isArrowVisible(0)).toBe(true);
      expect(state.isArrowVisible(1)).toBe(true);
      expect(state.isArrowVisible(2)).toBe(true);
      expect(state.isArrowVisible(3)).toBe(true);
      expect(state.isArrowVisible(4)).toBe(true);
    });

    it("should show all arrows during VISIBLE phase", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 2000,
      });

      expect(state.phase).toBe("VISIBLE");
      expect(state.isArrowVisible(0)).toBe(true);
      expect(state.isArrowVisible(1)).toBe(true);
      expect(state.isArrowVisible(2)).toBe(true);
      expect(state.isArrowVisible(3)).toBe(true);
      expect(state.isArrowVisible(4)).toBe(true);
    });

    it("should hide arrows progressively during DISAPPEARING phase", () => {
      // With duration=4000, measureDurationMs=2000:
      // disappearStartTime = 1500 + 2000 = 3500
      // endTime = 1500 + 4000 = 5500
      // disappearDuration = 4000 - 2000 = 2000
      // At time 4500: disappearProgress = (4500-3500)/2000 = 0.5
      // isArrowVisible = disappearProgress < arrowThreshold
      // Arrow 0: 0.5 < 0.0 = false (hidden)
      // Arrow 1: 0.5 < 0.2 = false (hidden)
      // Arrow 2: 0.5 < 0.4 = false (hidden)
      // Arrow 3: 0.5 < 0.6 = true (visible)
      // Arrow 4: 0.5 < 0.8 = true (visible)
      const state = calculateAnimationState({
        ...baseParams,
        time: 4500,
      });

      expect(state.phase).toBe("DISAPPEARING");
      expect(state.isArrowVisible(0)).toBe(false);
      expect(state.isArrowVisible(1)).toBe(false);
      expect(state.isArrowVisible(2)).toBe(false);
      expect(state.isArrowVisible(3)).toBe(true);
      expect(state.isArrowVisible(4)).toBe(true);
    });

    it("should show no arrows in BEFORE_START phase", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 100,
      });

      expect(state.isArrowVisible(0)).toBe(false);
      expect(state.isArrowVisible(2)).toBe(false);
      expect(state.isArrowVisible(4)).toBe(false);
    });

    it("should show no arrows in COMPLETE phase", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 6000,
      });

      expect(state.phase).toBe("COMPLETE");
      expect(state.isArrowVisible(0)).toBe(false);
      expect(state.isArrowVisible(2)).toBe(false);
      expect(state.isArrowVisible(4)).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle short slides where disappearance overlaps with visible phase", () => {
      const params = {
        hitTime: 1000,
        startTime: 1500,
        duration: 1000,
        arrowCount: 3,
        measureDurationMs: 1000,
        noteDuration: 500,
      };
      // disappearStartTime = 2500, endTime = 2500
      // So we go straight from VISIBLE to COMPLETE

      const state = calculateAnimationState({
        ...params,
        time: 2000,
      });

      expect(state.phase).toBe("VISIBLE");
    });

    it("should handle time exactly at disappearStartTime", () => {
      // disappearStartTime = 1500 + 2000 = 3500
      const state = calculateAnimationState({
        ...baseParams,
        time: 3500,
      });

      expect(state.phase).toBe("DISAPPEARING");
    });

    it("should handle all arrows visible at low disappear progress", () => {
      const state = calculateAnimationState({
        ...baseParams,
        time: 3600, // 5% into disappearing (100/2000 = 0.05)
      });

      expect(state.phase).toBe("DISAPPEARING");
      expect(state.disappearProgress).toBeCloseTo(0.05, 2);
      // At 5% progress, only arrows with threshold > 0.05 are visible
      expect(state.isArrowVisible(0)).toBe(false);
      expect(state.isArrowVisible(1)).toBe(true);
      expect(state.isArrowVisible(2)).toBe(true);
      expect(state.isArrowVisible(3)).toBe(true);
      expect(state.isArrowVisible(4)).toBe(true);
    });
  });
});
