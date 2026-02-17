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

interface ExtendedTimeControl {
  setTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  stop: () => void;
  addBookmark: (time: number, label: string) => void;
  removeBookmark: (id: string) => void;
  jumpToBookmark: (id: string) => void;
  setLoopRange: (start: number | null, end: number | null) => void;
  clearLoop: () => void;
  stepFrame: (direction: 1 | -1) => void;
}

export function TimerControls({ measures }: TimerControlsProps) {
  const audio = useContext(AudioContext);
  const music = audio?.music;
  const timer = useContext(TimerContext);
  const timeControl = useContext(TimeControlContext) as ExtendedTimeControl;
  const timerConfig = useContext(TimerConfigContext);
  const timerConfigControl = useContext(TimerConfigControlContext);

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [loopStartInput, setLoopStartInput] = useState("");
  const [loopEndInput, setLoopEndInput] = useState("");
  const [targetMeasure, setTargetMeasure] = useState("");

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

  const speeds: PlaybackSpeed[] = [0.1, 0.25, 0.5, 1, 2];

  const measureDisplay = measures
    ? getMeasureDisplay(measures, timer.time)
    : "M-- B-";

  function handleAddBookmark() {
    const label = bookmarkLabel.trim() || `Bookmark ${timer.bookmarks.length + 1}`;
    timeControl.addBookmark(timer.time, label);
    setBookmarkLabel("");
  }

  function handleSetLoop() {
    const start = loopStartInput ? parseFloat(loopStartInput) * 1000 : null;
    const end = loopEndInput ? parseFloat(loopEndInput) * 1000 : null;
    timeControl.setLoopRange(start, end);
  }

  function handleJumpToMeasure() {
    const measureNum = parseInt(targetMeasure, 10);
    if (!measures || isNaN(measureNum)) return;
    
    const target = measures.find(m => m.measureNumber === measureNum);
    if (target) {
      timeControl.setTime(target.startTime);
    }
  }

  function handleNextBookmark() {
    const future = timer.bookmarks.filter(b => b.time > timer.time);
    if (future.length > 0) {
      timeControl.jumpToBookmark(future[0].id);
    }
  }

  function handlePrevBookmark() {
    const past = timer.bookmarks.filter(b => b.time < timer.time);
    if (past.length > 0) {
      timeControl.jumpToBookmark(past[past.length - 1].id);
    }
  }

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
        <label className="block text-sm font-medium mb-2">Frame Step</label>
        <div className="flex gap-2">
          <button
            onClick={() => timeControl.stepFrame(-1)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            -1 Frame
          </button>
          <button
            onClick={() => timeControl.stepFrame(1)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            +1 Frame
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Jump to Measure</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={targetMeasure}
            onChange={(e) => setTargetMeasure(e.target.value)}
            placeholder="M#"
            className="text-black px-2 py-1 border rounded w-20"
          />
          <button
            onClick={handleJumpToMeasure}
            disabled={!measures}
            className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm disabled:bg-gray-400"
          >
            Jump
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Bookmarks</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={bookmarkLabel}
            onChange={(e) => setBookmarkLabel(e.target.value)}
            placeholder="Label (optional)"
            className="text-black px-2 py-1 border rounded flex-1"
          />
          <button
            onClick={handleAddBookmark}
            className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 mb-2">
          <button
            onClick={handlePrevBookmark}
            disabled={timer.bookmarks.length === 0}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm disabled:bg-gray-300"
          >
            Prev
          </button>
          <button
            onClick={handleNextBookmark}
            disabled={timer.bookmarks.length === 0}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
        {timer.bookmarks.length > 0 && (
          <div className="max-h-24 overflow-y-auto space-y-1">
            {timer.bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="flex items-center justify-between bg-gray-100 px-2 py-1 rounded text-sm">
                <button
                  onClick={() => timeControl.jumpToBookmark(bookmark.id)}
                  className="text-left flex-1 hover:text-blue-600"
                >
                  {bookmark.label} ({formatTime(bookmark.time)})
                </button>
                <button
                  onClick={() => timeControl.removeBookmark(bookmark.id)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Loop Section</label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={loopStartInput}
            onChange={(e) => setLoopStartInput(e.target.value)}
            placeholder="Start (s)"
            className="text-black px-2 py-1 border rounded w-24"
          />
          <input
            type="number"
            value={loopEndInput}
            onChange={(e) => setLoopEndInput(e.target.value)}
            placeholder="End (s)"
            className="text-black px-2 py-1 border rounded w-24"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSetLoop}
            className={`px-3 py-1 rounded text-sm ${timer.isLooping ? "bg-orange-500 text-white" : "bg-orange-400 text-white hover:bg-orange-500"}`}
          >
            {timer.isLooping ? "Looping" : "Set Loop"}
          </button>
          {timer.isLooping && (
            <button
              onClick={() => timeControl.clearLoop()}
              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
            >
              Clear
            </button>
          )}
        </div>
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
        <div className="flex gap-2 flex-wrap">
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
