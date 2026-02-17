import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import "../globals.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Maimai Web Player" },
      { name: "description", content: "Web-based maimai chart visualizer" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}
