import { describe, it, expect } from "bun:test";
import {
  getSlidePathIndex,
  getSlidePathId,
  slidePathData,
} from "../slide-paths";
import type { SlideType } from "../chart";

describe("slide-paths", () => {
  describe("getSlidePathIndex", () => {
    describe("L slides - indexed by distance from midpoint", () => {
      it("should return correct index for CW L-slide 1V35 (distance 2)", () => {
        const result = getSlidePathIndex({
          slideType: "L",
          destinationDifference: 4, // lane 1 -> lane 5
          direction: "cw",
          lane: 1,
        });
        // mid = 3, dest = 5, distance = 2, pathIndex = 0, reversed for CW = 3
        expect(result).toBe(3);
      });

      it("should return correct index for CW L-slide 2V46 (distance 2)", () => {
        const result = getSlidePathIndex({
          slideType: "L",
          destinationDifference: 4, // lane 2 -> lane 6
          direction: "cw",
          lane: 2,
        });
        expect(result).toBe(3);
      });

      it("should return correct index for CW L-slide 1V38 (distance 5)", () => {
        const result = getSlidePathIndex({
          slideType: "L",
          destinationDifference: 7, // lane 1 -> lane 8
          direction: "cw",
          lane: 1,
        });
        // mid = 3, dest = 8, distance = 5, pathIndex = 3, reversed for CW = 0
        expect(result).toBe(0);
      });

      it("should return correct index for CCW L-slide 1V75 (distance 2)", () => {
        const result = getSlidePathIndex({
          slideType: "L",
          destinationDifference: 4, // lane 1 -> lane 5
          direction: "ccw",
          lane: 1,
        });
        // mid = 7, dest = 5, distance = 2, pathIndex = 0
        expect(result).toBe(0);
      });

      it("should return correct index for CCW L-slide 1V75 (distance 2)", () => {
        const result = getSlidePathIndex({
          slideType: "L",
          destinationDifference: 4,
          direction: "ccw",
          lane: 1,
        });
        expect(result).toBe(0);
      });

      it("should return -1 for invalid L-slide destination (distance < 2)", () => {
        const result = getSlidePathIndex({
          slideType: "L",
          destinationDifference: 1, // Would give distance 0 or 1
          direction: "cw",
          lane: 1,
        });
        expect(result).toBe(-1);
      });

      it("should return -1 for invalid L-slide destination (distance > 5)", () => {
        const result = getSlidePathIndex({
          slideType: "L",
          destinationDifference: 0, // Would give distance -1 or wrap to 7
          direction: "cw",
          lane: 1,
        });
        expect(result).toBe(-1);
      });
    });

    describe("Circle slides", () => {
      it("should return correct index for CCW circle", () => {
        const result = getSlidePathIndex({
          slideType: "Circle",
          destinationDifference: 2,
          direction: "ccw",
          lane: 1,
        });
        expect(result).toBe(2);
      });

      it("should return correct index for CW circle (reversed)", () => {
        const result = getSlidePathIndex({
          slideType: "Circle",
          destinationDifference: 2,
          direction: "cw",
          lane: 1,
        });
        // (8 - 2) % 8 = 6
        expect(result).toBe(6);
      });
    });

    describe("Thunder slides", () => {
      it("should always return 0 for Thunder", () => {
        const result = getSlidePathIndex({
          slideType: "Thunder",
          destinationDifference: 4,
          direction: "cw",
          lane: 1,
        });
        expect(result).toBe(0);
      });
    });

    describe("V slides", () => {
      it("should return correct index for V-slide to lane 2", () => {
        const result = getSlidePathIndex({
          slideType: "V",
          destinationDifference: 1,
          direction: "ccw",
          lane: 1,
        });
        expect(result).toBe(1);
      });

      it("should return correct index for V-slide to lane 5 (null path)", () => {
        const result = getSlidePathIndex({
          slideType: "V",
          destinationDifference: 4,
          direction: "ccw",
          lane: 1,
        });
        expect(result).toBe(4);
      });
    });

    describe("Lower half lane direction flip", () => {
      it("should flip direction for lane 3 (lower half)", () => {
        const resultCCW = getSlidePathIndex({
          slideType: "Circle",
          destinationDifference: 2,
          direction: "ccw",
          lane: 3,
        });
        // CCW becomes CW for lower half
        expect(resultCCW).toBe(6);
      });

      it("should not flip direction for lane 1 (upper half)", () => {
        const resultCCW = getSlidePathIndex({
          slideType: "Circle",
          destinationDifference: 2,
          direction: "ccw",
          lane: 1,
        });
        expect(resultCCW).toBe(2);
      });
    });
  });

  describe("getSlidePathId", () => {
    it("should return path ID for valid index", () => {
      const result = getSlidePathId("L", 0);
      expect(result).toBe("L_x5F_2");
    });

    it("should return null for V-slide to lane 5 (index 4)", () => {
      const result = getSlidePathId("V", 4);
      expect(result).toBeNull();
    });

    it("should return undefined for invalid index", () => {
      const result = getSlidePathId("L", 10);
      expect(result).toBeUndefined();
    });

    it("should return undefined for negative index", () => {
      const result = getSlidePathId("L", -1);
      expect(result).toBeUndefined();
    });
  });

  describe("slidePathData", () => {
    it("should have correct number of paths for each slide type", () => {
      expect(slidePathData.L.paths.length).toBe(4);
      expect(slidePathData.V.paths.length).toBe(8);
      expect(slidePathData.Circle.paths.length).toBe(8);
      expect(slidePathData.Thunder.paths.length).toBe(1);
    });

    it("should have correct diffIndexOffset for L slides", () => {
      expect(slidePathData.L.diffIndexOffset).toBe(1);
    });
  });
});
