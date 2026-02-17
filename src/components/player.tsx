import { getLaneRotationRadian } from "../../utils/lane";
import { Container } from "@pixi/react";
import { useContext, useMemo } from "react";
import { ChartContext } from "../contexts/chart";
import { PlayerContext } from "../contexts/player";
import {
  SlideVisualizationData,
  TouchHoldVisualizeData,
  TouchVisualizeData,
  convertChartVisualizationData,
} from "../lib/visualization";
import { Hold } from "./view/hold";
import { Ring } from "./view/ring";
import { Slide } from "./view/slide/slide";
import { Star } from "./view/slide/star";
import { Tap } from "./view/tap";
import { Touch } from "./view/touch";
import { TouchHold } from "./view/touch-hold";

const lanes = Array.from({ length: 8 }, (_, i) => i + 1);

export const Player = () => {
  const { position } = useContext(PlayerContext);

  const chart = useContext(ChartContext);
  const visualizationChart = useMemo(() => {
    if (!chart?.items.length) return [];
    try {
      return convertChartVisualizationData(chart);
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [chart]);
  const slides = visualizationChart.filter(
    (note): note is { type: "slide"; data: SlideVisualizationData } =>
      note.type === "slide",
  );

  const touchNotes = visualizationChart.filter(
    (note): note is { type: "touch"; data: TouchVisualizeData } =>
      note.type === "touch",
  );

  const touchHoldNotes = visualizationChart.filter(
    (note): note is { type: "touchHold"; data: TouchHoldVisualizeData } =>
      note.type === "touchHold",
  );

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
      {/* Slide in it's own container */}
      <Container key="slide">
        {slides.map(({ data }, i) => (
          <Slide key={`slide-${i}`} lane={data.lane} hitTime={data.hitTime} data={data} />
        ))}
      </Container>
      {lanes.map((lane) => (
        <Container key={lane} rotation={getLaneRotationRadian(lane)}>
          {visualizationChart
            .filter(({ type, data: note }) => type !== "touch" && type !== "touchHold" && (note as { lane: number }).lane === lane)
            .map(({ type, data: note }, i) => {
              const typedNote = note as { hitTime: number };
              const { hitTime } = typedNote;
              switch (type) {
                case "tap":
                  return <Tap key={`${type}-${i}`} data={note as { lane: number; hitTime: number; isEach?: boolean }} />;
                case "hold":
                  return (
                    <Hold
                      key={`${type}-${i}`}
                      hitTime={hitTime}
                      duration={(note as { duration: number }).duration}
                    />
                  );
                case "slide":
                  return <Star key={`${type}-${i}`} data={note as SlideVisualizationData} />;
                default:
                  return null;
              }
            })}
        </Container>
      ))}
    </Container>
  );
};
