import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

export type TimerMode = "audio" | "free-run";
export type PlaybackSpeed = 0.1 | 0.25 | 0.5 | 1 | 2;

export interface Bookmark {
  id: string;
  time: number;
  label: string;
}

export interface Timer {
  isPlaying: boolean;
  time: number;
  bookmarks: Bookmark[];
  loopStart: number | null;
  loopEnd: number | null;
  isLooping: boolean;
}

export interface TimerConfig {
  mode: TimerMode;
  speed: PlaybackSpeed;
}

export const TimerContext = createContext<Timer>({
  isPlaying: false,
  time: 0,
  bookmarks: [],
  loopStart: null,
  loopEnd: null,
  isLooping: false,
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
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setTime(0);
    if (isLooping && loopStart !== null) {
      setTime(loopStart);
    }
  }, [isLooping, loopStart]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setTime(0);
  }, []);

  const addBookmark = useCallback((time: number, label: string) => {
    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      time,
      label,
    };
    setBookmarks((prev) => [...prev, newBookmark].sort((a, b) => a.time - b.time));
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const jumpToBookmark = useCallback((id: string) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (bookmark) {
      setTime(bookmark.time);
    }
  }, [bookmarks]);

  const setLoopRange = useCallback((start: number | null, end: number | null) => {
    setLoopStart(start);
    setLoopEnd(end);
    setIsLooping(start !== null && end !== null && start < end);
  }, []);

  const clearLoop = useCallback(() => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
  }, []);

  const stepFrame = useCallback((direction: 1 | -1) => {
    const frameDuration = 1000 / 60;
    setTime((prev) => {
      const newTime = prev + direction * frameDuration;
      return Math.max(0, newTime);
    });
  }, []);

  const value = {
    isPlaying,
    time,
    bookmarks,
    loopStart,
    loopEnd,
    isLooping,
  };

  const control = useMemo<TimeContorl & {
    addBookmark: (time: number, label: string) => void;
    removeBookmark: (id: string) => void;
    jumpToBookmark: (id: string) => void;
    setLoopRange: (start: number | null, end: number | null) => void;
    clearLoop: () => void;
    stepFrame: (direction: 1 | -1) => void;
  }>(
    () => ({
      setTime,
      play,
      pause,
      reset,
      stop,
      addBookmark,
      removeBookmark,
      jumpToBookmark,
      setLoopRange,
      clearLoop,
      stepFrame,
    }),
    [play, pause, reset, stop, addBookmark, removeBookmark, jumpToBookmark, setLoopRange, clearLoop, stepFrame],
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
