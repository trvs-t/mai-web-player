import { ReactNode, createContext, useMemo, useState } from "react";

export interface Timer {
  isPlaying: boolean;
  time: number;
}

export const TimerContext = createContext<Timer>({
  isPlaying: false,
  time: 0,
});

export interface TimeContorl {
  setTime: (time: number) => void;

  play: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
}

export const TimeControlContext = createContext<TimeContorl>({
  setTime: () => {},
  play: () => {},
  pause: () => {},
  reset: () => {},
  stop: () => {},
});

export const TimerProvider = ({ children }: { children?: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  function play() {
    setIsPlaying(true);
  }
  function pause() {
    setIsPlaying(false);
  }
  function reset() {
    setTime(0);
  }
  function stop() {
    pause();
    reset();
  }
  const value = {
    isPlaying,
    time,
  };
  const control = useMemo<TimeContorl>(
    () => ({
      setTime,
      play,
      pause,
      reset,
      stop,
    }),
    []
  );
  return (
    <TimerContext.Provider value={value}>
      <TimeControlContext.Provider value={control}>
        {children}
      </TimeControlContext.Provider>
    </TimerContext.Provider>
  );
};
