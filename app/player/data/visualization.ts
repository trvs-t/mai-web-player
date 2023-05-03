import { SlideType } from "./chart";

export interface SlideVisualizationData {
  hitTime: number;
  startTime: number;
  duration: number;
  rotation: number;
  type: SlideType;
  destinationDifference: number;
}

export interface HoldVisualizeData {
  hitTime: number;
  duration: number;
}
