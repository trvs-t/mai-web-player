import { getLaneRotationRadian } from "@/utils/lane";
import { Container, useTick } from "@pixi/react";
import { useContext } from "react";
import { PlayerContext } from "./context/context";
import { TimeControlContext, TimerContext } from "./context/timer";
import { Ring } from "./view/ring";
import { Tap } from "./view/tap";

export const Player = () => {
  const { isPlaying, time } = useContext(TimerContext);
  const { setTime } = useContext(TimeControlContext);
  const { position, radius } = useContext(PlayerContext);

  useTick((_, ticker) => {
    setTime(time + ticker.deltaMS);
  }, isPlaying);

  return (
    <>
      <Ring />
      <Container position={position} rotation={getLaneRotationRadian(1)}>
        <Tap hitTime={400} />
      </Container>
    </>
  );
};
