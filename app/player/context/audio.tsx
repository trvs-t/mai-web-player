import { useTick } from "@pixi/react";
import { Howl } from "howler";
import { createContext, useContext, useEffect, useState } from "react";
import { Timer, TimerContext } from "./timer";

interface AudioContextType {
  music: Howl;
  offset: number;
}
export const AudioContext = createContext<AudioContextType | null>(null);

export function AudioTimerProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const audio = useContext(AudioContext);
  const music = audio?.music;
  const offset = audio?.offset ?? 0;
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    if (!music) {
      setIsPlaying(false);
      return;
    }
    music.on("play", () => setIsPlaying(true));
    music.on("pause", () => setIsPlaying(false));
    music.on("stop", () => setIsPlaying(false));
  }, [music]);

  const timer: Timer = {
    isPlaying,
    time,
  };

  useTick(() => {
    if (!isPlaying) return;
    const time = (music?.seek() ?? 0) - offset;
    setTime(time * 1000);
  });

  return (
    <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>
  );
}
