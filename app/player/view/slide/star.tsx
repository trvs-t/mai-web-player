import { Graphics } from "@pixi/react";
import { useLaneMovement } from "../../animation/lane";
import { SlideVisualizationData } from "../../data/visualization";
import { drawStar } from "../graphics";

// TODO: rotation speed
export function Star({ data }: { data: SlideVisualizationData }) {
  const { hitTime } = data;
  const { displacement, isStart, isHit } = useLaneMovement(hitTime);

  if (!isStart || isHit) return null;

  return <Graphics draw={drawStar} anchor={0.5} position={[0, displacement]} />;
}
