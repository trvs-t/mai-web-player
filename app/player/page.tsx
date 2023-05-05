"use client";
import { Howl } from "howler";
import { useMemo, useState } from "react";
import { AudioContext, AudioTimerProvider } from "./context/audio";
import { BridgedStage } from "./context/bridge";
import { ChartContext } from "./context/chart";
import { PlayerContext } from "./context/player";
import { TimerProvider } from "./context/timer";
import { TimerControls } from "./controls";
import { Chart } from "./data/chart";
import { parseSimaiChart } from "./data/simai";
import { Player } from "./player";
import { SlidePaths } from "./view/slide/slide-paths";

const Page = () => {
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
      })
    );
  }

  const [audioOffset, setAudioOffset] = useState(0);

  const [simai, setSimai] = useState<string>("");
  const chart: Chart | null = useMemo(
    () =>
      simai.length
        ? {
            metadata: {
              title: "test",
            },
            items: parseSimaiChart(simai),
          }
        : null,
    [simai]
  );

  return (
    <div>
      <h1>Maimai Player</h1>
      <div className="grid grid-cols-2">
        <div>
          <SlidePaths />
          <AudioContext.Provider
            value={music ? { music, offset: audioOffset } : null}
          >
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
                    <AudioTimerProvider>
                      <Player />
                    </AudioTimerProvider>
                  </BridgedStage>
                  <TimerControls />
                </TimerProvider>
              </ChartContext.Provider>
            </PlayerContext.Provider>
          </AudioContext.Provider>
          <input
            type="number"
            value={audioOffset}
            onChange={(e) => {
              console.log(e.target.value);
              setAudioOffset(+e.target.value);
            }}
            className="text-black"
          />
          <input type="file" onChange={onFilesPicked} />
        </div>
        <div className="w-full h-100">
          <textarea
            value={simai}
            onChange={(e) => setSimai(e.target.value)}
            rows={20}
            className="w-full text-black"
          />
        </div>
      </div>
    </div>
  );
};
export default Page;
