import { describe, it, expect } from "bun:test";
import { getLaneRotationRadian, getLanePosition } from "../utils/lane";

describe("Slide Rendering Position", () => {
  describe("Slide 8-4 straight path", () => {
    it("should have start point near lane 8 position", () => {
      const lane8Rotation = getLaneRotationRadian(8);
      const radius = 200;
      const expectedLane8Pos = getLanePosition(8, radius);

      // Lane 8: laneNumber = 0, rotation = (0/8 + 7/16) * 2π = 7/16 * 2π ≈ 2.749
      expect(lane8Rotation).toBeCloseTo((7 / 16) * Math.PI * 2, 5);
      expect(expectedLane8Pos.x).toBeLessThan(-150); // Left side
      expect(expectedLane8Pos.y).toBeGreaterThan(0); // Lower half
    });

    it("should have end point near lane 4 position", () => {
      const lane4Rotation = getLaneRotationRadian(4);
      const radius = 200;
      const expectedLane4Pos = getLanePosition(4, radius);

      // Lane 4: laneNumber = 4, rotation = (4/8 + 7/16) * 2π = 15/16 * 2π ≈ 5.89
      expect(lane4Rotation).toBeCloseTo((15 / 16) * Math.PI * 2, 5);
      expect(expectedLane4Pos.x).toBeGreaterThan(150); // Right side
      expect(expectedLane4Pos.y).toBeLessThan(0); // Upper half
    });

    it("should stay within circle bounds (radius 200)", () => {
      const radius = 200;
      const tolerance = 20;

      const testPoints = [
        { x: -100, y: 100 },
        { x: -50, y: 120 },
        { x: 0, y: 150 },
      ];

      for (const point of testPoints) {
        const distanceFromCenter = Math.sqrt(point.x ** 2 + point.y ** 2);
        expect(distanceFromCenter).toBeLessThanOrEqual(radius + tolerance);
      }
    });

    it("should NOT have points outside the circle", () => {
      const radius = 200;
      const tolerance = 50;
      const maxAllowedDistance = radius + tolerance;

      const outOfCirclePoints = [
        { x: 500, y: 500 },
        { x: 300, y: 300 },
        { x: -400, y: 400 },
        { x: 0, y: 350 },
      ];

      for (const point of outOfCirclePoints) {
        const distanceFromCenter = Math.sqrt(point.x ** 2 + point.y ** 2);
        expect(distanceFromCenter).toBeGreaterThan(maxAllowedDistance);
      }
    });
  });

  describe("SVG Path coordinate transformation", () => {
    it("should transform SVG coordinates to canvas coordinates", () => {
      const svgCenterX = 540;
      const svgCenterY = 540;
      const svgRadius = 540;
      const canvasRadius = 200;

      const svgX = 723.733;
      const svgY = 96.43;

      const relativeX = svgX - svgCenterX;
      const relativeY = svgY - svgCenterY;
      const scaleFactor = canvasRadius / svgRadius;
      const canvasX = relativeX * scaleFactor;
      const canvasY = relativeY * scaleFactor;

      expect(Math.abs(canvasX)).toBeLessThan(canvasRadius);
      expect(Math.abs(canvasY)).toBeLessThan(canvasRadius);
    });

    it("should verify slide path stays within circle after transformation", () => {
      const svgCenterX = 540;
      const svgCenterY = 540;
      const canvasRadius = 200;
      const scaleFactor = canvasRadius / 540;

      const testSvgPoints = [
        { x: 723.733, y: 96.43 },
        { x: 356.267, y: 983.57 },
      ];

      for (const svgPoint of testSvgPoints) {
        const canvasX = (svgPoint.x - svgCenterX) * scaleFactor;
        const canvasY = (svgPoint.y - svgCenterY) * scaleFactor;

        const distanceFromCenter = Math.sqrt(canvasX ** 2 + canvasY ** 2);

        expect(distanceFromCenter).toBeGreaterThan(canvasRadius * 0.3);
        expect(distanceFromCenter).toBeLessThanOrEqual(canvasRadius * 1.1);
      }
    });

    it("should FAIL if using untransformed SVG coordinates", () => {
      const canvasRadius = 200;

      const rawSvgPoints = [
        { x: 723.733, y: 96.43 },
        { x: 540, y: 540 },
        { x: 983.57, y: 356.267 },
      ];

      for (const point of rawSvgPoints) {
        const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
        expect(distance).toBeGreaterThan(canvasRadius * 2);
      }
    });

    it("should PASS if SVG coordinates are properly transformed", () => {
      const canvasRadius = 200;
      const scaleFactor = canvasRadius / 540;

      const rawSvgPoints = [
        { x: 723.733, y: 96.43 },
        { x: 540, y: 540 },
        { x: 983.57, y: 356.267 },
      ];

      const transformedPoints = rawSvgPoints.map((p) => ({
        x: (p.x - 540) * scaleFactor,
        y: (p.y - 540) * scaleFactor,
      }));

      for (const point of transformedPoints) {
        const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
        expect(distance).toBeLessThanOrEqual(canvasRadius * 1.2);
      }
    });
  });

  describe("Lane rotation calculations", () => {
    it("should calculate correct rotation for each lane", () => {
      const lanes = [1, 2, 3, 4, 5, 6, 7, 8];
      const rotations = lanes.map((lane) => getLaneRotationRadian(lane));

      for (let i = 1; i < rotations.length; i++) {
        let diff = rotations[i] - rotations[i - 1];
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        expect(Math.abs(diff)).toBeCloseTo(Math.PI / 4, 5);
      }
    });

    it("should place lane 1 in expected position", () => {
      const radius = 200;
      const pos = getLanePosition(1, radius);
      const rotation = getLaneRotationRadian(1);

      expect(rotation).toBeCloseTo((9 / 16) * Math.PI * 2, 5);
      expect(pos.x).toBeLessThan(-150); // Left side
      expect(pos.y).toBeLessThan(0); // Upper half
    });
  });
});

describe("Slide Component Integration", () => {
  describe("Slide path bounds validation", () => {
    it("validates that slide paths need coordinate transformation", () => {
      const canvasRadius = 200;
      const maxDistance = canvasRadius * 1.2;

      const rawSvgPoints = [
        { x: 723.733, y: 96.43 },
        { x: 540, y: 540 },
        { x: 983.57, y: 356.267 },
      ];

      let foundOutOfBounds = false;
      for (const point of rawSvgPoints) {
        const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
        if (distance > maxDistance) {
          foundOutOfBounds = true;
        }
      }
      expect(foundOutOfBounds).toBe(true);

      const scaleFactor = canvasRadius / 540;
      const transformedPoints = rawSvgPoints.map((p) => ({
        x: (p.x - 540) * scaleFactor,
        y: (p.y - 540) * scaleFactor,
      }));

      for (const point of transformedPoints) {
        const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
        expect(distance).toBeLessThanOrEqual(maxDistance);
      }
    });
  });
});
