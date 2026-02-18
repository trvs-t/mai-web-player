import { describe, it, expect } from "bun:test";
import { createContext, useContext, useState, ReactNode } from "react";
import { renderToString } from "react-dom/server";

const TestTimerContext = createContext<{ time: number; isPlaying: boolean }>({
  time: 0,
  isPlaying: false,
});

const TestTimeControlContext = createContext<{
  play: () => void;
  setTime: (t: number) => void;
}>({
  play: () => {},
  setTime: () => {},
});

describe("Timer Context Bridging", () => {
  describe("Context propagation through BridgedStage", () => {
    it("should maintain timer context values through bridged providers", () => {
      function ConsumerComponent() {
        const timer = useContext(TestTimerContext);
        return (
          <div data-testid="timer-value">
            time:{timer.time},playing:{timer.isPlaying ? "yes" : "no"}
          </div>
        );
      }

      function ProviderWrapper({ children }: { children: ReactNode }) {
        const [time, setTime] = useState(0);
        const [isPlaying, setIsPlaying] = useState(false);

        const timeControl = {
          play: () => setIsPlaying(true),
          setTime: (t: number) => setTime(t),
        };

        return (
          <TestTimerContext.Provider value={{ time, isPlaying }}>
            <TestTimeControlContext.Provider value={timeControl}>
              {children}
            </TestTimeControlContext.Provider>
          </TestTimerContext.Provider>
        );
      }

      function TestApp() {
        return (
          <ProviderWrapper>
            <TestTimerContext.Consumer>
              {(timer) => (
                <TestTimeControlContext.Consumer>
                  {(timeControl) => (
                    <TestTimerContext.Provider value={timer}>
                      <TestTimeControlContext.Provider value={timeControl}>
                        <ConsumerComponent />
                      </TestTimeControlContext.Provider>
                    </TestTimerContext.Provider>
                  )}
                </TestTimeControlContext.Consumer>
              )}
            </TestTimerContext.Consumer>
          </ProviderWrapper>
        );
      }

      const html = renderToString(<TestApp />);
      expect(html).toContain('data-testid="timer-value"');
      expect(html).toContain("time:");
      expect(html).toContain("0");
      expect(html).toContain("playing:");
      expect(html).toContain("no");
    });
  });

  describe("TimerControls and Player context synchronization", () => {
    it("should give both TimerControls and Player the same timer context", () => {
      let controlsTime = -1;
      let playerTime = -1;

      function TimerControls() {
        const timer = useContext(TestTimerContext);
        controlsTime = timer.time;
        return <div>Controls: {timer.time}ms</div>;
      }

      function Player() {
        const timer = useContext(TestTimerContext);
        playerTime = timer.time;
        return <div>Player: {timer.time}ms</div>;
      }

      function TimerProviderSelector({ children }: { children: ReactNode }) {
        const [time, setTime] = useState(1000);

        return (
          <TestTimerContext.Provider value={{ time, isPlaying: true }}>
            <TestTimeControlContext.Provider
              value={{ play: () => {}, setTime }}
            >
              {children}
            </TestTimeControlContext.Provider>
          </TestTimerContext.Provider>
        );
      }

      function TestApp() {
        return (
          <TimerProviderSelector>
            <Player />
            <TimerControls />
          </TimerProviderSelector>
        );
      }

      renderToString(<TestApp />);

      expect(controlsTime).toBe(1000);
      expect(playerTime).toBe(1000);
      expect(controlsTime).toBe(playerTime);
    });

    it("demonstrates context mismatch regression when TimerControls outside TimerProviderSelector", () => {
      let controlsTime = -1;
      let playerTime = -1;

      function TimerControls() {
        const timer = useContext(TestTimerContext);
        controlsTime = timer.time;
        return <div>Controls: {timer.time}ms</div>;
      }

      function Player() {
        const timer = useContext(TestTimerContext);
        playerTime = timer.time;
        return <div>Player: {timer.time}ms</div>;
      }

      function BaseProvider({ children }: { children: ReactNode }) {
        return (
          <TestTimerContext.Provider value={{ time: 0, isPlaying: false }}>
            {children}
          </TestTimerContext.Provider>
        );
      }

      function SpecificTimerProvider({ children }: { children: ReactNode }) {
        return (
          <TestTimerContext.Provider value={{ time: 1000, isPlaying: true }}>
            {children}
          </TestTimerContext.Provider>
        );
      }

      function BrokenApp() {
        return (
          <BaseProvider>
            <SpecificTimerProvider>
              <Player />
            </SpecificTimerProvider>
            <TimerControls />
          </BaseProvider>
        );
      }

      renderToString(<BrokenApp />);

      expect(playerTime).toBe(1000);
      expect(controlsTime).toBe(0);
      expect(controlsTime).not.toBe(playerTime);
    });
  });
});
