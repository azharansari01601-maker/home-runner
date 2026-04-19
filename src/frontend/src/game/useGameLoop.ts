import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGameStore } from "../stores/useGameStore";
import type { CoinState, ObstacleState, ShieldState } from "../types/game";
import {
  maybeSpawnCoins,
  maybeSpawnObstacle,
  maybeSpawnShield,
  resetSpawnCounters,
} from "./obstacleSpawner";

const DESPAWN_Z = 6; // remove entities that pass the player

/**
 * useGameLoop — runs inside a <Canvas> component.
 * Drives obstacle/coin/shield movement, spawning, and score/distance accumulation.
 */
export function useGameLoop() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const speed = useGameStore((s) => s.speed);
  const obstacles = useGameStore((s) => s.obstacles);
  const activeCoins = useGameStore((s) => s.activeCoins);
  const activeShields = useGameStore((s) => s.activeShields);
  const setObstacles = useGameStore((s) => s.setObstacles);
  const setCoins = useGameStore((s) => s.setCoins);
  const setShields = useGameStore((s) => s.setShields);
  const addDistance = useGameStore((s) => s.addDistance);
  const tickInvincibility = useGameStore((s) => s.tickInvincibility);

  // Track whether we already reset counters for this game session
  const playingRef = useRef(false);

  useFrame((_state, delta) => {
    if (gamePhase !== "playing") {
      playingRef.current = false;
      return;
    }

    if (!playingRef.current) {
      resetSpawnCounters();
      playingRef.current = true;
    }

    const dt = Math.min(delta, 0.05);
    const move = speed * dt;

    // ── Move obstacles ───────────────────────────────────────────────────────
    let newObstacles: ObstacleState[] = obstacles
      .map((o) => ({ ...o, z: o.z + move }))
      .filter((o) => o.z < DESPAWN_Z);

    const spawned = maybeSpawnObstacle(newObstacles, speed);
    if (spawned) newObstacles = [...newObstacles, spawned];

    // ── Move coins ───────────────────────────────────────────────────────────
    let newCoins: CoinState[] = activeCoins
      .map((c) => ({ ...c, z: c.z + move }))
      .filter((c) => c.z < DESPAWN_Z && !c.collected);

    const spawnedCoins = maybeSpawnCoins(newCoins, speed);
    if (spawnedCoins.length > 0) newCoins = [...newCoins, ...spawnedCoins];

    // ── Move shields ──────────────────────────────────────────────────────────
    let newShields: ShieldState[] = activeShields
      .map((s) => ({ ...s, z: s.z + move }))
      .filter((s) => s.z < DESPAWN_Z && !s.collected);

    const spawnedShield = maybeSpawnShield(newShields, speed);
    if (spawnedShield) newShields = [...newShields, spawnedShield];

    // ── Tick invincibility timer ──────────────────────────────────────────────
    tickInvincibility();

    // ── Commit ───────────────────────────────────────────────────────────────
    setObstacles(newObstacles);
    setCoins(newCoins);
    setShields(newShields);
    addDistance(move);
  });
}
