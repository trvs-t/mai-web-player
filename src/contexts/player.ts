import { createContext } from "react";

export interface PlayerConfig {
  position: [number, number];
  radius: number;
  noteDuration: number; // in ms
}

export const PlayerContext = createContext<PlayerConfig>({
  position: [300, 300],
  radius: 200,
  noteDuration: 400,
});
