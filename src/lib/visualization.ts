import { Chart, SlideType } from "./chart";

export interface SlideVisualizationData {
  lane: number;
  hitTime: number;
  startTime: number;
  duration: number;
  slideType: SlideType;
  direction: "cw" | "ccw";
  destinationLane: number;
  isEach?: boolean;
}

export interface HoldVisualizeData {
  lane: number;
  hitTime: number;
  duration: number;
  isEach?: boolean;
}

export interface TapVisualizeData {
  lane: number;
  hitTime: number;
  isEach?: boolean;
}

export type NoteVisualizationData =
  | TapVisualizeData
  | HoldVisualizeData
  | SlideVisualizationData;

export type NoteVisualization =
  | {
      type: "tap";
      data: TapVisualizeData;
    }
  | {
      type: "hold";
      data: HoldVisualizeData;
    }
  | {
      type: "slide";
      data: SlideVisualizationData;
    };

export function convertChartVisualizationData(chart: Chart) {
  let time = 0;
  const baseTimeSignature = chart.items[0];
  let currentBpm: number;
  let currentDivision: number;

  if (
    Array.isArray(baseTimeSignature) ||
    baseTimeSignature.type !== "timeSignature"
  ) {
    if (chart.metadata.bpm) {
      currentBpm = chart.metadata.bpm;
      currentDivision = 4;
    } else {
      throw new Error("Invalid chart");
    }
  } else {
    currentBpm = baseTimeSignature.data.bpm ?? chart.metadata.bpm ?? 120;
    currentDivision = baseTimeSignature.data.division;
  }

  let notes: NoteVisualization[] = [];

  for (const item of chart.items.slice(1)) {
    // time signature and rest should not be array
    if (!Array.isArray(item)) {
      const { type, data } = item;
      switch (type) {
        case "timeSignature":
          currentBpm = data.bpm ?? currentBpm;
          currentDivision = data.division;
          continue;
        case "rest":
          time +=
            data.divisionCount * ((60000 / currentBpm / currentDivision) * 4);
          continue;
      }
    }
    // handle notes only
    const itemList = Array.isArray(item) ? item : [item];
    const isEach = itemList.length > 1;
    itemList.forEach((item) => {
      const { data } = item;
      switch (data.type) {
        case "tap":
          notes.push({
            type: "tap",
            data: {
              lane: data.lane,
              hitTime: time,
              isEach,
            },
          });
          break;
        case "hold":
          notes.push({
            type: "hold",
            data: {
              lane: data.lane,
              hitTime: time,
              duration:
                data.duration.divisionCount *
                ((60000 /
                  (data.duration.bpm ?? currentBpm) /
                  data.duration.division) *
                  4),
              isEach,
            },
          });
          break;
        case "slide":
          notes.push({
            type: "slide",
            data: {
              lane: data.lane,
              hitTime: time,
              startTime:
                time + (60000 / (data.duration.bpm ?? currentBpm) / 4) * 4,
              duration:
                data.duration.divisionCount *
                ((60000 /
                  (data.duration.bpm ?? currentBpm) /
                  data.duration.division) *
                  4),
              slideType: data.slideType,
              direction: data.direction,
              destinationLane: data.destinationLane,
              isEach,
            },
          });
          break;
      }
    });
    time += (60000 / currentBpm / currentDivision) * 4;
  }

  return notes;
}
