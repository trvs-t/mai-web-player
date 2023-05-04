import { useContext, useEffect, useState } from "react";
import { AudioContext } from "./context/audio";

export function TimerControls() {
  const audio = useContext(AudioContext);
  const music = audio?.music;
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!music) return;
    music.on("play", () => setIsPlaying(true));
    music.on("pause", () => setIsPlaying(false));
    music.on("stop", () => setIsPlaying(false));
  }, [music]);
  function play() {
    music?.play();
  }
  function pause() {
    music?.pause();
  }
  function reset() {
    music?.seek(0);
  }
  function stop() {
    music?.stop();
  }
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
