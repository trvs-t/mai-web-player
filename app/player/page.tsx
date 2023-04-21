"use client";
import { PlayerContext } from "./context";
import { Player } from "./player";
const Page = () => {
  return (
    <div>
      <h1>Maimai Player</h1>
      <PlayerContext.Provider
        value={{
          position: [300, 300],
          radius: 200,
        }}
      >
        <Player />
      </PlayerContext.Provider>
    </div>
  );
};
export default Page;
