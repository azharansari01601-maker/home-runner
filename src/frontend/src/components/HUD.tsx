import { AnimatePresence, motion } from "motion/react";
import { useGameStore } from "../stores/useGameStore";

// ─── Small stat pill used in the HUD ─────────────────────────────────────────
interface StatPillProps {
  icon: string;
  value: string | number;
  label: string;
  ocid: string;
  accent?: boolean;
  glow?: "cyan" | "green";
}

function StatPill({ icon, value, label, ocid, accent, glow }: StatPillProps) {
  const glowStyle =
    glow === "cyan"
      ? {
          background: "oklch(0.25 0.12 210 / 0.90)",
          border: "1.5px solid oklch(0.78 0.18 210 / 0.70)",
          boxShadow:
            "0 0 14px oklch(0.78 0.18 210 / 0.55), 0 4px 14px oklch(0 0 0 / 0.22)",
        }
      : accent
        ? {
            background: "oklch(0.40 0.22 142 / 0.85)",
            border: "1.5px solid oklch(0.62 0.24 142 / 0.5)",
            boxShadow: "0 4px 14px oklch(0 0 0 / 0.22)",
          }
        : {
            background: "oklch(0.12 0.02 35 / 0.72)",
            border: "1.5px solid oklch(0.99 0 0 / 0.10)",
            boxShadow: "0 4px 14px oklch(0 0 0 / 0.22)",
          };

  return (
    <div
      data-ocid={ocid}
      className="flex items-center gap-2 rounded-2xl px-3 py-2"
      style={{ backdropFilter: "blur(10px)", ...glowStyle }}
    >
      <span className="text-lg leading-none">{icon}</span>
      <div className="min-w-0">
        <div
          className="font-display text-lg font-bold leading-none tabular-nums"
          style={{
            color: glow === "cyan" ? "oklch(0.88 0.14 210)" : "oklch(0.99 0 0)",
          }}
        >
          {value}
        </div>
        <div
          className="font-body text-xs leading-none"
          style={{
            color:
              glow === "cyan"
                ? "oklch(0.75 0.10 210)"
                : accent
                  ? "oklch(0.88 0.08 142)"
                  : "oklch(0.75 0.03 75)",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Shield timer badge ───────────────────────────────────────────────────────
function ShieldBadge({
  invincibleUntil,
}: {
  invincibleUntil: number;
}) {
  const remaining = Math.max(
    0,
    Math.ceil((invincibleUntil - Date.now()) / 1000),
  );

  return (
    <motion.div
      data-ocid="hud.shield_active"
      className="flex items-center gap-2 rounded-2xl px-3 py-2"
      style={{
        background: "oklch(0.20 0.14 210 / 0.92)",
        border: "1.5px solid oklch(0.75 0.18 210 / 0.80)",
        boxShadow:
          "0 0 20px oklch(0.75 0.18 210 / 0.65), 0 4px 14px oklch(0 0 0 / 0.22)",
        backdropFilter: "blur(10px)",
      }}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.3, ease: "backOut" }}
    >
      <motion.span
        className="text-xl leading-none"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        🛡️
      </motion.span>
      <div className="min-w-0">
        <div
          className="font-display text-lg font-bold leading-none tabular-nums"
          style={{ color: "oklch(0.88 0.14 210)" }}
        >
          {remaining}s
        </div>
        <div
          className="font-body text-xs leading-none"
          style={{ color: "oklch(0.72 0.10 210)" }}
        >
          Shield
        </div>
      </div>
    </motion.div>
  );
}

// ─── Speed bar ───────────────────────────────────────────────────────────────
const MIN_SPEED = 8;
const MAX_SPEED = 30;

function SpeedBar({ speed }: { speed: number }) {
  const pct = Math.round(((speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * 100);
  const clamped = Math.min(Math.max(pct, 0), 100);

  return (
    <div
      data-ocid="hud.speed_panel"
      className="flex flex-col gap-1 rounded-2xl px-3 py-2"
      style={{
        background: "oklch(0.12 0.02 35 / 0.72)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 14px oklch(0 0 0 / 0.22)",
        border: "1.5px solid oklch(0.99 0 0 / 0.10)",
        minWidth: "88px",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm leading-none">⚡</span>
        <span
          className="font-display text-sm font-bold tabular-nums"
          style={{ color: "oklch(0.99 0 0)" }}
        >
          {speed.toFixed(1)}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "oklch(0.99 0 0 / 0.15)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              clamped < 50
                ? "oklch(0.72 0.20 142)"
                : clamped < 80
                  ? "oklch(0.72 0.18 65)"
                  : "oklch(0.65 0.22 25)",
          }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <div
        className="text-center font-body text-xs leading-none"
        style={{ color: "oklch(0.75 0.03 75)" }}
      >
        Speed
      </div>
    </div>
  );
}

// ─── Main HUD ────────────────────────────────────────────────────────────────
export function HUD() {
  const { score, coins, shields, speed, player } = useGameStore();
  const isInvincible = player.isInvincible;
  const invincibleUntil = player.invincibleUntil;

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4"
      data-ocid="hud.panel"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Left: score */}
      <StatPill
        icon="🏠"
        value={score.toLocaleString()}
        label="Score"
        ocid="hud.score"
      />

      {/* Right group: shield (when active) + coins + speed */}
      <div className="flex items-start gap-2">
        <AnimatePresence>
          {isInvincible && (
            <ShieldBadge key="shield-badge" invincibleUntil={invincibleUntil} />
          )}
        </AnimatePresence>
        <StatPill
          icon="🛡️"
          value={shields}
          label="Shields"
          ocid="hud.shields"
          glow={isInvincible ? "cyan" : undefined}
        />
        <StatPill
          icon="🪙"
          value={coins}
          label="Coins"
          ocid="hud.coins"
          accent
        />
        <SpeedBar speed={speed} />
      </div>
    </motion.div>
  );
}
