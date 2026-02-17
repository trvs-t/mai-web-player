import { Chart, SlideType, TouchZone } from "./chart";

export interface MeasureInfo {
  measureNumber: number;
  startTime: number;
  endTime: number;
  division: number;
  bpm: number;
}

export interface ChartWithMeasures {
  notes: NoteVisualization[];
  measures: MeasureInfo[];
  totalDuration: number;
}

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

export interface TouchVisualizeData {
  zone: TouchZone;
  position: number;
  hitTime: number;
  isHanabi: boolean;
  isEach?: boolean;
}

export interface TouchHoldVisualizeData {
  zone: TouchZone;
  position: number;
  hitTime: number;
  duration: number;
  isHanabi: boolean;
  isEach?: boolean;
}

export type NoteVisualizationData =
  | TapVisualizeData
  | HoldVisualizeData
  | SlideVisualizationData
  | TouchVisualizeData
  | TouchHoldVisualizeData;

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
    }
  | {
      type: "touch";
      data: TouchVisualizeData;
    }
  | {
      type: "touchHold";
      data: TouchHoldVisualizeData;
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
        case "touch":
          notes.push({
            type: "touch",
            data: {
              zone: data.zone,
              position: data.position,
              hitTime: time,
              isHanabi: data.isHanabi,
              isEach,
            },
          });
          break;
        case "touchHold":
          notes.push({
            type: "touchHold",
            data: {
              zone: data.zone,
              position: data.position,
              hitTime: time,
              duration:
                data.duration.divisionCount *
                ((60000 /
                  (data.duration.bpm ?? currentBpm) /
                  data.duration.division) *
                  4),
              isHanabi: data.isHanabi,
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

export function convertChartWithMeasures(chart: Chart): ChartWithMeasures {
  let time = 0;
  const baseTimeSignature = chart.items[0];
  let currentBpm: number;
  let currentDivision: number;
  let measureStartTime = 0;
  let currentMeasureNumber = 1;
  let beatsInCurrentMeasure = 0;

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

  const notes: NoteVisualization[] = [];
  const measures: MeasureInfo[] = [];

  function completeMeasure() {
    if (beatsInCurrentMeasure > 0) {
      measures.push({
        measureNumber: currentMeasureNumber,
        startTime: measureStartTime,
        endTime: time,
        division: currentDivision,
        bpm: currentBpm,
      });
      currentMeasureNumber++;
      measureStartTime = time;
      beatsInCurrentMeasure = 0;
    }
  }

  for (const item of chart.items.slice(1)) {
    const beatDuration = (60000 / currentBpm / currentDivision) * 4;

    // time signature and rest should not be array
    if (!Array.isArray(item)) {
      const { type, data } = item;
      switch (type) {
        case "timeSignature": {
          // Complete current measure before changing time signature
          completeMeasure();
          currentBpm = data.bpm ?? currentBpm;
          currentDivision = data.division;
          continue;
        }
        case "rest": {
          const restBeats = data.divisionCount;
          let remainingRestBeats = restBeats;
          while (remainingRestBeats > 0) {
            const beatsToCompleteMeasure = currentDivision - beatsInCurrentMeasure;
            const beatsToUse = Math.min(remainingRestBeats, beatsToCompleteMeasure);
            
            time += beatsToUse * beatDuration;
            beatsInCurrentMeasure += beatsToUse;
            remainingRestBeats -= beatsToUse;
            
            if (beatsInCurrentMeasure >= currentDivision) {
              completeMeasure();
            }
          }
          continue;
        }
      }
    }

    // Check if we need to complete the measure before adding this note
    if (beatsInCurrentMeasure >= currentDivision) {
      completeMeasure();
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
        case "touch":
          notes.push({
            type: "touch",
            data: {
              zone: data.zone,
              position: data.position,
              hitTime: time,
              isHanabi: data.isHanabi,
              isEach,
            },
          });
          break;
        case "touchHold":
          notes.push({
            type: "touchHold",
            data: {
              zone: data.zone,
              position: data.position,
              hitTime: time,
              duration:
                data.duration.divisionCount *
                ((60000 /
                  (data.duration.bpm ?? currentBpm) /
                  data.duration.division) *
                  4),
              isHanabi: data.isHanabi,
              isEach,
            },
          });
          break;
      }
    });

    time += beatDuration;
    beatsInCurrentMeasure++;

    // Complete measure if full
    if (beatsInCurrentMeasure >= currentDivision) {
      completeMeasure();
    }
  }

  // Complete any remaining partial measure
  completeMeasure();

  return {
    notes,
    measures,
    totalDuration: time,
  };
}

export function getCurrentMeasure(
  measures: MeasureInfo[],
  currentTime: number,
): MeasureInfo | null {
  return (
    measures.find(
      (m) => currentTime >= m.startTime && currentTime < m.endTime,
    ) || null
  );
}

export function getMeasureDisplay(
  measures: MeasureInfo[],
  currentTime: number,
): string {
  const measure = getCurrentMeasure(measures, currentTime);
  if (!measure) return "M-- B-";

  const beatDuration = (60000 / measure.bpm / measure.division) * 4;
  const beatInMeasure = Math.floor(
    (currentTime - measure.startTime) / beatDuration,
  );
  return `M${measure.measureNumber} B${beatInMeasure + 1}`;
}

export interface TimeSortedNoteIndex {
  notes: NoteVisualization[];
  sortedByHitTime: NoteVisualization[];
}

export function createTimeSortedIndex(
  notes: NoteVisualization[],
): TimeSortedNoteIndex {
  const sortedByHitTime = [...notes].sort((a, b) => {
    const aTime = getNoteEndTime(a);
    const bTime = getNoteEndTime(b);
    return aTime - bTime;
  });
  return {
    notes,
    sortedByHitTime,
  };
}

function getNoteEndTime(note: NoteVisualization): number {
  const baseTime = (note.data as { hitTime: number }).hitTime;
  
  if (note.type === "hold") {
    return baseTime + (note.data as HoldVisualizeData).duration;
  }
  if (note.type === "touchHold") {
    return baseTime + (note.data as TouchHoldVisualizeData).duration;
  }
  if (note.type === "slide") {
    return baseTime + (note.data as SlideVisualizationData).duration;
  }
  
  return baseTime;
}

function getNoteStartTime(note: NoteVisualization): number {
  return (note.data as { hitTime: number }).hitTime;
}

export function getVisibleNotes(
  index: TimeSortedNoteIndex,
  currentTime: number,
  windowMs: number = 2000,
): NoteVisualization[] {
  const { sortedByHitTime } = index;
  if (sortedByHitTime.length === 0) return [];

  const windowStart = currentTime - windowMs;
  const windowEnd = currentTime + windowMs;

  const startIndex = findFirstVisibleNote(sortedByHitTime, windowStart);
  const endIndex = findLastVisibleNote(sortedByHitTime, windowEnd);

  return sortedByHitTime.slice(startIndex, endIndex + 1);
}

function findFirstVisibleNote(
  notes: NoteVisualization[],
  windowStart: number,
): number {
  let left = 0;
  let right = notes.length - 1;
  let result = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const noteEndTime = getNoteEndTime(notes[mid]);

    if (noteEndTime >= windowStart) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return result;
}

function findLastVisibleNote(
  notes: NoteVisualization[],
  windowEnd: number,
): number {
  let left = 0;
  let right = notes.length - 1;
  let result = notes.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const noteStartTime = getNoteStartTime(notes[mid]);

    if (noteStartTime <= windowEnd) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}
