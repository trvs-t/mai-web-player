import { Chart, SlideType } from "./chart";

export interface SlideVisualizationData {
  lane: number;
  hitTime: number;
  startTime: number;
  duration: number;
  slideType: SlideType;
  direction: "cw" | "ccw";
  destinationLane: number;
}

export interface HoldVisualizeData {
  lane: number;
  hitTime: number;
  duration: number;
}

export interface TapVisualizeData {
  lane: number;
  hitTime: number;
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
  if (baseTimeSignature.type !== "timeSignature") {
    throw new Error("Invalid chart");
  }
  let currentBpm = baseTimeSignature.data.bpm;
  let currentDivision = baseTimeSignature.data.division;

  let notes: NoteVisualization[] = [];

  for (const item of chart.items.slice(1)) {
    const { type, data } = item;
    switch (type) {
      case "timeSignature":
        currentBpm = data.bpm;
        currentDivision = data.division;
        break;
      case "rest":
        time +=
          data.divisionCount * ((60000 / currentBpm / currentDivision) * 4);
        break;
      case "note":
        switch (data.type) {
          case "tap":
            notes.push({
              type: "tap",
              data: {
                lane: data.lane,
                hitTime: time,
              },
            });
            time += (60000 / currentBpm / currentDivision) * 4;
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
              },
            });
            time += (60000 / currentBpm / currentDivision) * 4;
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
              },
            });
            time += (60000 / currentBpm / currentDivision) * 4;
            break;
        }
        break;
    }
  }

  return notes;
}
