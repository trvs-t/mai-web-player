import { describe, it, expect } from "bun:test";
import {
  getLaneRotationRadian,
  getLaneDifference,
  getLanePosition,
  type Lane,
} from "../../../utils/lane";

describe("Lane Rotation", () => {
  it("should calculate rotation for lane 1", () => {
    const rotation = getLaneRotationRadian(1);
    expect(rotation).toBeCloseTo((1 / 8 + 7 / 16) * Math.PI * 2);
  });

  it("should calculate rotation for lane 8", () => {
    const rotation = getLaneRotationRadian(8);
    // Lane 8 % 8 = 0, so it's at position 0 in the circle
    expect(rotation).toBeCloseTo((0 / 8 + 7 / 16) * Math.PI * 2);
  });

  it("should handle lane numbers greater than 8", () => {
    const rotation9 = getLaneRotationRadian(9);
    const rotation1 = getLaneRotationRadian(1);
    expect(rotation9).toBeCloseTo(rotation1);
  });
});

describe("Lane Position", () => {
  it("should calculate position for lane 1 with radius 100", () => {
    const pos = getLanePosition(1, 100);
    const angle = getLaneRotationRadian(1);
    expect(pos.x).toBeCloseTo(100 * Math.cos(angle));
    expect(pos.y).toBeCloseTo(100 * Math.sin(angle));
  });

  it("should calculate position for all 8 lanes with radius 200", () => {
    for (let lane = 1; lane <= 8; lane++) {
      const pos = getLanePosition(lane as Lane, 200);
      const angle = getLaneRotationRadian(lane);
      expect(pos.x).toBeCloseTo(200 * Math.cos(angle));
      expect(pos.y).toBeCloseTo(200 * Math.sin(angle));
    }
  });

  it("should calculate position for lane 1 with different radii", () => {
    const radii = [100, 200, 300];
    for (const radius of radii) {
      const pos = getLanePosition(1, radius);
      const angle = getLaneRotationRadian(1);
      expect(pos.x).toBeCloseTo(radius * Math.cos(angle));
      expect(pos.y).toBeCloseTo(radius * Math.sin(angle));
    }
  });

  it("should return origin when radius is 0", () => {
    const pos = getLanePosition(1, 0);
    expect(pos.x).toBeCloseTo(0);
    expect(pos.y).toBeCloseTo(0);
  });

  it("should handle negative radius correctly", () => {
    const pos = getLanePosition(1, -100);
    const angle = getLaneRotationRadian(1);
    expect(pos.x).toBeCloseTo(-100 * Math.cos(angle));
    expect(pos.y).toBeCloseTo(-100 * Math.sin(angle));
  });
});

describe("Lane Difference", () => {
  it("should calculate difference between adjacent lanes", () => {
    expect(getLaneDifference(1, 2)).toBe(1);
    expect(getLaneDifference(2, 3)).toBe(1);
  });

  it("should calculate difference between opposite lanes", () => {
    expect(getLaneDifference(1, 5)).toBe(4);
    expect(getLaneDifference(2, 6)).toBe(4);
  });

  it("should handle wrap-around difference", () => {
    expect(getLaneDifference(8, 1)).toBe(1);
    expect(getLaneDifference(7, 2)).toBe(3);
    expect(getLaneDifference(8, 3)).toBe(3);
  });

  it("should return 0 when lanes are the same", () => {
    expect(getLaneDifference(1, 1)).toBe(0);
    expect(getLaneDifference(5, 5)).toBe(0);
  });

  it("should calculate all lane differences from lane 1", () => {
    const expectedDiffs = [0, 1, 2, 3, 4, 5, 6, 7];
    for (let lane = 1; lane <= 8; lane++) {
      expect(getLaneDifference(1, lane)).toBe(expectedDiffs[lane - 1]);
    }
  });
});

describe("Progress-Based Position", () => {
  const getProgressPosition = (
    lane: Lane | number,
    radius: number,
    progress: number,
  ) => {
    return getLanePosition(lane, radius * progress);
  };

  it("should position at center when progress is 0", () => {
    for (let lane = 1; lane <= 8; lane++) {
      const pos = getProgressPosition(lane as Lane, 200, 0);
      expect(pos.x).toBeCloseTo(0, 10);
      expect(pos.y).toBeCloseTo(0, 10);
    }
  });

  it("should position at half radius when progress is 0.5", () => {
    const radius = 200;
    const progress = 0.5;
    for (let lane = 1; lane <= 8; lane++) {
      const pos = getProgressPosition(lane as Lane, radius, progress);
      const angle = getLaneRotationRadian(lane);
      const expectedRadius = radius * progress;
      expect(pos.x).toBeCloseTo(expectedRadius * Math.cos(angle));
      expect(pos.y).toBeCloseTo(expectedRadius * Math.sin(angle));
    }
  });

  it("should position at full radius when progress is 1", () => {
    const radius = 200;
    const progress = 1;
    for (let lane = 1; lane <= 8; lane++) {
      const pos = getProgressPosition(lane as Lane, radius, progress);
      const angle = getLaneRotationRadian(lane);
      expect(pos.x).toBeCloseTo(radius * Math.cos(angle));
      expect(pos.y).toBeCloseTo(radius * Math.sin(angle));
    }
  });

  it("should extend beyond radius when progress > 1", () => {
    const radius = 200;
    const progress = 1.5;
    for (let lane = 1; lane <= 8; lane++) {
      const pos = getProgressPosition(lane as Lane, radius, progress);
      const angle = getLaneRotationRadian(lane);
      const expectedRadius = radius * progress;
      expect(pos.x).toBeCloseTo(expectedRadius * Math.cos(angle));
      expect(pos.y).toBeCloseTo(expectedRadius * Math.sin(angle));
    }
  });

  it("should handle negative progress", () => {
    const radius = 200;
    const progress = -0.5;
    for (let lane = 1; lane <= 8; lane++) {
      const pos = getProgressPosition(lane as Lane, radius, progress);
      const angle = getLaneRotationRadian(lane);
      const expectedRadius = radius * progress;
      expect(pos.x).toBeCloseTo(expectedRadius * Math.cos(angle));
      expect(pos.y).toBeCloseTo(expectedRadius * Math.sin(angle));
    }
  });
});

describe("All Lanes Polar Coordinates", () => {
  it("should verify all 8 lanes are positioned correctly on circle", () => {
    const radius = 300;
    const positions = [];

    for (let lane = 1; lane <= 8; lane++) {
      const pos = getLanePosition(lane as Lane, radius);
      positions.push(pos);

      // Verify distance from origin equals radius
      const distance = Math.sqrt(pos.x ** 2 + pos.y ** 2);
      expect(distance).toBeCloseTo(radius);
    }

    // Verify lanes are 45 degrees apart
    for (let i = 0; i < 8; i++) {
      const angle1 = Math.atan2(positions[i].y, positions[i].x);
      const angle2 = Math.atan2(
        positions[(i + 1) % 8].y,
        positions[(i + 1) % 8].x,
      );
      const angleDiff = Math.abs(angle2 - angle1);
      const normalizedDiff =
        angleDiff > Math.PI ? 2 * Math.PI - angleDiff : angleDiff;
      expect(normalizedDiff).toBeCloseTo(Math.PI / 4); // 45 degrees
    }
  });
});
