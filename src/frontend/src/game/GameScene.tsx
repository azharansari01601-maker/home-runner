import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { useKeyboard } from "../hooks/useKeyboard";
import type { GameAction } from "../hooks/useKeyboard";
import { useSwipe } from "../hooks/useSwipe";
import { useGameStore } from "../stores/useGameStore";
import type { Lane } from "../types/game";
import Coin from "./Coin";
import Environment from "./Environment";
import Floor from "./Floor";
import Obstacle from "./Obstacle";
import Player from "./Player";
import { useCollisions } from "./useCollisions";
import { useGameLoop } from "./useGameLoop";

const JUMP_DURATION_MS = 650;

// ─── Inner scene (inside Canvas) ─────────────────────────────────────────────
function SceneContents() {
  const obstacles = useGameStore((s) => s.obstacles);
  const activeCoins = useGameStore((s) => s.activeCoins);

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
    </>
  );
}

interface GameSceneProps {
  className?: string;
}

export default function GameScene({ className }: GameSceneProps) {
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
        jumpStartTime: Date.now(),
      });
      setTimeout(() => setPlayer({ isJumping: false }), JUMP_DURATION_MS);
    } else if (action === "slide" && !player.isJumping) {
      setPlayer({ isSliding: true });
      setTimeout(() => setPlayer({ isSliding: false }), 500);
    }
  };

  useKeyboard({ onAction: handleAction, enabled: true });
  useSwipe({ onAction: handleAction, enabled: true });

  return (
    <Canvas
      className={className}
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
