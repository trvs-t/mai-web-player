import { Stage } from "@pixi/react";
import { ReactNode } from "react";
import { AudioContext } from "./audio";
import { ChartContext } from "./chart";
import { PlayerContext } from "./player";
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
        <AudioContext.Consumer>
          {(audio) => (
            <ChartContext.Consumer>
              {(chart) => (
                <TimerContext.Consumer>
                  {(timer) => (
                    <TimeControlContext.Consumer>
                      {(timeControl) => (
                        <Stage {...props}>
                          <PlayerContext.Provider value={playerContext}>
                            <AudioContext.Provider value={audio}>
                              <ChartContext.Provider value={chart}>
                                <TimerContext.Provider value={timer}>
                                  <TimeControlContext.Provider value={timeControl}>
                                    {children}
                                  </TimeControlContext.Provider>
                                </TimerContext.Provider>
                              </ChartContext.Provider>
                            </AudioContext.Provider>
                          </PlayerContext.Provider>
                        </Stage>
                      )}
                    </TimeControlContext.Consumer>
                  )}
                </TimerContext.Consumer>
              )}
            </ChartContext.Consumer>
          )}
        </AudioContext.Consumer>
      )}
    </PlayerContext.Consumer>
  );
}
