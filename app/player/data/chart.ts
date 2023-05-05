export interface DurationInBpm {
  bpm?: number;
  division: number;
  divisionCount: number;
}

export interface TapChartData {
  type: "tap";
  lane: number;
}

export interface HoldChartData {
  type: "hold";
  duration: DurationInBpm;
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
  duration: DurationInBpm;
  lane: number;
  slideType: SlideType;
  direction: "cw" | "ccw";
  destinationLane: number;
}

export interface TimeSignature {
  bpm: number;
  division: number;
}

export interface Rest {
  divisionCount: number;
}

export type NoteData = TapChartData | HoldChartData | SlideChartData;

export type ChartItem =
  | { type: "note"; data: NoteData }
  | { type: "rest"; data: Rest }
  | { type: "timeSignature"; data: TimeSignature };

export interface ChartMetadata {
  title: string;
}
export interface Chart {
  items: (ChartItem | { type: "note"; data: NoteData }[])[];
  metadata: ChartMetadata;
}

export function validateChart(chart: Chart): boolean {
  const firstItem = chart.items[0];
  return !Array.isArray(firstItem) && firstItem.type === "timeSignature";
}

export function tap(lane: number) {
  return {
    type: "note" as const,
    data: {
      type: "tap",
      lane,
    } as TapChartData,
  };
}

function hold(lane: number, duration: DurationInBpm) {
  return {
    type: "note" as const,
    data: {
      type: "hold",
      lane,
      duration,
    } as HoldChartData,
  };
}

function slide(
  lane: number,
  duration: DurationInBpm,
  slideType: SlideType,
  direction: "cw" | "ccw",
  destinationLane: number
) {
  return {
    type: "note" as const,
    data: {
      type: "slide",
      lane,
      duration,
      slideType,
      direction,
      destinationLane,
    } as SlideChartData,
  };
}

function rest(divisionCount: number): ChartItem {
  return {
    type: "rest",
    data: {
      divisionCount,
    } as Rest,
  };
}

export const testChart: Chart = {
  metadata: {
    title: "Test Chart",
  },
  items: [
    {
      type: "timeSignature",
      data: {
        bpm: 120,
        division: 4,
      },
    },
    rest(4),
    [tap(1), tap(8)],
    tap(1),
    tap(1),
    tap(1),
    tap(1),
    tap(1),
    tap(1),
    tap(1),
    tap(1),
    tap(1),
    // hold(1, { division: 8, divisionCount: 6 }),
    // tap(2),
    // tap(3),
    // tap(4),
    // tap(5),
    // tap(6),
    // tap(7),
    // slide(7, { division: 8, divisionCount: 4 }, "CUP", "cw", 3),
    // rest(1),
    // tap(8),
  ],
};
