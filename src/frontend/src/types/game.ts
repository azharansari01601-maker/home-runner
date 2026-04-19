// ─── Game Phase ────────────────────────────────────────────────────────────────
export type GamePhase = "idle" | "playing" | "gameover";

// ─── Lane ──────────────────────────────────────────────────────────────────────
export type Lane = -1 | 0 | 1; // left, center, right

// ─── Player ────────────────────────────────────────────────────────────────────
export interface PlayerState {
  lane: Lane;
  isJumping: boolean;
  isSliding: boolean;
  jumpStartTime: number;
  isInvincible: boolean;
  invincibleUntil: number; // timestamp ms, 0 = not invincible
  isGroundSlamming: boolean; // fast-fall in progress
}

// ─── Obstacle Types ────────────────────────────────────────────────────────────
export type ObstacleType =
  | "sofa" // wide low — slide under
  | "lamp" // tall thin — jump or dodge lane
  | "table" // wide tall — dodge lane only
  | "chair" // medium — jump or dodge lane
  | "bookshelf" // tall wide (full lane) — dodge lane only
  | "trash_can"; // small — jump over

// ─── Obstacle ──────────────────────────────────────────────────────────────────
export interface ObstacleState {
  id: string;
  type: ObstacleType;
  lane: Lane;
  z: number; // world Z position (negative = ahead in -Z)
  width: number; // in lane units (1 = one lane)
  height: number; // in world units
  requiresSlide: boolean;
  requiresJump: boolean;
}

// ─── Coin ──────────────────────────────────────────────────────────────────────
export interface CoinState {
  id: string;
  lane: Lane;
  z: number;
  height: number; // vertical offset for arcs
  collected: boolean;
}

// ─── Shield ────────────────────────────────────────────────────────────────────
export interface ShieldState {
  id: string;
  lane: Lane;
  z: number;
  collected: boolean;
}

// ─── Score Entry (mirrors backend ScoreEntry) ─────────────────────────────────
export interface ScoreEntry {
  playerName: string;
  score: bigint;
  timestamp: bigint;
}

// ─── Full Game State ───────────────────────────────────────────────────────────
export interface GameState {
  // meta
  gamePhase: GamePhase;
  playerName: string;
  highScore: number;

  // runtime
  score: number;
  coins: number;
  shields: number; // total shields collected this run
  speed: number; // world units / second
  distanceTravelled: number;

  // entities
  player: PlayerState;
  obstacles: ObstacleState[];
  activeCoins: CoinState[];
  activeShields: ShieldState[];

  // actions
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  setPlayerName: (name: string) => void;
  setHighScore: (score: number) => void;

  // runtime mutators (called by game loop)
  addScore: (delta: number) => void;
  collectCoin: (id: string) => void;
  collectShield: (id: string) => void;
  tickInvincibility: () => void;
  setSpeed: (speed: number) => void;
  setObstacles: (obstacles: ObstacleState[]) => void;
  setCoins: (coins: CoinState[]) => void;
  setShields: (shields: ShieldState[]) => void;
  setPlayer: (player: Partial<PlayerState>) => void;
  addDistance: (delta: number) => void;
}
