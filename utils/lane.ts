export type Lane = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function getLaneRotationRadian(lane: Lane | number) {
  const laneNumber = lane % 8;
  return (11 / 16 - laneNumber / 8) * Math.PI * 2;
}
