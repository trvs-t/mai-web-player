import { useContext } from "react";
import { TimeControlContext, TimerContext } from "./context/timer";

export function TimerControls() {
  const { isPlaying, time } = useContext(TimerContext);
  const { play, pause, reset, stop } = useContext(TimeControlContext);
  return (
    <div>
      {isPlaying ? "Playing" : "Paused"}
      <div className="flex gap-4">
        {isPlaying ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={play}>Play</button>
        )}
        <button onClick={reset}>Reset</button>
        <button onClick={stop}>Stop</button>
      </div>
    </div>
  );
}
