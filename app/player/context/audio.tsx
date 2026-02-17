import { useTick } from "@pixi/react";
import { Howl } from "howler";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Chart } from "../data/chart";
import {
  TimeContorl,
  TimeControlContext,
  Timer,
  TimerConfig,
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

interface ChartContextType {
  chart: Chart | null;
}
export const FreeRunChartContext = createContext<ChartContextType>({
  chart: null,
});

function extractBaseBpm(chart: Chart | null | undefined): number {
  if (!chart?.items.length) return chart?.metadata.bpm ?? 120;
  const firstItem = chart.items[0];
  if (
    !Array.isArray(firstItem) &&
    firstItem.type === "timeSignature" &&
    firstItem.data.bpm
  ) {
    return firstItem.data.bpm;
  }
  return chart.metadata.bpm ?? 120;
}

export function FreeRunTimerProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const chart = useContext(FreeRunChartContext)?.chart;
  const timerConfig = useContext(TimerConfigContext);
  const timeControl = useContext(TimeControlContext);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastFrameTime = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef(time);
  const timeControlRef = useRef(timeControl);

  timeRef.current = time;
  timeControlRef.current = timeControl;

  const baseBpm = extractBaseBpm(chart);

  const freeRunControl: TimeContorl = {
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
      setTime(0);
      timeControl.reset();
    },
    stop: () => {
      setIsPlaying(false);
      setTime(0);
      timeControl.stop();
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
  }, [isPlaying, timerConfig?.speed, timeControl.setTime]);

  const timer: Timer = {
    isPlaying,
    time,
  };

  return (
    <TimerContext.Provider value={timer}>
      <TimeControlContext.Provider value={freeRunControl}>
        {children}
      </TimeControlContext.Provider>
    </TimerContext.Provider>
  );
}
