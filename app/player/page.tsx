"use client";
import { BridgedStage } from "./context/bridge";
import { PlayerContext } from "./context/context";
import { TimerProvider } from "./context/timer";
import { TimerControls } from "./controls";
import { Player } from "./player";
import { SlidePaths } from "./view/slide/slide-paths";

const Page = () => {
  return (
    <div>
      <h1>Maimai Player</h1>
      <div>
        <SlidePaths />
        <PlayerContext.Provider
          value={{
            position: [300, 300],
            radius: 200,
            noteDuration: 350,
          }}
        >
          <TimerProvider>
            <BridgedStage>
              <Player />
            </BridgedStage>
            <TimerControls />
          </TimerProvider>
        </PlayerContext.Provider>
      </div>
    </div>
  );
};
export default Page;
