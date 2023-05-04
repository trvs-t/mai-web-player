import { Stage } from "@pixi/react";
import { ReactNode } from "react";
import { AudioContext } from "./audio";
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
            <Stage {...props}>
              <PlayerContext.Provider value={playerContext}>
                <AudioContext.Provider value={audio}>
                  {children}
                </AudioContext.Provider>
              </PlayerContext.Provider>
            </Stage>
          )}
        </AudioContext.Consumer>
      )}
    </PlayerContext.Consumer>
  );
}
