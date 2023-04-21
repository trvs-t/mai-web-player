import { createContext } from "react";

export interface PlayerConfig {
  position: [number, number];
  radius: number;
}

export const PlayerContext = createContext<PlayerConfig>({
  position: [300, 300],
  radius: 200,
});
