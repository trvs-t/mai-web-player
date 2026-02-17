import { useContext, useMemo } from "react";
import { Chart } from "../../lib/chart";

interface MetronomeProps {
  chart: Chart | null;
  currentTime: number;
  isActive: boolean;
}

interface BeatInfo {
  measure: number;
  beat: number;
  isDownbeat: boolean;
}

function calculateCurrentBeat(chart: Chart | null, timeMs: number): BeatInfo {
  if (!chart?.items.length) {
    return { measure: 0, beat: 0, isDownbeat: true };
  }

  const firstItem = chart.items[0];
  if (
    Array.isArray(firstItem) ||
    firstItem.type !== "timeSignature" ||
    !firstItem.data.bpm
  ) {
    return { measure: 0, beat: 0, isDownbeat: true };
  }

  let currentBpm = firstItem.data.bpm;
  let currentDivision = firstItem.data.division;
  let accumulatedTime = 0;
  let totalBeats = 0;

  for (const item of chart.items.slice(1)) {
    const beatDuration = (60000 / currentBpm / currentDivision) * 4;

    if (!Array.isArray(item)) {
      const { type, data } = item;

      if (type === "timeSignature") {
        const beatsSinceLastChange = Math.floor(
          (timeMs - accumulatedTime) / beatDuration,
        );
        if (beatsSinceLastChange < totalBeats + 1) {
          const measure = Math.floor(beatsSinceLastChange / currentDivision);
          const beat = beatsSinceLastChange % currentDivision;
          return {
            measure: measure + 1,
            beat: beat + 1,
            isDownbeat: beat === 0,
          };
        }
        accumulatedTime += (totalBeats + 1) * beatDuration;
        totalBeats = 0;
        currentBpm = data.bpm ?? currentBpm;
        currentDivision = data.division;
        continue;
      }

      if (type === "rest") {
        const restBeats = data.divisionCount;
        const restDuration = restBeats * beatDuration;
        if (accumulatedTime + restDuration > timeMs) {
          const beatsIntoRest = Math.floor(
            (timeMs - accumulatedTime) / beatDuration,
          );
          const totalBeat = totalBeats + beatsIntoRest;
          const measure = Math.floor(totalBeat / currentDivision);
          const beat = totalBeat % currentDivision;
          return {
            measure: measure + 1,
            beat: beat + 1,
            isDownbeat: beat === 0,
          };
        }
        accumulatedTime += restDuration;
        totalBeats += restBeats;
        continue;
      }
    }

    if (accumulatedTime + beatDuration > timeMs) {
      const totalBeat = totalBeats;
      const measure = Math.floor(totalBeat / currentDivision);
      const beat = totalBeat % currentDivision;
      return {
        measure: measure + 1,
        beat: beat + 1,
        isDownbeat: beat === 0,
      };
    }
    accumulatedTime += beatDuration;
    totalBeats += 1;
  }

  const totalBeat = totalBeats;
  const measure = Math.floor(totalBeat / currentDivision);
  const beat = totalBeat % currentDivision;
  return {
    measure: measure + 1,
    beat: beat + 1,
    isDownbeat: beat === 0,
  };
}

export function Metronome({ chart, currentTime, isActive }: MetronomeProps) {
  const beatInfo = useMemo(
    () => calculateCurrentBeat(chart, currentTime),
    [chart, currentTime],
  );

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Measure</span>
        <span className="text-2xl font-bold font-mono">
          {beatInfo.measure.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="text-gray-400">|</div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Beat</span>
        <span
          className={`text-2xl font-bold font-mono w-8 text-center ${
            beatInfo.isDownbeat ? "text-red-500" : "text-blue-500"
          }`}
        >
          {beatInfo.beat}
        </span>
      </div>
      <div
        className={`w-4 h-4 rounded-full ml-2 transition-colors duration-100 ${
          beatInfo.isDownbeat ? "bg-red-500 scale-125" : "bg-blue-400"
        }`}
      />
    </div>
  );
}
