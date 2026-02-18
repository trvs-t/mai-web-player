import { Howl } from "howler";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Chart } from "../lib/chart";
import {
  Bookmark,
  ExtendedTimeControl,
  TimeContorl,
  TimeControlContext,
  Timer,
  TimerConfigContext,
  TimerContext,
} from "./timer";

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
  const timeControl = useContext(TimeControlContext);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef(time);
  const timeControlRef = useRef(timeControl);

  timeRef.current = time;
  timeControlRef.current = timeControl;

  useEffect(() => {
    if (!music) {
      setIsPlaying(false);
      return;
    }
    music.on("play", () => setIsPlaying(true));
    music.on("pause", () => setIsPlaying(false));
    music.on("stop", () => setIsPlaying(false));
  }, [music]);

  // Sync audio time using requestAnimationFrame instead of useTick
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const tick = () => {
      if (music) {
        const currentTime = (music.seek() ?? 0) - offset;
        const timeMs = Math.max(0, currentTime * 1000);
        setTime(timeMs);
        timeControlRef.current.setTime(timeMs);
      }
      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, music, offset]);

  const setTimeAndSync = useCallback(
    (newTime: number) => {
      setTime(newTime);
      if (music) {
        music.seek((newTime + offset) / 1000);
      }
      timeControl.setTime(newTime);
    },
    [music, offset, timeControl],
  );

  const play = useCallback(() => {
    if (music) {
      music.play();
    } else {
      setIsPlaying(true);
    }
    timeControl.play();
  }, [music, timeControl]);

  const pause = useCallback(() => {
    if (music) {
      music.pause();
    } else {
      setIsPlaying(false);
    }
    timeControl.pause();
  }, [music, timeControl]);

  const reset = useCallback(() => {
    setTime(isLooping && loopStart !== null ? loopStart : 0);
    if (music) {
      music.seek(
        isLooping && loopStart !== null ? (loopStart + offset) / 1000 : 0,
      );
    }
    timeControl.reset();
  }, [isLooping, loopStart, music, offset, timeControl]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setTime(0);
    if (music) {
      music.stop();
    }
    timeControl.stop();
  }, [music, timeControl]);

  const addBookmark = useCallback((time: number, label: string) => {
    const newBookmark: Bookmark = {
      id: Math.random().toString(36).substr(2, 9),
      time,
      label,
    };
    setBookmarks((prev) =>
      [...prev, newBookmark].sort((a, b) => a.time - b.time),
    );
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const jumpToBookmark = useCallback(
    (id: string) => {
      const bookmark = bookmarks.find((b) => b.id === id);
      if (bookmark) {
        setTimeAndSync(bookmark.time);
      }
    },
    [bookmarks, setTimeAndSync],
  );

  const setLoopRange = useCallback(
    (start: number | null, end: number | null) => {
      setLoopStart(start);
      setLoopEnd(end);
      setIsLooping(start !== null && end !== null && start < end);
    },
    [],
  );

  const clearLoop = useCallback(() => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
  }, []);

  const stepFrame = useCallback(
    (direction: 1 | -1) => {
      const frameDuration = 1000 / 60;
      const newTime = Math.max(0, timeRef.current + direction * frameDuration);
      setTimeAndSync(newTime);
    },
    [setTimeAndSync],
  );

  const timer: Timer = {
    isPlaying,
    time,
    bookmarks,
    loopStart,
    loopEnd,
    isLooping,
  };

  const audioTimeControl: TimeContorl & {
    addBookmark: (time: number, label: string) => void;
    removeBookmark: (id: string) => void;
    jumpToBookmark: (id: string) => void;
    setLoopRange: (start: number | null, end: number | null) => void;
    clearLoop: () => void;
    stepFrame: (direction: 1 | -1) => void;
  } = {
    setTime: setTimeAndSync,
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
  };

  return (
    <TimerContext.Provider value={timer}>
      <TimeControlContext.Provider value={audioTimeControl}>
        {children}
      </TimeControlContext.Provider>
    </TimerContext.Provider>
  );
}

interface ChartContextType {
  chart: Chart | null;
}
export const FreeRunChartContext = createContext<ChartContextType>({
  chart: null,
});

export function FreeRunTimerProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const timerConfig = useContext(TimerConfigContext);
  const timeControl = useContext(TimeControlContext) as ExtendedTimeControl;
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarks] = useState<Bookmark[]>([]);
  const [loopStart] = useState<number | null>(null);
  const [loopEnd] = useState<number | null>(null);
  const [isLooping] = useState(false);
  const lastFrameTime = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef(time);
  const timeControlRef = useRef(timeControl);

  timeRef.current = time;
  timeControlRef.current = timeControl;

  const freeRunControl: ExtendedTimeControl = {
    setTime: (newTime: number) => {
      setTime(newTime);
      timeControl.setTime(newTime);
    },
    play: () => {
      setIsPlaying(true);
      timeControl.play();
    },
    pause: () => {
      setIsPlaying(false);
      timeControl.pause();
    },
    reset: () => {
      setTime(isLooping && loopStart !== null ? loopStart : 0);
      timeControl.reset();
    },
    stop: () => {
      setIsPlaying(false);
      setTime(0);
      timeControl.stop();
    },
    addBookmark: (time: number, label: string) => {
      timeControl.addBookmark(time, label);
    },
    removeBookmark: (id: string) => {
      timeControl.removeBookmark(id);
    },
    jumpToBookmark: (id: string) => {
      timeControl.jumpToBookmark(id);
    },
    setLoopRange: (start: number | null, end: number | null) => {
      timeControl.setLoopRange(start, end);
    },
    clearLoop: () => {
      timeControl.clearLoop();
    },
    stepFrame: (direction: 1 | -1) => {
      timeControl.stepFrame(direction);
    },
  };

  useEffect(() => {
    if (!isPlaying) {
      lastFrameTime.current = null;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (lastFrameTime.current === null) {
        lastFrameTime.current = timestamp;
      }
      const delta = timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;

      const speed = timerConfig?.speed ?? 1;
      const newTime = timeRef.current + delta * speed;
      setTime(newTime);
      timeControlRef.current.setTime(newTime);

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, timerConfig?.speed, timeControl]);

  const timer: Timer = {
    isPlaying,
    time,
    bookmarks,
    loopStart,
    loopEnd,
    isLooping,
  };

  return (
    <TimerContext.Provider value={timer}>
      <TimeControlContext.Provider value={freeRunControl}>
        {children}
      </TimeControlContext.Provider>
    </TimerContext.Provider>
  );
}
