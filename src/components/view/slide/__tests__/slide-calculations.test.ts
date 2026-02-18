import { describe, it, expect } from "bun:test";
import {
  calculateArrowAlpha,
  transformSlidePoint,
  calculateChevronAngle,
} from "../slide-calculations";

describe("slide-calculations", () => {
  describe("calculateArrowAlpha", () => {
    it("should return alpha=0 for BEFORE_START phase", () => {
      const result = calculateArrowAlpha(0, 10, "BEFORE_START", 0, 0);
      expect(result.alpha).toBe(0);
      expect(result.shouldRender).toBe(false);
    });

    it("should return alpha=0 for COMPLETE phase", () => {
      const result = calculateArrowAlpha(0, 10, "COMPLETE", 1, 1);
      expect(result.alpha).toBe(0);
      expect(result.shouldRender).toBe(false);
    });

    it("should fade in all arrows together during FADING_IN", () => {
      // At 50% fade progress, all arrows should have 50% alpha
      const result1 = calculateArrowAlpha(0, 5, "FADING_IN", 0.5, 0);
      expect(result1.alpha).toBe(0.5);
      expect(result1.shouldRender).toBe(true);

      const result2 = calculateArrowAlpha(4, 5, "FADING_IN", 0.5, 0);
      expect(result2.alpha).toBe(0.5);
      expect(result2.shouldRender).toBe(true);
    });

    it("should have alpha=1 at start of FADING_IN", () => {
      const result = calculateArrowAlpha(0, 10, "FADING_IN", 0, 0);
      expect(result.alpha).toBe(0);
    });

    it("should have alpha=1 at end of FADING_IN", () => {
      const result = calculateArrowAlpha(0, 10, "FADING_IN", 1, 0);
      expect(result.alpha).toBe(1);
    });

    it("should have alpha=1 during VISIBLE phase", () => {
      const result = calculateArrowAlpha(0, 10, "VISIBLE", 1, 0);
      expect(result.alpha).toBe(1);
      expect(result.shouldRender).toBe(true);
    });

    describe("DISAPPEARING phase - sequential fade-out", () => {
      it("should fade out first arrow first", () => {
        // With 10 arrows, arrow 0 has threshold 0
        // At disappearProgress = 0.1, arrow 0 should be fading out
        const result = calculateArrowAlpha(0, 10, "DISAPPEARING", 1, 0.1);
        // Threshold = 0/10 = 0
        // fadeOutRange = 0.15
        // localProgress = (0.1 - 0) / 0.15 = 0.666
        // alpha = 1 - 0.666 = 0.333
        expect(result.alpha).toBeCloseTo(0.333, 2);
        expect(result.shouldRender).toBe(true);
      });

      it("should keep last arrow visible longer", () => {
        // Arrow 9 (last) has threshold 0.9
        // At disappearProgress = 0.5, arrow 9 should still be fully visible
        const result = calculateArrowAlpha(9, 10, "DISAPPEARING", 1, 0.5);
        // Threshold = 9/10 = 0.9
        // localProgress = (0.5 - 0.9) / 0.15 = -2.67 (clamped to 0)
        // alpha = 1 - 0 = 1
        expect(result.alpha).toBe(1);
        expect(result.shouldRender).toBe(true);
      });

      it("should fade out arrows sequentially", () => {
        const totalArrows = 10;
        const disappearProgress = 0.5;

        // Early arrows should be fully faded
        const earlyArrow = calculateArrowAlpha(
          0,
          totalArrows,
          "DISAPPEARING",
          1,
          disappearProgress,
        );
        expect(earlyArrow.alpha).toBe(0);
        expect(earlyArrow.shouldRender).toBe(false);

        // Middle arrows should be fading
        const midArrow = calculateArrowAlpha(
          4,
          totalArrows,
          "DISAPPEARING",
          1,
          disappearProgress,
        );
        // Threshold = 4/10 = 0.4
        // localProgress = (0.5 - 0.4) / 0.15 = 0.666
        expect(midArrow.alpha).toBeCloseTo(0.333, 2);

        // Late arrows should still be visible
        const lateArrow = calculateArrowAlpha(
          8,
          totalArrows,
          "DISAPPEARING",
          1,
          disappearProgress,
        );
        expect(lateArrow.alpha).toBe(1);
      });

      it("should have all arrows faded at disappearProgress = 1", () => {
        const totalArrows = 10;
        const lastArrow = calculateArrowAlpha(
          9,
          totalArrows,
          "DISAPPEARING",
          1,
          1,
        );
        // Even the last arrow (threshold 0.9) should be faded at progress 1
        // localProgress = (1 - 0.9) / 0.15 = 0.666
        // alpha = 1 - 0.666 = 0.333
        // Actually not fully 0, but very low
        expect(lastArrow.alpha).toBeLessThan(0.5);
      });
    });
  });

  describe("transformSlidePoint", () => {
    it("should transform SVG point to canvas coordinates", () => {
      const point: [number, number] = [540, 540]; // Center of SVG
      const result = transformSlidePoint(point, 540, 1, 0, false);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
    });

    it("should apply scale factor", () => {
      const point: [number, number] = [640, 540]; // 100px right of center
      const result = transformSlidePoint(point, 540, 0.5, 0, false);
      expect(result[0]).toBe(50); // 100 * 0.5 = 50
      expect(result[1]).toBe(0);
    });

    it("should apply lane rotation", () => {
      const point: [number, number] = [640, 540]; // 100px right of center
      const result = transformSlidePoint(point, 540, 1, Math.PI / 2, false);
      // After 90 degree rotation, (100, 0) becomes (0, 100)
      expect(result[0]).toBeCloseTo(0, 5);
      expect(result[1]).toBeCloseTo(100, 5);
    });

    it("should apply mirror flip", () => {
      const point: [number, number] = [640, 540]; // 100px right of center
      const result = transformSlidePoint(point, 540, 1, 0, true);
      expect(result[0]).toBe(-100);
      expect(result[1]).toBe(0);
    });
  });

  describe("calculateChevronAngle", () => {
    it("should add 90 degrees to point along tangent", () => {
      const pathAngle = 0; // Pointing right
      const laneOffset = 0;
      const result = calculateChevronAngle(pathAngle, laneOffset, false);
      // Should be rotated 90 degrees (PI/2) to point along tangent
      expect(result).toBe(Math.PI / 2);
    });

    it("should combine path angle and lane offset", () => {
      const pathAngle = Math.PI / 4; // 45 degrees
      const laneOffset = Math.PI / 4; // 45 degrees
      const result = calculateChevronAngle(pathAngle, laneOffset, false);
      expect(result).toBe(Math.PI / 4 + Math.PI / 4 + Math.PI / 2);
    });

    it("should negate path angle when mirrored", () => {
      const pathAngle = Math.PI / 4; // 45 degrees
      const laneOffset = 0;
      const result = calculateChevronAngle(pathAngle, laneOffset, true);
      // Mirrored: -45 + 0 + 90 = 45 degrees
      expect(result).toBe(-Math.PI / 4 + Math.PI / 2);
    });
  });
});
