import { createRoute, createFileRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import { Howl } from "howler";
import { useContext, useMemo, useState } from "react";
import {
  AudioContext,
  AudioTimerProvider,
  FreeRunChartContext,
  FreeRunTimerProvider,
} from "../contexts/audio";
import { BridgedStage } from "../contexts/bridge";
import { ChartContext } from "../contexts/chart";
import { PlayerContext } from "../contexts/player";
import {
  TimerConfigContext,
  TimerProvider,
  TimerContext,
} from "../contexts/timer";
import { MetadataPanel } from "../components/metadata-panel";
import { TimerControls } from "../components/controls";
import { Chart } from "../lib/chart";
import { parseSimai, SimaiParseError } from "../lib/simai";
import { Player } from "../components/player";
import { Metronome } from "../components/view/metronome";
import { SlidePaths } from "../components/view/slide/slide-paths";

function TimerProviderSelector({
  children,
  music,
  audioOffset,
  chart,
}: {
  children: React.ReactNode;
  music: Howl | null;
  audioOffset: number;
  chart: Chart | null;
}) {
  const timerConfig = useContext(TimerConfigContext);

  if (timerConfig.mode === "free-run") {
    return (
      <FreeRunChartContext.Provider value={{ chart }}>
        <FreeRunTimerProvider>{children}</FreeRunTimerProvider>
      </FreeRunChartContext.Provider>
    );
  }

  return (
    <AudioContext.Provider
      value={music ? { music, offset: audioOffset } : null}
    >
      <AudioTimerProvider>{children}</AudioTimerProvider>
    </AudioContext.Provider>
  );
}

function MetronomeWrapper({ chart }: { chart: Chart | null }) {
  const timerConfig = useContext(TimerConfigContext);
  const timer = useContext(TimerContext);

  return (
    <Metronome
      chart={chart}
      currentTime={timer.time}
      isActive={timerConfig.mode === "free-run"}
    />
  );
}

function PlayerPage() {
  const [src, setSrc] = useState<string | null>(null);
  const [music, setMusic] = useState<Howl | null>(null);
  function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    if (music && src) {
      music.unload();
      URL.revokeObjectURL(src);
    }
    const newSrc = URL.createObjectURL(e.target.files[0]);
    setSrc(newSrc);
    setMusic(
      new Howl({
        src: [newSrc],
        format: e.target.files[0].name.split(".").pop(),
      }),
    );
  }

  const [audioOffset, setAudioOffset] = useState(0);

  const [simai, setSimai] = useState<string>("");
  const [parseErrors, setParseErrors] = useState<SimaiParseError[]>([]);
  const chart: Chart | null = useMemo(() => {
    if (!simai.length) {
      setParseErrors([]);
      return null;
    }
    const result = parseSimai(simai);
    setParseErrors(result.errors);
    return result;
  }, [simai]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Maimai Player</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <SlidePaths />
          <PlayerContext.Provider
            value={{
              position: [300, 300],
              radius: 200,
              noteDuration: 500,
            }}
          >
            <ChartContext.Provider value={chart}>
              <TimerProvider>
                <BridgedStage>
                  <TimerProviderSelector
                    music={music}
                    audioOffset={audioOffset}
                    chart={chart}
                  >
                    <Player />
                  </TimerProviderSelector>
                </BridgedStage>
                <TimerControls />
                <MetronomeWrapper chart={chart} />
              </TimerProvider>
            </ChartContext.Provider>
          </PlayerContext.Provider>
          <div className="flex items-center gap-2">
            <label className="text-sm">Audio Offset (ms):</label>
            <input
              type="number"
              value={audioOffset}
              onChange={(e) => setAudioOffset(+e.target.value)}
              className="text-black px-2 py-1 border rounded w-24"
            />
            <input
              type="file"
              accept="audio/*"
              onChange={onFilesPicked}
              className="text-sm"
            />
          </div>
          <MetadataPanel metadata={chart?.metadata ?? {}} />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-2">
            Simai Chart Editor
          </label>
          {parseErrors.length > 0 && (
            <div className="mb-4 space-y-2">
              {parseErrors.map((error, index) => (
                <div
                  key={index}
                  className={`p-3 rounded text-sm border ${
                    error.severity === "error"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-yellow-50 border-yellow-200 text-yellow-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold shrink-0">
                      {error.severity === "error" ? "Error" : "Warning"}
                      {error.line && ` (Line ${error.line}`}
                      {error.column && `, Col ${error.column}`}
                      {error.line && ")"}:
                    </span>
                    <span>{error.message}</span>
                  </div>
                  {error.suggestion && (
                    <div className="mt-1 text-sm opacity-80">
                      Suggestion: {error.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <textarea
            value={simai}
            onChange={(e) => setSimai(e.target.value)}
            rows={25}
            className="w-full text-black p-2 border rounded font-mono text-sm"
            placeholder="Paste your simai chart here..."
          />
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute("/player")({
  getParentRoute: () => rootRoute,
  path: "/player",
  component: PlayerPage,
});
