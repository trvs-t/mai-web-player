export type AngledPoint = {
  id: number;
  point: [number, number];
  angle: number;
};

export function splitPath(
  path: SVGPathElement,
  segmentLength: number,
): { id: number; point: [number, number]; angle: number }[] {
  const pathLength = path.getTotalLength();

  var points: [number, number][] = [];
  for (let i = 0; i <= pathLength; i += segmentLength) {
    const point = path.getPointAtLength(Math.min(i, pathLength));
    points.push([point.x, point.y]);
  }
  const pieces = points.map((point, i) => {
    const [currentPoint, nextPoint] =
      i === points.length - 1 ? [points[i - 1], point] : [point, points[i + 1]];
    const angle =
      Math.atan2(
        nextPoint[1] - currentPoint[1],
        nextPoint[0] - currentPoint[0],
      ) +
      (Math.PI / 2) * 3;
    return {
      id: i,
      point,
      angle,
    };
  });
  return pieces;
}
