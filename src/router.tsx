import {
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as playerRoute } from "./routes/player";

const routeTree = rootRoute.addChildren([indexRoute, playerRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
