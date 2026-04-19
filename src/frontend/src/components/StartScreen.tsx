import { motion } from "motion/react";
import { useState } from "react";
import { useGameStore } from "../stores/useGameStore";

const HOUSE_EMOJIS = ["🏠", "🪑", "🛋️", "🪴", "🏡", "🪟"];
const EMOJI_KEYS = [
  "emoji-house",
  "emoji-chair",
  "emoji-sofa",
  "emoji-plant",
  "emoji-home",
  "emoji-window",
];

export function StartScreen() {
  const { startGame, setPlayerName, playerName, highScore } = useGameStore();
  const [name, setName] = useState(playerName);
  const [focused, setFocused] = useState(false);

  function handlePlay() {
    if (name.trim()) setPlayerName(name.trim());
    startGame();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handlePlay();
  }

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.97 0.06 75) 0%, oklch(0.93 0.08 60) 50%, oklch(0.88 0.10 45) 100%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating house decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {HOUSE_EMOJIS.map((emoji, i) => (
          <motion.span
            key={EMOJI_KEYS[i]}
            className="absolute text-4xl select-none"
            style={{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 20}%` }}
            animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
            transition={{
              duration: 2.5 + i * 0.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Main card */}
      <motion.div
        className="relative z-10 mx-4 w-full max-w-md rounded-3xl p-8 text-center"
        style={{
          background: "oklch(0.99 0.01 75 / 0.92)",
          boxShadow:
            "0 20px 60px oklch(0.55 0.14 45 / 0.25), 0 4px 16px oklch(0.55 0.14 45 / 0.12)",
          backdropFilter: "blur(12px)",
        }}
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{
          delay: 0.15,
          duration: 0.5,
          type: "spring",
          stiffness: 240,
          damping: 22,
        }}
      >
        {/* Roof decoration */}
        <motion.div
          className="mb-2 text-6xl leading-none"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          🏠
        </motion.div>

        <h1
          className="font-display text-5xl font-bold leading-none tracking-tight"
          style={{ color: "oklch(0.45 0.18 45)" }}
        >
          Home Runner
        </h1>

        <p
          className="mt-2 font-body text-lg font-semibold"
          style={{ color: "oklch(0.55 0.14 60)" }}
        >
          Dash through the ghar — dodge furniture, grab coins!
        </p>

        {highScore > 0 && (
          <motion.div
            className="mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-body text-sm font-bold"
            style={{
              background: "oklch(0.62 0.24 142 / 0.15)",
              color: "oklch(0.40 0.20 142)",
              border: "1.5px solid oklch(0.62 0.24 142 / 0.35)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            🏆 Best: {highScore.toLocaleString()}
          </motion.div>
        )}

        {/* Name input */}
        <div className="mt-6">
          <label
            htmlFor="player-name"
            className="mb-1.5 block text-left font-body text-sm font-bold"
            style={{ color: "oklch(0.50 0.08 60)" }}
          >
            Your Name
          </label>
          <input
            id="player-name"
            data-ocid="start.name_input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={20}
            placeholder="Enter your name…"
            className="w-full rounded-2xl px-4 py-3 font-body text-base font-semibold outline-none transition-smooth"
            style={{
              background: "oklch(0.96 0.03 75)",
              border: `2px solid ${focused ? "oklch(0.65 0.18 45)" : "oklch(0.85 0.06 75)"}`,
              color: "oklch(0.25 0.04 45)",
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>

        {/* Play button */}
        <motion.button
          type="button"
          data-ocid="start.play_button"
          onClick={handlePlay}
          className="mt-5 w-full rounded-2xl py-4 font-display text-xl font-bold tracking-wide transition-smooth"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.18 45), oklch(0.58 0.22 35))",
            color: "oklch(0.99 0 0)",
            boxShadow:
              "0 6px 20px oklch(0.55 0.18 45 / 0.45), inset 0 1px 0 oklch(0.80 0.12 55 / 0.4)",
          }}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 8px 28px oklch(0.55 0.18 45 / 0.55)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          ▶ Play Now
        </motion.button>

        {/* Controls hint */}
        <div
          className="mt-5 grid grid-cols-3 gap-2 rounded-2xl p-3"
          style={{ background: "oklch(0.94 0.03 75)" }}
        >
          {[
            { key: "← →", desc: "Switch Lane" },
            { key: "↑ / Space", desc: "Jump" },
            { key: "↓", desc: "Slide" },
          ].map(({ key, desc }) => (
            <div key={key} className="flex flex-col items-center gap-0.5">
              <span
                className="rounded-lg px-2 py-1 font-mono text-xs font-bold"
                style={{
                  background: "oklch(0.99 0 0)",
                  color: "oklch(0.45 0.18 45)",
                  border: "1.5px solid oklch(0.85 0.06 75)",
                  boxShadow: "0 2px 4px oklch(0 0 0 / 0.08)",
                }}
              >
                {key}
              </span>
              <span
                className="text-center font-body text-xs font-semibold"
                style={{ color: "oklch(0.55 0.06 65)" }}
              >
                {desc}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
