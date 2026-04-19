import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useGameStore } from "../stores/useGameStore";
import type { ScoreEntry } from "../types/game";

// ─── Stat tile inside game over card ─────────────────────────────────────────
interface StatTileProps {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatTile({ icon, label, value, highlight }: StatTileProps) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl px-3 py-3"
      style={{
        background: highlight
          ? "linear-gradient(135deg, oklch(0.65 0.18 45 / 0.12), oklch(0.55 0.22 35 / 0.08))"
          : "oklch(0.95 0.02 75)",
        border: highlight
          ? "1.5px solid oklch(0.65 0.18 45 / 0.35)"
          : "1.5px solid oklch(0.88 0.03 75)",
      }}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span
        className="font-display text-xl font-bold tabular-nums leading-none"
        style={{
          color: highlight ? "oklch(0.45 0.18 45)" : "oklch(0.30 0.05 45)",
        }}
      >
        {value}
      </span>
      <span
        className="font-body text-xs font-semibold"
        style={{ color: "oklch(0.55 0.05 65)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Leaderboard row ─────────────────────────────────────────────────────────
function LeaderRow({
  entry,
  rank,
  isMe,
}: { entry: ScoreEntry; rank: number; isMe: boolean }) {
  const medal =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;

  return (
    <motion.div
      className="flex items-center gap-3 rounded-xl px-3 py-2"
      style={{
        background: isMe
          ? "oklch(0.62 0.24 142 / 0.12)"
          : rank <= 3
            ? "oklch(0.65 0.18 45 / 0.07)"
            : "transparent",
        border: isMe
          ? "1.5px solid oklch(0.62 0.24 142 / 0.30)"
          : "1.5px solid transparent",
      }}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
    >
      <span
        className="w-6 text-center font-display text-sm font-bold"
        style={{ color: "oklch(0.55 0.10 55)" }}
      >
        {medal}
      </span>
      <span
        className="min-w-0 flex-1 truncate font-body text-sm font-semibold"
        style={{ color: isMe ? "oklch(0.35 0.18 142)" : "oklch(0.30 0.05 45)" }}
      >
        {entry.playerName}
      </span>
      <span
        className="font-display text-sm font-bold tabular-nums"
        style={{ color: "oklch(0.45 0.18 45)" }}
      >
        {Number(entry.score).toLocaleString()}
      </span>
    </motion.div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];

// ─── Main GameOver component ──────────────────────────────────────────────────
export function GameOver() {
  const {
    score,
    coins,
    highScore,
    distanceTravelled,
    resetGame,
    playerName,
    startGame,
  } = useGameStore();
  const { highScores, isLoadingScores, saveScore, isSaving } = useLeaderboard();
  const savedRef = useRef(false);
  const playerNameRef = useRef(playerName);
  const scoreRef = useRef(score);
  const saveScoreRef = useRef(saveScore);
  playerNameRef.current = playerName;
  scoreRef.current = score;
  saveScoreRef.current = saveScore;

  const timeSurvived = Math.floor(distanceTravelled / 8);

  // Save score once on mount — using refs to avoid stale closure without dep issues
  useEffect(() => {
    if (!savedRef.current && scoreRef.current > 0) {
      savedRef.current = true;
      saveScoreRef.current({
        playerName: playerNameRef.current,
        score: scoreRef.current,
      });
    }
  }, []);

  const isNewHighScore = score >= highScore && score > 0;

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto px-4 py-8"
      style={{
        background: "oklch(0.12 0.03 35 / 0.78)",
        backdropFilter: "blur(8px)",
      }}
      data-ocid="gameover.overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{
          background: "oklch(0.99 0.01 75)",
          boxShadow: "0 24px 64px oklch(0 0 0 / 0.40)",
        }}
        initial={{ scale: 0.88, y: 32, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="text-5xl"
            animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {isNewHighScore ? "🏆" : "🏠"}
          </motion.div>
          <h2
            className="mt-1 font-display text-3xl font-bold"
            style={{ color: "oklch(0.40 0.18 45)" }}
            data-ocid="gameover.title"
          >
            {isNewHighScore ? "New High Score!" : "Game Over"}
          </h2>
          {isNewHighScore && (
            <p
              className="font-body text-sm font-semibold"
              style={{ color: "oklch(0.55 0.20 142)" }}
            >
              You smashed the record! 🎉
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <StatTile
            icon="⭐"
            label="Final Score"
            value={score.toLocaleString()}
            highlight
          />
          <StatTile icon="🪙" label="Coins" value={coins.toString()} />
          <StatTile icon="⏱️" label="Time" value={`${timeSurvived}s`} />
          <StatTile icon="🏅" label="Best" value={highScore.toLocaleString()} />
        </div>

        {/* CTA buttons */}
        <div className="mt-5 flex flex-col gap-3">
          <motion.button
            type="button"
            data-ocid="gameover.restart_button"
            onClick={startGame}
            className="w-full rounded-2xl py-3.5 font-display text-lg font-bold transition-smooth"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.18 45), oklch(0.55 0.22 35))",
              color: "oklch(0.99 0 0)",
              boxShadow: "0 6px 18px oklch(0.55 0.18 45 / 0.40)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ▶ Play Again
          </motion.button>

          <button
            type="button"
            data-ocid="gameover.menu_button"
            onClick={resetGame}
            className="w-full rounded-2xl py-3 font-body text-sm font-bold transition-smooth"
            style={{
              background: "oklch(0.93 0.03 75)",
              color: "oklch(0.45 0.08 55)",
              border: "1.5px solid oklch(0.85 0.04 75)",
            }}
          >
            Main Menu
          </button>
        </div>

        {/* Leaderboard */}
        <div className="mt-6" data-ocid="gameover.leaderboard">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h3
              className="font-display text-base font-bold"
              style={{ color: "oklch(0.35 0.10 50)" }}
            >
              Leaderboard
            </h3>
            {isSaving && (
              <span
                className="ml-auto rounded-full px-2 py-0.5 font-body text-xs font-semibold"
                data-ocid="gameover.saving_state"
                style={{
                  background: "oklch(0.62 0.24 142 / 0.15)",
                  color: "oklch(0.40 0.22 142)",
                }}
              >
                Saving…
              </span>
            )}
          </div>

          <div
            className="rounded-2xl p-2"
            style={{ background: "oklch(0.96 0.02 75)" }}
          >
            {isLoadingScores ? (
              <div
                className="flex flex-col gap-2 p-2"
                data-ocid="gameover.leaderboard_loading"
              >
                {SKELETON_KEYS.map((k, i) => (
                  <div
                    key={k}
                    className="h-9 animate-pulse rounded-xl"
                    style={{
                      background: "oklch(0.90 0.02 75)",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            ) : highScores.length === 0 ? (
              <div
                className="py-6 text-center font-body text-sm"
                data-ocid="gameover.leaderboard_empty"
                style={{ color: "oklch(0.60 0.04 65)" }}
              >
                No scores yet — you're first! 🎉
              </div>
            ) : (
              <div
                className="flex flex-col gap-1"
                data-ocid="gameover.leaderboard_list"
              >
                {highScores.slice(0, 10).map((entry, i) => (
                  <div
                    key={`${entry.playerName}_${String(entry.score)}`}
                    data-ocid={`gameover.leaderboard.item.${i + 1}`}
                  >
                    <LeaderRow
                      entry={entry}
                      rank={i + 1}
                      isMe={
                        entry.playerName === playerName &&
                        Number(entry.score) === score
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
