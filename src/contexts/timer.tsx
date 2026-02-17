import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

export type TimerMode = "audio" | "free-run";
export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2;

export interface Timer {
  isPlaying: boolean;
  time: number;
}

export interface TimerConfig {
  mode: TimerMode;
  speed: PlaybackSpeed;
}

export const TimerContext = createContext<Timer>({
  isPlaying: false,
  time: 0,
});

export const TimerConfigContext = createContext<TimerConfig>({
  mode: "audio",
  speed: 1,
});

export const TimerConfigControlContext = createContext<{
  setMode: (mode: TimerMode) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
}>({
  setMode: () => {},
  setSpeed: () => {},
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
  const [mode, setMode] = useState<TimerMode>("audio");
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setTime(0);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setTime(0);
  }, []);

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
    [play, pause, reset, stop],
  );

  const configValue = useMemo<TimerConfig>(
    () => ({
      mode,
      speed,
    }),
    [mode, speed],
  );

  const configControl = useMemo(
    () => ({
      setMode,
      setSpeed,
    }),
    [],
  );

  return (
    <TimerContext.Provider value={value}>
      <TimeControlContext.Provider value={control}>
        <TimerConfigContext.Provider value={configValue}>
          <TimerConfigControlContext.Provider value={configControl}>
            {children}
          </TimerConfigControlContext.Provider>
        </TimerConfigContext.Provider>
      </TimeControlContext.Provider>
    </TimerContext.Provider>
  );
};
