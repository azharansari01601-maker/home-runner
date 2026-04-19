import { Canvas } from "@react-three/fiber";
/**
 * GameScene (component bridge) — re-exports the R3F game canvas
 * from the game/ directory so GamePage can lazy-load it cleanly.
 */
import { Suspense } from "react";
import * as THREE from "three";
import Coin from "../game/Coin";
import Environment from "../game/Environment";
import Floor from "../game/Floor";
import Obstacle from "../game/Obstacle";
import Player from "../game/Player";
import Shield from "../game/Shield";
import { useCollisions } from "../game/useCollisions";
import { useGameLoop } from "../game/useGameLoop";
import { useKeyboard } from "../hooks/useKeyboard";
import type { GameAction } from "../hooks/useKeyboard";
import { useSwipe } from "../hooks/useSwipe";
import { useGameStore } from "../stores/useGameStore";
import type { Lane } from "../types/game";

const JUMP_DURATION_MS = 650;

// ─── Inner scene (runs inside <Canvas>) ───────────────────────────────────────
function SceneContents() {
  const obstacles = useGameStore((s) => s.obstacles);
  const activeCoins = useGameStore((s) => s.activeCoins);
  const activeShields = useGameStore((s) => s.activeShields);

  useGameLoop();
  useCollisions();

  return (
    <>
      <ambientLight intensity={0.6} color="#fff8e8" />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.2}
        color="#ffe0b2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Environment />
      <Floor />
      <Player />
      {obstacles.map((obs) => (
        <Obstacle key={obs.id} obstacle={obs} />
      ))}
      {activeCoins.map((coin) => (
        <Coin key={coin.id} coin={coin} />
      ))}
      {activeShields.map((shield) => (
        <Shield key={shield.id} shield={shield} />
      ))}
    </>
  );
}

// ─── Exported component (lazy-loadable) ───────────────────────────────────────
export default function GameScene() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const player = useGameStore((s) => s.player);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const startGame = useGameStore((s) => s.startGame);

  const handleAction = (action: GameAction) => {
    if (gamePhase === "idle" || gamePhase === "gameover") {
      startGame();
      return;
    }
    if (gamePhase !== "playing") return;

    if (action === "left") {
      const newLane = Math.max(-1, player.lane - 1) as Lane;
      if (newLane !== player.lane) setPlayer({ lane: newLane });
    } else if (action === "right") {
      const newLane = Math.min(1, player.lane + 1) as Lane;
      if (newLane !== player.lane) setPlayer({ lane: newLane });
    } else if (action === "jump" && !player.isJumping) {
      setPlayer({
        isJumping: true,
        isSliding: false,
        isGroundSlamming: false,
        jumpStartTime: Date.now(),
      });
      setTimeout(() => {
        // Only clear jump if we haven't initiated a ground slam
        const currentPlayer = useGameStore.getState().player;
        if (!currentPlayer.isGroundSlamming) {
          setPlayer({ isJumping: false });
        }
      }, JUMP_DURATION_MS);
    } else if (
      action === "groundSlam" &&
      player.isJumping &&
      !player.isGroundSlamming
    ) {
      // Initiate fast-fall
      setPlayer({ isGroundSlamming: true, isSliding: false });
    } else if (action === "slide" && !player.isJumping) {
      setPlayer({ isSliding: true, isGroundSlamming: false });
      setTimeout(() => setPlayer({ isSliding: false }), 500);
    }
  };

  useKeyboard({
    onAction: handleAction,
    enabled: true,
    isJumping: player.isJumping,
  });
  useSwipe({
    onAction: handleAction,
    enabled: true,
    isJumping: player.isJumping,
  });

  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      shadows
      camera={{ position: [0, 2.8, 5.5], fov: 62, near: 0.1, far: 200 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      dpr={[1, 2]}
      data-ocid="game.canvas_target"
    >
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
    </Canvas>
  );
}
