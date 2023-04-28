import { getLaneRotationRadian } from "@/utils/lane";
import { Container, useTick } from "@pixi/react";
import { useContext } from "react";
import { PlayerContext } from "./context/context";
import { TimeControlContext, TimerContext } from "./context/timer";
import { Hold } from "./view/hold";
import { Ring } from "./view/ring";
import { Slide } from "./view/slide/slide";
import { Tap } from "./view/tap";

export const Player = () => {
  const { isPlaying, time } = useContext(TimerContext);
  const { setTime } = useContext(TimeControlContext);
  const { position, radius } = useContext(PlayerContext);

  useTick((_, ticker) => {
    setTime(time + ticker.deltaMS);
  }, isPlaying);

  return (
    <Container position={position} anchor={0.5}>
      <Ring />
      <Container rotation={getLaneRotationRadian(1)}>
        <Tap hitTime={400} />
        <Slide
          startTime={800}
          endTime={1500}
          destinationDifference={5}
          type="Thunder"
        />
        <Hold startTime={500} endTime={800} />
      </Container>
    </Container>
  );
};
