export interface TapChartData {
  type: "tap";
  hitTime: number;
  lane: number;
}

export interface HoldChartData {
  type: "hold";
  hitTime: number;
  duration: number;
  lane: number;
}

export type SlideType =
  | "CUP"
  | "Circle"
  | "U"
  | "L"
  | "Thunder"
  | "V"
  | "Straight";

export interface SlideChartData {
  type: "slide";
  hitTime: number;
  startTime: number;
  duration: number;
  lane: number;
  slideType: SlideType;
  destinationLane: number;
}

export type ChartData = TapChartData | HoldChartData | SlideChartData;

export const testChart: ChartData[] = [
  {
    type: "hold",
    hitTime: 100,
    duration: 700,
    lane: 1,
  },
  {
    type: "tap",
    hitTime: 200,
    lane: 2,
  },
  {
    type: "tap",
    hitTime: 300,
    lane: 3,
  },
  {
    type: "tap",
    hitTime: 400,
    lane: 4,
  },
  {
    type: "tap",
    hitTime: 500,
    lane: 5,
  },
  {
    type: "tap",
    hitTime: 600,
    lane: 6,
  },
  {
    type: "tap",
    hitTime: 700,
    lane: 7,
  },
  {
    type: "tap",
    hitTime: 800,
    lane: 8,
  },
  {
    type: "slide",
    hitTime: 800,
    startTime: 1200,
    duration: 800,
    lane: 8,
    slideType: "CUP",
    destinationLane: 4,
  },
  {
    type: "tap",
    hitTime: 1200,
    lane: 8,
  },
];
