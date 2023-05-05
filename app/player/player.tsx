import { getLaneRotationRadian } from "@/utils/lane";
import { Container } from "@pixi/react";
import { useContext, useMemo } from "react";
import { ChartContext } from "./context/chart";
import { PlayerContext } from "./context/player";
import {
  SlideVisualizationData,
  convertChartVisualizationData,
} from "./data/visualization";
import { Hold } from "./view/hold";
import { Ring } from "./view/ring";
import { Slide } from "./view/slide/slide";
import { Star } from "./view/slide/star";
import { Tap } from "./view/tap";

const lanes = new Array(8).fill(0).map((_, i) => i + 1);
// const visualizationChart = convertChartVisualizationData(testChart);

export const Player = () => {
  const { position, radius } = useContext(PlayerContext);

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
      note.type === "slide"
  );

  return (
    <Container position={position} anchor={0.5}>
      <Ring />
      {/* Slide in it's own container */}
      <Container key="slide">
        {slides.map(({ data }, i) => (
          <Slide key={`slide-${i}`} {...data} />
        ))}
      </Container>
      {lanes.map((lane) => (
        <Container key={lane} rotation={getLaneRotationRadian(lane)}>
          {visualizationChart
            .filter(({ data: note }) => note.lane == lane)
            .map(({ type, data: note }, i) => {
              const { hitTime } = note;
              switch (type) {
                case "tap":
                  return <Tap key={`${type}-${i}`} data={note} />;
                case "hold":
                  return (
                    <Hold
                      key={`${type}-${i}`}
                      hitTime={hitTime}
                      duration={note.duration}
                    />
                  );
                case "slide":
                  return <Star key={`${type}-${i}`} data={note} />;
                default:
                  return null;
              }
            })}
        </Container>
      ))}
    </Container>
  );
};
