export type AngledPoint = {
  id: number;
  point: [number, number];
  angle: number;
};

// TODO split with segment length instead of points count
export function splitPath(
  p: SVGPathElement,
  pointsCount: number
): { id: number; point: [number, number]; angle: number }[] {
  const pLength = p.getTotalLength();
  const pieceSize = pLength / pointsCount;

  var points: [number, number][] = [];
  for (let i = 0; i <= pLength; i += pieceSize) {
    const point = p.getPointAtLength(i);
    points.push([point.x, point.y]);
  }
  const pieces = points.map((point, i) => {
    const [currentPoint, nextPoint] =
      i === points.length - 1 ? [points[i - 1], point] : [point, points[i + 1]];
    const angle =
      Math.atan2(
        nextPoint[1] - currentPoint[1],
        nextPoint[0] - currentPoint[0]
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
