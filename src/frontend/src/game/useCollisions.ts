import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGameStore } from "../stores/useGameStore";

// ─── Lane to world X ─────────────────────────────────────────────────────────
const LANE_X: Record<number, number> = { "-1": -2, "0": 0, "1": 2 };

// ─── Player bounding box (half-extents) ──────────────────────────────────────
const P_HX = 0.4; // half width
const P_HY = 0.8; // half height (standing)
const P_HY_SLIDE = 0.35; // half height (sliding)
const P_HZ = 0.4; // half depth
const P_Y_CENTER = 0.85; // world-Y center when standing
const P_Y_CENTER_SLIDE = 0.35; // world-Y center when sliding

// ─── Coin collection radius ──────────────────────────────────────────────────
const COIN_RADIUS = 1.0;
const SHIELD_RADIUS = 1.2;

export function useCollisions() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const player = useGameStore((s) => s.player);
  const obstacles = useGameStore((s) => s.obstacles);
  const activeCoins = useGameStore((s) => s.activeCoins);
  const activeShields = useGameStore((s) => s.activeShields);
  const endGame = useGameStore((s) => s.endGame);
  const collectCoin = useGameStore((s) => s.collectCoin);
  const collectShield = useGameStore((s) => s.collectShield);

  // Cooldown to avoid double-triggering game-over
  const deadRef = useRef(false);

  // Reset on new game
  const phaseRef = useRef(gamePhase);
  if (phaseRef.current !== gamePhase) {
    phaseRef.current = gamePhase;
    if (gamePhase === "playing") deadRef.current = false;
  }

  useFrame(() => {
    if (gamePhase !== "playing" || deadRef.current) return;

    const px = LANE_X[player.lane] ?? 0;
    const py = player.isSliding ? P_Y_CENTER_SLIDE : P_Y_CENTER;
    const phY = player.isSliding ? P_HY_SLIDE : P_HY;

    // ── Obstacle AABB ────────────────────────────────────────────────────────
    if (!player.isInvincible) {
      for (const obs of obstacles) {
        const ox = LANE_X[obs.lane] ?? 0;
        const oy = obs.height / 2;

        const hw = (obs.width * 1.8) / 2;
        const hh = obs.height / 2;
        const hd = 0.8;

        const overlapX = Math.abs(px - ox) < P_HX + hw;
        const overlapY = Math.abs(py - oy) < phY + hh;
        const overlapZ = Math.abs(0 - obs.z) < P_HZ + hd;

        if (overlapX && overlapY && overlapZ) {
          deadRef.current = true;
          endGame();
          return;
        }
      }
    }

    // ── Coin sphere check ────────────────────────────────────────────────────
    for (const coin of activeCoins) {
      if (coin.collected) continue;
      const cx = LANE_X[coin.lane] ?? 0;
      const cy = coin.height + 0.5;
      const dist = Math.sqrt(
        (px - cx) ** 2 + (py - cy) ** 2 + (0 - coin.z) ** 2,
      );
      if (dist < COIN_RADIUS) {
        collectCoin(coin.id);
      }
    }

    // ── Shield sphere check ───────────────────────────────────────────────────
    for (const shield of activeShields) {
      if (shield.collected) continue;
      const sx = LANE_X[shield.lane] ?? 0;
      const sy = 1.2; // shield floats at mid height
      const dist = Math.sqrt(
        (px - sx) ** 2 + (py - sy) ** 2 + (0 - shield.z) ** 2,
      );
      if (dist < SHIELD_RADIUS) {
        collectShield(shield.id);
      }
    }
  });
}
