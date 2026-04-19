import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy-load the game page so Three.js bundle is code-split
const GamePage = lazy(() => import("./pages/GamePage"));

// ─── Routes ────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <span className="font-display text-2xl text-primary animate-pulse">
            Loading…
          </span>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  ),
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: GamePage,
});

// ─── Router ────────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([gameRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
