export type Lane = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function getLaneRotationRadian(lane: Lane | number) {
  const laneNumber = lane % 8;
  return (laneNumber / 8 + 7 / 16) * Math.PI * 2;
}

export function getLaneDifference(lane1: number, lane2: number) {
  const diff = lane2 - lane1;
  if (diff < 0) return diff + 8;
  return diff;
}

export function getLanePosition(lane: Lane | number, radius: number) {
  const angle = getLaneRotationRadian(lane);
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}
