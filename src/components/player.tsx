import { getLaneRotationRadian } from "../../utils/lane";
import { Container } from "@pixi/react";
import { useContext, useMemo } from "react";
import { ChartContext } from "../contexts/chart";
import { PlayerContext } from "../contexts/player";
import { TimerContext } from "../contexts/timer";
import {
  SlideVisualizationData,
  TouchHoldVisualizeData,
  TouchVisualizeData,
  convertChartVisualizationData,
  createTimeSortedIndex,
  getVisibleNotes,
} from "../lib/visualization";
import { Hold } from "./view/hold";
import { Ring } from "./view/ring";
import { Slide } from "./view/slide/slide";
import { Star } from "./view/slide/star";
import { Tap } from "./view/tap";
import { Touch } from "./view/touch";
import { TouchHold } from "./view/touch-hold";

const lanes = Array.from({ length: 8 }, (_, i) => i + 1);
const CULLING_WINDOW_MS = 2000;

export const Player = () => {
  const { position } = useContext(PlayerContext);
  const { time: currentTime } = useContext(TimerContext);

  const chart = useContext(ChartContext);
  const noteIndex = useMemo(() => {
    if (!chart?.items.length) return null;
    try {
      const notes = convertChartVisualizationData(chart);
      return createTimeSortedIndex(notes);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [chart]);

  const visibleNotes = useMemo(() => {
    if (!noteIndex) return [];
    return getVisibleNotes(noteIndex, currentTime, CULLING_WINDOW_MS);
  }, [noteIndex, currentTime]);

  const slides = visibleNotes.filter(
    (note): note is { type: "slide"; data: SlideVisualizationData } =>
      note.type === "slide",
  );

  const touchNotes = visibleNotes.filter(
    (note): note is { type: "touch"; data: TouchVisualizeData } =>
      note.type === "touch",
  );

  const touchHoldNotes = visibleNotes.filter(
    (note): note is { type: "touchHold"; data: TouchHoldVisualizeData } =>
      note.type === "touchHold",
  );

  const laneNotes = useMemo(() => {
    const byLane: Record<number, typeof visibleNotes> = {};
    for (let i = 1; i <= 8; i++) {
      byLane[i] = [];
    }

    for (const note of visibleNotes) {
      if (note.type === "tap" || note.type === "hold") {
        const lane = (note.data as { lane: number }).lane;
        byLane[lane]?.push(note);
      } else if (note.type === "slide") {
        const lane = (note.data as SlideVisualizationData).lane;
        byLane[lane]?.push(note);
      }
    }

    return byLane;
  }, [visibleNotes]);

  return (
    <Container position={position} anchor={0.5}>
      <Ring />
      <Container key="touch-holds">
        {touchHoldNotes.map(({ data }, i) => (
          <TouchHold key={`touch-hold-${i}`} data={data} />
        ))}
      </Container>
      <Container key="touch">
        {touchNotes.map(({ data }, i) => (
          <Touch key={`touch-${i}`} data={data} />
        ))}
      </Container>
      <Container key="slide">
        {slides.map(({ data }, i) => (
          <Slide key={`slide-${i}`} lane={data.lane} data={data} />
        ))}
      </Container>
      {lanes.map((lane) => (
        <Container key={lane} rotation={getLaneRotationRadian(lane)}>
          {laneNotes[lane]?.map(({ type, data: note }, i) => {
            const typedNote = note as { hitTime: number };
            const { hitTime } = typedNote;
            switch (type) {
              case "tap":
                return (
                  <Tap
                    key={`${type}-${i}`}
                    data={
                      note as {
                        lane: number;
                        hitTime: number;
                        isEach?: boolean;
                      }
                    }
                  />
                );
              case "hold":
                return (
                  <Hold
                    key={`${type}-${i}`}
                    hitTime={hitTime}
                    duration={(note as { duration: number }).duration}
                  />
                );
              case "slide":
                return (
                  <Star
                    key={`${type}-${i}`}
                    data={note as SlideVisualizationData}
                  />
                );
              default:
                return null;
            }
          })}
        </Container>
      ))}
    </Container>
  );
};
