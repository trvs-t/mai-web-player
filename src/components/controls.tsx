import { useContext, useEffect, useState } from "react";
import { AudioContext } from "../contexts/audio";
import {
  PlaybackSpeed,
  TimeControlContext,
  TimerConfigControlContext,
  TimerConfigContext,
  TimerContext,
} from "../contexts/timer";
import { MeasureInfo, getMeasureDisplay } from "../lib/visualization";

interface TimerControlsProps {
  measures?: MeasureInfo[];
}

export function TimerControls({ measures }: TimerControlsProps) {
  const audio = useContext(AudioContext);
  const music = audio?.music;
  const timer = useContext(TimerContext);
  const timeControl = useContext(TimeControlContext);
  const timerConfig = useContext(TimerConfigContext);
  const timerConfigControl = useContext(TimerConfigControlContext);

  const [localIsPlaying, setLocalIsPlaying] = useState(false);

  useEffect(() => {
    if (timerConfig.mode === "audio" && music) {
      const handlePlay = () => setLocalIsPlaying(true);
      const handlePause = () => setLocalIsPlaying(false);
      const handleStop = () => setLocalIsPlaying(false);

      music.on("play", handlePlay);
      music.on("pause", handlePause);
      music.on("stop", handleStop);

      return () => {
        music.off("play", handlePlay);
        music.off("pause", handlePause);
        music.off("stop", handleStop);
      };
    }
  }, [music, timerConfig.mode]);

  const isPlaying =
    timerConfig.mode === "audio" ? localIsPlaying && !!music : timer.isPlaying;

  function play() {
    if (timerConfig.mode === "audio" && music) {
      music.play();
    } else {
      timeControl.play();
    }
  }

  function pause() {
    if (timerConfig.mode === "audio" && music) {
      music.pause();
    } else {
      timeControl.pause();
    }
  }

  function reset() {
    if (timerConfig.mode === "audio" && music) {
      music.seek(0);
    }
    timeControl.reset();
  }

  function stop() {
    if (timerConfig.mode === "audio" && music) {
      music.stop();
    }
    timeControl.stop();
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  };

  const speeds: PlaybackSpeed[] = [0.25, 0.5, 1, 2];

  const measureDisplay = measures
    ? getMeasureDisplay(measures, timer.time)
    : "M-- B-";

  return (
    <div className="space-y-4 p-4 border rounded">
      <div className="flex items-center justify-between">
        <span className="text-lg font-mono">{formatTime(timer.time)}</span>
        <span className="text-sm font-mono text-blue-600 font-semibold">
          {measureDisplay}
        </span>
        <span
          className={`px-2 py-1 rounded text-sm ${isPlaying ? "bg-green-500 text-white" : "bg-gray-300"}`}
        >
          {isPlaying ? "Playing" : "Paused"}
        </span>
      </div>

      <div className="flex gap-2">
        {isPlaying ? (
          <button
            onClick={pause}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={play}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Play
          </button>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset
        </button>
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Timer Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => timerConfigControl.setMode("audio")}
            className={`px-3 py-1 rounded ${timerConfig.mode === "audio" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Audio Sync
          </button>
          <button
            onClick={() => timerConfigControl.setMode("free-run")}
            className={`px-3 py-1 rounded ${timerConfig.mode === "free-run" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Free Run
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Playback Speed</label>
        <div className="flex gap-2">
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => timerConfigControl.setSpeed(speed)}
              className={`px-3 py-1 rounded ${timerConfig.speed === speed ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
