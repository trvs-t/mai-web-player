import { createRoute, createFileRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";

function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Maimai Web Player</h1>
      <p className="mb-4">
        A web-based chart visualizer for maimai, a circular touch-based rhythm
        game.
      </p>
      <a
        href="/player"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Player
      </a>
    </div>
  );
}

export const Route = createRoute("/")({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
