import { Stage } from "@pixi/react";
import { ReactNode } from "react";
import { PlayerContext } from "./context";
import { TimeControlContext, TimerContext } from "./timer";

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
        <TimerContext.Consumer>
          {(timerContext) => (
            <TimeControlContext.Consumer>
              {(setTimeContext) => {
                return (
                  <Stage {...props}>
                    <PlayerContext.Provider value={playerContext}>
                      <TimerContext.Provider value={timerContext}>
                        <TimeControlContext.Provider value={setTimeContext}>
                          {children}
                        </TimeControlContext.Provider>
                      </TimerContext.Provider>
                    </PlayerContext.Provider>
                  </Stage>
                );
              }}
            </TimeControlContext.Consumer>
          )}
        </TimerContext.Consumer>
      )}
    </PlayerContext.Consumer>
  );
}
