import { Stage } from "@pixi/react";
import { ReactNode } from "react";
import { AudioContext } from "./audio";
import { ChartContext } from "./chart";
import { PlayerContext } from "./player";

export function BridgedStage({
  children,
  ...props
}: {
  children?: ReactNode;
  props?: any;
}) {
  return (
    <PlayerContext.Consumer>
      {(playerContext) => (
        <AudioContext.Consumer>
          {(audio) => (
            <ChartContext.Consumer>
              {(chart) => (
                <Stage {...props}>
                  <PlayerContext.Provider value={playerContext}>
                    <AudioContext.Provider value={audio}>
                      <ChartContext.Provider value={chart}>
                        {children}
                      </ChartContext.Provider>
                    </AudioContext.Provider>
                  </PlayerContext.Provider>
                </Stage>
              )}
            </ChartContext.Consumer>
          )}
        </AudioContext.Consumer>
      )}
    </PlayerContext.Consumer>
  );
}
