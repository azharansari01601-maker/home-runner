import { AnimatePresence } from "motion/react";
import { Suspense, lazy } from "react";
import { GameOver } from "../components/GameOver";
import { HUD } from "../components/HUD";
import { StartScreen } from "../components/StartScreen";
import { useGameStore } from "../stores/useGameStore";

// Lazy-load the heavy 3D scene so it doesn't block initial render
const GameScene = lazy(() => import("../components/GameScene"));

export default function GamePage() {
  const gamePhase = useGameStore((s) => s.gamePhase);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: "oklch(0.14 0.03 35)" }}
      data-ocid="game.page"
    >
      {/* 3D Canvas — always mounted so Three.js scene stays alive */}
      <Suspense
        fallback={
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "oklch(0.14 0.03 35)" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-12 w-12 animate-spin rounded-full"
                style={{
                  border: "3px solid oklch(0.65 0.18 45 / 0.2)",
                  borderTopColor: "oklch(0.65 0.18 45)",
                }}
              />
              <span
                className="font-display text-lg font-bold"
                style={{ color: "oklch(0.80 0.06 75)" }}
              >
                Loading scene…
              </span>
            </div>
          </div>
        }
      >
        <GameScene />
      </Suspense>

      {/* HUD — only when playing */}
      <AnimatePresence>
        {gamePhase === "playing" && <HUD key="hud" />}
      </AnimatePresence>

      {/* Overlays — start / game-over */}
      <AnimatePresence mode="wait">
        {gamePhase === "idle" && <StartScreen key="start" />}
        {gamePhase === "gameover" && <GameOver key="gameover" />}
      </AnimatePresence>
    </div>
  );
}
