import { create } from "zustand";
import type {
  CoinState,
  GamePhase,
  GameState,
  ObstacleState,
  PlayerState,
  ShieldState,
} from "../types/game";

export const INITIAL_SPEED = 8;
const INVINCIBILITY_DURATION_MS = 5000;

const initialPlayer: PlayerState = {
  lane: 0,
  isJumping: false,
  isSliding: false,
  jumpStartTime: 0,
  isInvincible: false,
  invincibleUntil: 0,
  isGroundSlamming: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  // ── Meta ─────────────────────────────────────────────────────────────────
  gamePhase: "idle" as GamePhase,
  playerName: "Player",
  highScore: 0,

  // ── Runtime ───────────────────────────────────────────────────────────────
  score: 0,
  coins: 0,
  shields: 0,
  speed: INITIAL_SPEED,
  distanceTravelled: 0,

  // ── Entities ─────────────────────────────────────────────────────────────
  player: { ...initialPlayer },
  obstacles: [],
  activeCoins: [],
  activeShields: [],

  // ── Phase Actions ─────────────────────────────────────────────────────────
  startGame: () => {
    set({
      gamePhase: "playing",
      score: 0,
      coins: 0,
      shields: 0,
      speed: INITIAL_SPEED,
      distanceTravelled: 0,
      player: { ...initialPlayer },
      obstacles: [],
      activeCoins: [],
      activeShields: [],
    });
  },

  endGame: () => {
    const { score, highScore } = get();
    set({
      gamePhase: "gameover",
      highScore: Math.max(score, highScore),
    });
  },

  resetGame: () => {
    set({
      gamePhase: "idle",
      score: 0,
      coins: 0,
      shields: 0,
      speed: INITIAL_SPEED,
      distanceTravelled: 0,
      player: { ...initialPlayer },
      obstacles: [],
      activeCoins: [],
      activeShields: [],
    });
  },

  setPlayerName: (name: string) => set({ playerName: name }),

  setHighScore: (score: number) => {
    const { highScore } = get();
    if (score > highScore) set({ highScore: score });
  },

  // ── Runtime Mutators ──────────────────────────────────────────────────────
  addScore: (delta: number) => {
    set((state) => ({ score: state.score + delta }));
  },

  collectCoin: (id: string) => {
    set((state) => ({
      coins: state.coins + 1,
      score: state.score + 50,
      activeCoins: state.activeCoins.map((c) =>
        c.id === id ? { ...c, collected: true } : c,
      ),
    }));
  },

  collectShield: (id: string) => {
    const now = Date.now();
    set((state) => ({
      shields: state.shields + 1,
      score: state.score + 100,
      activeShields: state.activeShields.map((s) =>
        s.id === id ? { ...s, collected: true } : s,
      ),
      player: {
        ...state.player,
        isInvincible: true,
        invincibleUntil: now + INVINCIBILITY_DURATION_MS,
      },
    }));
  },

  tickInvincibility: () => {
    const { player } = get();
    if (!player.isInvincible) return;
    if (Date.now() >= player.invincibleUntil) {
      set((state) => ({
        player: {
          ...state.player,
          isInvincible: false,
          invincibleUntil: 0,
        },
      }));
    }
  },

  setSpeed: (speed: number) => set({ speed }),

  setObstacles: (obstacles: ObstacleState[]) => set({ obstacles }),

  setCoins: (coins: CoinState[]) => set({ activeCoins: coins }),

  setShields: (shields: ShieldState[]) => set({ activeShields: shields }),

  setPlayer: (partial: Partial<PlayerState>) =>
    set((state) => ({ player: { ...state.player, ...partial } })),

  addDistance: (delta: number) => {
    set((state) => {
      const newDist = state.distanceTravelled + delta;
      // Score 1 point per meter, speed ramps every 200m
      const newScore = state.score + Math.floor(delta * 0.5);
      const newSpeed = INITIAL_SPEED + Math.floor(newDist / 200) * 1.5;
      return {
        distanceTravelled: newDist,
        score: newScore,
        speed: Math.min(newSpeed, 30),
      };
    });
  },
}));
