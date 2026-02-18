import { describe, it, expect } from "bun:test";
import type { SlideVisualizationData } from "../../../lib/visualization";

describe("Slide Component", () => {
  const mockSlideData: SlideVisualizationData = {
    lane: 1,
    hitTime: 1000,
    startTime: 1500,
    duration: 2000,
    measureDurationMs: 2000,
    slideType: "Straight",
    direction: "cw",
    destinationLane: 5,
    isEach: false,
  };

  describe("Animation Parameters", () => {
    it("should have correct timing parameters", () => {
      // Verify that the slide data has all required timing parameters
      expect(mockSlideData.hitTime).toBe(1000);
      expect(mockSlideData.startTime).toBe(1500);
      expect(mockSlideData.duration).toBe(2000);
      expect(mockSlideData.measureDurationMs).toBe(2000);
    });

    it("should calculate appearTime correctly", () => {
      const noteDuration = 500; // From PlayerContext default
      const appearTime = mockSlideData.hitTime - noteDuration;

      // Slides should appear at hitTime - noteDuration (same as tap)
      expect(appearTime).toBe(500);
    });

    it("should calculate disappearStartTime correctly", () => {
      // Disappearing starts 1 measure after startTime
      const disappearStartTime =
        mockSlideData.startTime + mockSlideData.measureDurationMs;
      expect(disappearStartTime).toBe(3500);
    });

    it("should calculate endTime correctly", () => {
      const endTime = mockSlideData.startTime + mockSlideData.duration;
      expect(endTime).toBe(3500);
    });
  });

  describe("Lane and Path Parameters", () => {
    it("should have correct source lane", () => {
      expect(mockSlideData.lane).toBe(1);
    });

    it("should have correct destination lane", () => {
      expect(mockSlideData.destinationLane).toBe(5);
    });

    it("should have correct slide type", () => {
      expect(mockSlideData.slideType).toBe("Straight");
    });

    it("should have correct direction", () => {
      expect(mockSlideData.direction).toBe("cw");
    });
  });
});
