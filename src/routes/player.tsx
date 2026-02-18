import { createFileRoute } from "@tanstack/react-router";
import { Howl } from "howler";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { StatisticsPanel } from "../components/statistics-panel";
import { TimerControls } from "../components/controls";
import { Chart } from "../lib/chart";
import {
  parseSimai,
  SimaiParseError,
  isChartRenderable,
  isCriticalError,
} from "../lib/simai";
import { Player } from "../components/player";
import { Metronome } from "../components/view/metronome";
import { SlidePaths } from "../components/view/slide/slide-paths";
import { convertChartWithMeasures } from "../lib/visualization";
import {
  downloadChart,
  copyToClipboard,
  saveToLocalStorage,
  loadFromLocalStorage,
  readFileAsText,
} from "../../utils/export";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ThemeProvider } from "@/components/theme-provider";

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
  const [debouncedParseErrors, setDebouncedParseErrors] = useState<
    SimaiParseError[]
  >([]);
  const [lastValidChart, setLastValidChart] = useState<Chart | null>(null);

  const chart: Chart | null = useMemo(() => {
    if (!simai.length) {
      setParseErrors([]);
      return null;
    }
    const result = parseSimai(simai);
    setParseErrors(result.errors);

    if (isChartRenderable(result)) {
      setLastValidChart(result);
    }

    return result;
  }, [simai]);

  const renderableChart = useMemo(() => {
    if (!chart) return lastValidChart;
    return isChartRenderable(chart) ? chart : lastValidChart;
  }, [chart, lastValidChart]);

  const measureData = useMemo(() => {
    if (!renderableChart) return null;
    return convertChartWithMeasures(renderableChart);
  }, [renderableChart]);

  useEffect(() => {
    const criticalErrors = parseErrors.filter(isCriticalError);
    const nonCriticalErrors = parseErrors.filter((e) => !isCriticalError(e));

    if (criticalErrors.length > 0) {
      setDebouncedParseErrors(criticalErrors);
      return;
    }

    if (nonCriticalErrors.length === 0) {
      setDebouncedParseErrors([]);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedParseErrors(nonCriticalErrors);
    }, 500);

    return () => clearTimeout(timer);
  }, [parseErrors]);

  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setSimai(saved.simaiText);
    }
  }, []);

  useEffect(() => {
    if (!chart) return;
    saveToLocalStorage(chart, simai);
  }, [chart, simai]);

  async function handleCopy() {
    const success = await copyToClipboard(simai);
    setCopySuccess(success);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleDownload() {
    if (!chart) return;
    downloadChart(chart, "chart.txt");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAsText(file).then((text) => {
      setSimai(text);
    });
  }

  function triggerFileUpload() {
    fileInputRef.current?.click();
  }

  return (
    <ThemeProvider>
      <div className="p-4 dark">
        <h1 className="text-2xl font-bold mb-4">Maimai Player</h1>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Player</h2>
              </CardHeader>
              <CardContent>
                <SlidePaths />
                {!renderableChart ? (
                  <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 text-muted-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v8" />
                          <path d="M8 12h8" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Chart Loaded
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Paste a simai chart in the editor on the right, or import
                        a chart file to begin.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <PlayerContext.Provider
                    value={{
                      position: [300, 300],
                      radius: 200,
                      noteDuration: 500,
                    }}
                  >
                    <ChartContext.Provider value={renderableChart}>
                      <TimerProvider>
                        <TimerProviderSelector
                          music={music}
                          audioOffset={audioOffset}
                          chart={renderableChart}
                        >
                          <BridgedStage>
                            <Player />
                          </BridgedStage>
                          <TimerControls measures={measureData?.measures} />
                        </TimerProviderSelector>
                        <MetronomeWrapper chart={renderableChart} />
                      </TimerProvider>
                    </ChartContext.Provider>
                  </PlayerContext.Provider>
                )}
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
                <StatisticsPanel chart={renderableChart} />
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-2">
                    Chart Import/Export
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="file"
                      accept=".txt,.simai"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={triggerFileUpload}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Import File
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={!chart}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:bg-gray-400"
                    >
                      Download
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                    >
                      {copySuccess ? "Copied!" : "Copy to Clipboard"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Simai Chart Editor</h2>
              </CardHeader>
              <CardContent>
                <label className="block text-sm font-medium mb-2">
                  Chart Input
                </label>
                {debouncedParseErrors.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {debouncedParseErrors.map((error, index) => (
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export const Route = createFileRoute("/player")({
  component: PlayerPage,
});
