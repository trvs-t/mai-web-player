import { getLaneDifference, getLaneRotationRadian } from "@/utils/lane";
import { Container, useTick } from "@pixi/react";
import { useContext } from "react";
import { PlayerContext } from "./context/context";
import { TimeControlContext, TimerContext } from "./context/timer";
import {
  ChartData,
  HoldChartData,
  SlideChartData,
  TapChartData,
  testChart,
} from "./data/chart";
import { Hold } from "./view/hold";
import { Ring } from "./view/ring";
import { Slide } from "./view/slide/slide";
import { Star } from "./view/slide/star";
import { Tap } from "./view/tap";

const lanes = new Array(8).fill(0).map((_, i) => i + 1);

export const Player = () => {
  const { isPlaying, time } = useContext(TimerContext);
  const { setTime } = useContext(TimeControlContext);
  const { position, radius } = useContext(PlayerContext);

  useTick((_, ticker) => {
    setTime(time + ticker.deltaMS);
  }, isPlaying);

  const notesByType: {
    tap: TapChartData[];
    slide: SlideChartData[];
    hold: HoldChartData[];
  } = testChart.reduce((acc, note) => {
    const { type } = note;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(note);
    return acc;
  }, {} as Record<ChartData["type"], typeof testChart>) as any;

  return (
    <Container position={position} anchor={0.5}>
      <Ring />
      {/* Slide in it's own container */}
      <Container key="slide">
        {notesByType.slide.map((note: SlideChartData, i) => (
          <Slide
            key={`slide-${i}`}
            hitTime={note.hitTime}
            startTime={note.startTime}
            duration={note.duration}
            destinationDifference={getLaneDifference(
              note.destinationLane,
              note.lane
            )}
            type={note.slideType}
            rotation={getLaneRotationRadian(note.lane)}
          />
        ))}
      </Container>
      {lanes.map((lane) => (
        <Container key={lane} rotation={getLaneRotationRadian(lane)}>
          {testChart
            .filter((note) => note.lane == lane)
            .map((note, i) => {
              const { type, hitTime } = note;
              switch (type) {
                case "tap":
                  return <Tap key={`${type}-${i}`} hitTime={hitTime} />;
                case "hold":
                  return (
                    <Hold
                      key={`${type}-${i}`}
                      hitTime={hitTime}
                      duration={note.duration}
                    />
                  );
                case "slide":
                  return (
                    <Star
                      key={`${type}-${i}`}
                      data={{
                        ...note,
                        type: note.slideType,
                        destinationDifference: getLaneDifference(
                          note.destinationLane,
                          note.lane
                        ),
                        rotation: getLaneRotationRadian(note.lane),
                      }}
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
