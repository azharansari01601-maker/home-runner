import type {
  CoinState,
  Lane,
  ObstacleState,
  ObstacleType,
  ShieldState,
} from "../types/game";

// ─── Constants ─────────────────────────────────────────────────────────────────
const SPAWN_Z = -80;
const LANES: Lane[] = [-1, 0, 1];

// ─── Obstacle definitions ─────────────────────────────────────────────────────
const OBSTACLE_DEFS: Record<
  ObstacleType,
  {
    width: number;
    height: number;
    requiresSlide: boolean;
    requiresJump: boolean;
  }
> = {
  sofa: { width: 1, height: 0.7, requiresSlide: true, requiresJump: false },
  lamp: { width: 0.5, height: 2.0, requiresSlide: false, requiresJump: false },
  table: { width: 1, height: 1.2, requiresSlide: false, requiresJump: false },
  chair: { width: 0.8, height: 1.1, requiresSlide: false, requiresJump: true },
  bookshelf: {
    width: 1,
    height: 2.2,
    requiresSlide: false,
    requiresJump: false,
  },
  trash_can: {
    width: 0.6,
    height: 0.7,
    requiresSlide: false,
    requiresJump: true,
  },
};

const OBSTACLE_TYPES = Object.keys(OBSTACLE_DEFS) as ObstacleType[];

let _obstacleCounter = 0;
let _coinCounter = 0;
let _shieldCounter = 0;

export function resetSpawnCounters() {
  _obstacleCounter = 0;
  _coinCounter = 0;
  _shieldCounter = 0;
}

// ─── Obstacle Spawner ─────────────────────────────────────────────────────────
export function maybeSpawnObstacle(
  currentObstacles: ObstacleState[],
  speed: number,
): ObstacleState | null {
  const minGap = Math.max(14, 22 - speed * 0.4);

  const frontmost = currentObstacles.reduce<number>(
    (acc, o) => (o.z < acc ? o.z : acc),
    0,
  );

  if (frontmost > SPAWN_Z + minGap) return null;

  const type =
    OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  const lane = LANES[Math.floor(Math.random() * LANES.length)];
  const def = OBSTACLE_DEFS[type];

  return {
    id: `obs_${++_obstacleCounter}`,
    type,
    lane,
    z: SPAWN_Z,
    ...def,
  };
}

// ─── Coin Spawner ─────────────────────────────────────────────────────────────
export function maybeSpawnCoins(
  currentCoins: CoinState[],
  speed: number,
): CoinState[] {
  const minGap = Math.max(10, 18 - speed * 0.3);

  const frontmost = currentCoins.reduce<number>(
    (acc, c) => (c.z < acc ? c.z : acc),
    0,
  );

  if (frontmost > SPAWN_Z + minGap) return [];

  const lane = LANES[Math.floor(Math.random() * LANES.length)];
  const arcCount = 4 + Math.floor(Math.random() * 3); // 4–6 coins
  const spacing = 2.5;

  const coins: CoinState[] = [];
  for (let i = 0; i < arcCount; i++) {
    const t = i / (arcCount - 1);
    const height = 0.5 + Math.sin(t * Math.PI) * 1.2;
    coins.push({
      id: `coin_${++_coinCounter}`,
      lane,
      z: SPAWN_Z - i * spacing,
      height,
      collected: false,
    });
  }
  return coins;
}

// ─── Shield Spawner ───────────────────────────────────────────────────────────
// Shields are ~1/3 as frequent as coin groups.
// We check a separate "shield channel" gap so they don't flood.
export function maybeSpawnShield(
  currentShields: ShieldState[],
  speed: number,
): ShieldState | null {
  // Much larger min gap than coins → roughly 1/3 frequency
  const minGap = Math.max(35, 55 - speed * 0.5);

  const frontmost = currentShields.reduce<number>(
    (acc, s) => (s.z < acc ? s.z : acc),
    0,
  );

  if (frontmost > SPAWN_Z + minGap) return null;

  // Extra random gate: 40% chance even when gap is clear (makes it feel rare)
  if (Math.random() > 0.4) return null;

  const lane = LANES[Math.floor(Math.random() * LANES.length)];

  return {
    id: `shield_${++_shieldCounter}`,
    lane,
    z: SPAWN_Z,
    collected: false,
  };
}
