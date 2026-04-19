import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/useGameStore";

// ─── Lane world X positions ──────────────────────────────────────────────────
const LANE_X: Record<number, number> = { "-1": -2, "0": 0, "1": 2 };

// ─── Jump curve ──────────────────────────────────────────────────────────────
const JUMP_DURATION = 0.65; // seconds
const JUMP_HEIGHT = 2.2;

// ─── Ground slam ─────────────────────────────────────────────────────────────
const SLAM_VELOCITY = -18; // world units/s (fast fall)

// ─── Fakira position ─────────────────────────────────────────────────────────
const FAKIRA_X = -4.5; // left side of corridor, outside player lanes

// ─── Impact ring component ────────────────────────────────────────────────────
function ImpactRing({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const progressRef = useRef(0);

  useFrame((_s, delta) => {
    if (!meshRef.current) return;
    if (active && progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta * 3);
    } else if (!active) {
      progressRef.current = 0;
    }

    const p = progressRef.current;
    meshRef.current.scale.set(1 + p * 3, 1 + p * 3, 1);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = active ? Math.max(0, 0.8 - p * 0.9) : 0;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.25, 0.45, 24]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Shield aura component ────────────────────────────────────────────────────
function ShieldAura({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const timeRef = useRef(0);

  useFrame((_s, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (visible) {
      timeRef.current += delta * 3;
      mat.opacity = 0.18 + Math.sin(timeRef.current) * 0.07;
    } else {
      mat.opacity = 0;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1.0, 0]}>
      <sphereGeometry args={[1.05, 20, 20]} />
      <meshBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Shield aura outer ring ───────────────────────────────────────────────────
function ShieldRing({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const timeRef = useRef(0);

  useFrame((_s, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    if (visible) {
      timeRef.current += delta * 2;
      meshRef.current.rotation.z = timeRef.current;
      meshRef.current.rotation.x = Math.sin(timeRef.current * 0.7) * 0.3;
      mat.opacity = 0.55 + Math.sin(timeRef.current * 2) * 0.15;
    } else {
      mat.opacity = 0;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1.0, 0]}>
      <torusGeometry args={[1.0, 0.04, 8, 40]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Fakira companion character ───────────────────────────────────────────────
function Fakira() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const groupRef = useRef<THREE.Group>(null!);
  const timeRef = useRef(Math.random() * 10); // offset run cycle for variety
  const zOffsetRef = useRef(0);

  const ROBE = "#f97316"; // saffron/orange
  const SKIN = "#c8956a";
  const BEARD = "#d4a849";
  const TURBAN = "#fde68a";

  useFrame((_s, delta) => {
    if (!groupRef.current) return;
    if (gamePhase !== "playing") return;

    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    // Fakira loops in a 12-unit Z range around z=0, giving impression of running alongside
    zOffsetRef.current = Math.sin(timeRef.current * 0.35) * 1.5;
    groupRef.current.position.z = zOffsetRef.current;

    // Running animation
    const swing = Math.sin(timeRef.current * 8) * 0.35;
    const bob = Math.abs(Math.sin(timeRef.current * 8)) * 0.05;

    groupRef.current.position.y = bob;

    const legL = groupRef.current.getObjectByName("fak_leg_l") as
      | THREE.Mesh
      | undefined;
    const legR = groupRef.current.getObjectByName("fak_leg_r") as
      | THREE.Mesh
      | undefined;
    const armL = groupRef.current.getObjectByName("fak_arm_l") as
      | THREE.Mesh
      | undefined;
    const armR = groupRef.current.getObjectByName("fak_arm_r") as
      | THREE.Mesh
      | undefined;
    const robe = groupRef.current.getObjectByName("fak_robe") as
      | THREE.Mesh
      | undefined;

    if (legL) legL.rotation.x = swing;
    if (legR) legR.rotation.x = -swing;
    if (armL) armL.rotation.x = -swing * 0.6;
    if (armR) armR.rotation.x = swing * 0.6;
    // Robe sway
    if (robe) robe.rotation.z = Math.sin(timeRef.current * 8) * 0.04;
  });

  return (
    <group ref={groupRef} position={[FAKIRA_X, 0, 0]}>
      {/* ── Turban ──────────────────────────────────────────────────────────── */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.2, 0.28, 12]} />
        <meshStandardMaterial color={TURBAN} roughness={0.9} />
      </mesh>
      {/* Turban top knot */}
      <mesh position={[0, 2.18, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={TURBAN} roughness={0.9} />
      </mesh>

      {/* ── Head ────────────────────────────────────────────────────────────── */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.23, 14, 14]} />
        <meshStandardMaterial color={SKIN} roughness={0.8} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.09, 1.75, 0.21]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.09, 1.75, 0.21]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Beard */}
      <mesh position={[0, 1.58, 0.14]}>
        <sphereGeometry
          args={[0.15, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65]}
        />
        <meshStandardMaterial color={BEARD} roughness={1} />
      </mesh>

      {/* ── Robe/body (tall, thin) ───────────────────────────────────────────── */}
      <mesh name="fak_robe" position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.32, 1.4, 10]} />
        <meshStandardMaterial color={ROBE} roughness={0.85} />
      </mesh>

      {/* ── Left arm ────────────────────────────────────────────────────────── */}
      <mesh name="fak_arm_l" position={[-0.32, 1.22, 0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 7]} />
        <meshStandardMaterial color={ROBE} roughness={0.85} />
      </mesh>

      {/* ── Right arm ───────────────────────────────────────────────────────── */}
      <mesh name="fak_arm_r" position={[0.32, 1.22, 0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 7]} />
        <meshStandardMaterial color={ROBE} roughness={0.85} />
      </mesh>

      {/* ── Left leg ────────────────────────────────────────────────────────── */}
      <mesh name="fak_leg_l" position={[-0.12, 0.26, 0]}>
        <cylinderGeometry args={[0.075, 0.065, 0.58, 7]} />
        <meshStandardMaterial color={ROBE} roughness={0.85} />
      </mesh>

      {/* ── Right leg ───────────────────────────────────────────────────────── */}
      <mesh name="fak_leg_r" position={[0.12, 0.26, 0]}>
        <cylinderGeometry args={[0.075, 0.065, 0.58, 7]} />
        <meshStandardMaterial color={ROBE} roughness={0.85} />
      </mesh>

      {/* Feet (sandals — dark flat boxes) */}
      <mesh position={[-0.12, -0.02, 0.05]}>
        <boxGeometry args={[0.13, 0.06, 0.22]} />
        <meshStandardMaterial color="#4a3010" roughness={0.7} />
      </mesh>
      <mesh position={[0.12, -0.02, 0.05]}>
        <boxGeometry args={[0.13, 0.06, 0.22]} />
        <meshStandardMaterial color="#4a3010" roughness={0.7} />
      </mesh>

      {/* Walking staff */}
      <mesh position={[0.48, 0.9, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.025, 0.025, 1.9, 6]} />
        <meshStandardMaterial color="#7c4a1a" roughness={0.9} />
      </mesh>
      {/* Staff top orb */}
      <mesh position={[0.52, 1.84, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#d4a849" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Main Player component ────────────────────────────────────────────────────
/**
 * Player — cartoon character made from Three.js geometry.
 * Features:
 * - Lane-based movement with smooth X lerp
 * - Jump arc (sin curve, 2.2u peak, 0.65s)
 * - Ground slam (fast-fall when airborne + landing ring)
 * - Slide squat
 * - Shield aura when invincible
 * - Fakira companion on the left side
 */
export default function Player() {
  const groupRef = useRef<THREE.Group>(null!);
  const xRef = useRef(0);
  const timeRef = useRef(0);

  // Ground slam physics
  const yVelRef = useRef(0); // vertical velocity (world units/s)
  const yPosRef = useRef(0); // current Y (managed locally during slam)
  const slamActiveRef = useRef(false);

  // Impact ring trigger
  const [impactActive, setImpactActive] = useState(false);
  const impactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gamePhase = useGameStore((s) => s.gamePhase);
  const player = useGameStore((s) => s.player);
  const setPlayer = useGameStore((s) => s.setPlayer);

  useFrame((_s, delta) => {
    if (!groupRef.current) return;

    const dt = Math.min(delta, 0.05);
    timeRef.current += dt;

    // ── Lateral lerp ─────────────────────────────────────────────────────────
    const targetX = LANE_X[player.lane] ?? 0;
    xRef.current += (targetX - xRef.current) * Math.min(1, dt * 12);
    groupRef.current.position.x = xRef.current;

    // ── Vertical position ─────────────────────────────────────────────────────
    let yBase = 0;

    if (player.isGroundSlamming) {
      // Fast fall — integrate velocity
      yVelRef.current += SLAM_VELOCITY * dt * 4; // strongly negative
      yPosRef.current = Math.max(0, yPosRef.current + yVelRef.current * dt);

      if (yPosRef.current <= 0) {
        // Landed
        yPosRef.current = 0;
        yVelRef.current = 0;
        slamActiveRef.current = false;
        setPlayer({ isGroundSlamming: false, isJumping: false });

        // Trigger impact ring
        setImpactActive(true);
        if (impactTimerRef.current) clearTimeout(impactTimerRef.current);
        impactTimerRef.current = setTimeout(() => setImpactActive(false), 400);
      }
      yBase = yPosRef.current;
    } else if (player.isJumping) {
      const elapsed = (Date.now() - player.jumpStartTime) / 1000;
      const t = elapsed / JUMP_DURATION;
      if (t >= 1) {
        setPlayer({ isJumping: false });
        yBase = 0;
        yPosRef.current = 0;
      } else {
        yBase = Math.sin(t * Math.PI) * JUMP_HEIGHT;
        yPosRef.current = yBase; // keep in sync in case of slam initiation
      }
    } else {
      yPosRef.current = 0;
    }

    // ── Slide squat ───────────────────────────────────────────────────────────
    const isSliding = player.isSliding && !player.isJumping;
    const slideScale = isSliding ? 0.5 : 1;
    const slideYOffset = isSliding ? -0.35 : 0;

    groupRef.current.position.y = yBase + slideYOffset;
    groupRef.current.scale.y = slideScale;

    // ── Run cycle animations ──────────────────────────────────────────────────
    if (gamePhase !== "playing") return;

    const t = timeRef.current;
    const swing = Math.sin(t * 8) * 0.4;
    const bodyBob = Math.abs(Math.sin(t * 8)) * 0.04;

    const group = groupRef.current;

    const body = group.getObjectByName("body") as THREE.Mesh | undefined;
    if (body) body.position.y = 0.85 + bodyBob;

    const legL = group.getObjectByName("leg_l") as THREE.Mesh | undefined;
    const legR = group.getObjectByName("leg_r") as THREE.Mesh | undefined;
    if (legL) legL.rotation.x = swing;
    if (legR) legR.rotation.x = -swing;

    const armL = group.getObjectByName("arm_l") as THREE.Mesh | undefined;
    const armR = group.getObjectByName("arm_r") as THREE.Mesh | undefined;
    if (armL) armL.rotation.x = -swing;
    if (armR) armR.rotation.x = swing;
  });

  const SKIN = "#f5c89a";
  const SHIRT = "#e84393";
  const PANTS = "#3d5afe";
  const SHOE = "#333";
  const HAIR = "#4a2800";
  const SCARF = "#ff6d00";

  return (
    <>
      {/* ── Player group ───────────────────────────────────────────────────── */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Shield aura (visible when invincible) */}
        <ShieldAura visible={player.isInvincible} />
        <ShieldRing visible={player.isInvincible} />

        {/* ── Head ─────────────────────────────────────────────────────────── */}
        <mesh position={[0, 1.65, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial
            color={SKIN}
            roughness={0.8}
            emissive={player.isInvincible ? "#06b6d4" : "#000000"}
            emissiveIntensity={player.isInvincible ? 0.15 : 0}
          />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.88, 0]} castShadow>
          <sphereGeometry
            args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial color={HAIR} roughness={1} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.1, 1.68, 0.26]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0.1, 1.68, 0.26]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* ── Scarf ─────────────────────────────────────────────────────────── */}
        <mesh name="scarf" position={[0, 1.38, 0]}>
          <torusGeometry args={[0.22, 0.07, 8, 16]} />
          <meshStandardMaterial color={SCARF} roughness={0.9} />
        </mesh>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <mesh name="body" position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.55, 0.7, 0.32]} />
          <meshStandardMaterial
            color={SHIRT}
            roughness={0.7}
            emissive={player.isInvincible ? "#06b6d4" : "#000000"}
            emissiveIntensity={player.isInvincible ? 0.12 : 0}
          />
        </mesh>

        {/* ── Left arm ─────────────────────────────────────────────────────── */}
        <mesh name="arm_l" position={[-0.37, 0.9, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.52, 8]} />
          <meshStandardMaterial color={SHIRT} roughness={0.7} />
        </mesh>
        {/* Left hand */}
        <mesh position={[-0.37, 0.62, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.8} />
        </mesh>

        {/* ── Right arm ────────────────────────────────────────────────────── */}
        <mesh name="arm_r" position={[0.37, 0.9, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.52, 8]} />
          <meshStandardMaterial color={SHIRT} roughness={0.7} />
        </mesh>
        {/* Right hand */}
        <mesh position={[0.37, 0.62, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.8} />
        </mesh>

        {/* ── Left leg ─────────────────────────────────────────────────────── */}
        <mesh name="leg_l" position={[-0.17, 0.38, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.56, 8]} />
          <meshStandardMaterial color={PANTS} roughness={0.8} />
        </mesh>
        {/* Left shoe */}
        <mesh position={[-0.17, 0.07, 0.06]}>
          <boxGeometry args={[0.16, 0.1, 0.28]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>

        {/* ── Right leg ────────────────────────────────────────────────────── */}
        <mesh name="leg_r" position={[0.17, 0.38, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.56, 8]} />
          <meshStandardMaterial color={PANTS} roughness={0.8} />
        </mesh>
        {/* Right shoe */}
        <mesh position={[0.17, 0.07, 0.06]}>
          <boxGeometry args={[0.16, 0.1, 0.28]} />
          <meshStandardMaterial color={SHOE} roughness={0.6} />
        </mesh>

        {/* ── Landing impact ring ───────────────────────────────────────────── */}
        <ImpactRing active={impactActive} />
      </group>

      {/* ── Fakira companion (fixed on left side, outside game lanes) ─────── */}
      <Fakira />
    </>
  );
}
