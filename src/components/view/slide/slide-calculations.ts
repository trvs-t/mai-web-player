export interface ArrowRenderParams {
  alpha: number;
  shouldRender: boolean;
}

// Maximum wait time before starting to disappear (as fraction of duration)
// This ensures short slides still have time for sequential fade
const MAX_WAIT_FRACTION = 0.5; // Wait at most 50% of duration

export function calculateDisappearProgress(
  time: number,
  startTime: number,
  duration: number,
  measureDurationMs: number,
): { phase: "VISIBLE" | "DISAPPEARING" | "COMPLETE"; progress: number } {
  const endTime = startTime + duration;

  // Cap wait time to ensure we have time for sequential fade
  // Wait at most MAX_WAIT_FRACTION of duration, but not more than measureDurationMs
  const actualWaitTime = Math.min(measureDurationMs, duration * MAX_WAIT_FRACTION);
  const disappearStartTime = startTime + actualWaitTime;
  const disappearDuration = endTime - disappearStartTime;

  if (time >= endTime) {
    return { phase: "COMPLETE", progress: 1 };
  }

  if (time < disappearStartTime) {
    return { phase: "VISIBLE", progress: 0 };
  }

  // Calculate progress through disappearing phase (0 to 1)
  const progress = disappearDuration > 0
    ? (time - disappearStartTime) / disappearDuration
    : 1;

  return { phase: "DISAPPEARING", progress: Math.min(1, progress) };
}

export function calculateArrowAlpha(
  arrowIndex: number,
  totalArrows: number,
  phase: "FADING_IN" | "VISIBLE" | "DISAPPEARING" | "BEFORE_START" | "COMPLETE",
  fadeInProgress: number,
  disappearProgress: number,
): ArrowRenderParams {
  if (phase === "BEFORE_START" || phase === "COMPLETE") {
    return { alpha: 0, shouldRender: false };
  }

  if (phase === "FADING_IN") {
    const alpha = Math.max(0, Math.min(1, fadeInProgress));
    return { alpha, shouldRender: alpha > 0 };
  }

  if (phase === "VISIBLE") {
    return { alpha: 1, shouldRender: true };
  }

  // DISAPPEARING: arrows fade out sequentially
  const arrowThreshold = arrowIndex / totalArrows;
  const fadeOutRange = 0.15;

  // Calculate local progress for this arrow's fade-out
  // At arrowThreshold: alpha = 1 (fully visible)
  // At arrowThreshold + fadeOutRange: alpha = 0 (fully invisible)
  const localProgress = (disappearProgress - arrowThreshold) / fadeOutRange;
  const alpha = Math.max(0, Math.min(1, 1 - localProgress));

  return { alpha, shouldRender: alpha > 0 };
}

export function transformSlidePoint(
  point: [number, number],
  svgCenter: number,
  scaleFactor: number,
  laneOffsetAngle: number,
  mirror: boolean,
): [number, number] {
  // Transform from SVG coordinates to canvas coordinates
  let x = (point[0] - svgCenter) * scaleFactor;
  let y = (point[1] - svgCenter) * scaleFactor;

  // Apply lane rotation
  const cos = Math.cos(laneOffsetAngle);
  const sin = Math.sin(laneOffsetAngle);
  const rotatedX = x * cos - y * sin;
  const rotatedY = x * sin + y * cos;

  x = rotatedX;
  y = rotatedY;

  // Apply mirror flip for clockwise slides
  if (mirror) {
    x = -x;
  }

  return [x, y];
}

export function calculateChevronAngle(
  pathAngle: number,
  laneOffsetAngle: number,
): number {
  // The path angle is the tangent direction
  // We need to rotate the chevron 90 degrees CW so it points along the tangent
  // instead of pointing toward the center
  return pathAngle + laneOffsetAngle + Math.PI / 2;
}
