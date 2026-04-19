import { useFrame } from "@react-three/fiber";
import { type ReactElement, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/useGameStore";

const CORRIDOR_WIDTH = 7;
const CORRIDOR_HEIGHT = 4;
const CORRIDOR_LENGTH = 80;
const WALL_Y = CORRIDOR_HEIGHT / 2;

// ─── Wallpaper stripe colors ─────────────────────────────────────────────────
const WALL_BASE = "#f5e6d0";
const WALL_STRIPE = "#e8c9a0";
const CEILING_COL = "#fdf4e8";

/**
 * Environment — static corridor walls, ceiling, wallpaper stripes,
 * decorative pictures, and scrolling ceiling lights.
 */
export default function Environment() {
  const lightsRef = useRef<THREE.Group>(null!);
  const scrollRef = useRef(0);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const speed = useGameStore((s) => s.speed);

  const LIGHT_SPACING = 12;
  const NUM_LIGHTS = 8;

  useFrame((_s, delta) => {
    if (gamePhase !== "playing") return;
    scrollRef.current += speed * delta;
    if (scrollRef.current >= LIGHT_SPACING) {
      scrollRef.current -= LIGHT_SPACING;
    }
    if (lightsRef.current) {
      lightsRef.current.position.z = scrollRef.current;
    }
  });

  // Wallpaper stripes (vertical thin boxes on the wall)
  const stripes: ReactElement[] = [];
  const STRIPE_COUNT = 18;
  for (let i = 0; i < STRIPE_COUNT; i++) {
    const zPos = -i * (CORRIDOR_LENGTH / STRIPE_COUNT);
    stripes.push(
      // Left wall stripes
      <mesh key={`sl${i}`} position={[-CORRIDOR_WIDTH / 2, WALL_Y, zPos]}>
        <boxGeometry args={[0.02, CORRIDOR_HEIGHT, 0.8]} />
        <meshStandardMaterial color={WALL_STRIPE} roughness={1} />
      </mesh>,
      // Right wall stripes
      <mesh key={`sr${i}`} position={[CORRIDOR_WIDTH / 2, WALL_Y, zPos]}>
        <boxGeometry args={[0.02, CORRIDOR_HEIGHT, 0.8]} />
        <meshStandardMaterial color={WALL_STRIPE} roughness={1} />
      </mesh>,
    );
  }

  // Ceiling lights (pendants scrolling forward)
  const ceilLights: ReactElement[] = [];
  for (let i = 0; i < NUM_LIGHTS; i++) {
    const z = -i * LIGHT_SPACING;
    ceilLights.push(
      <group key={`cl${i}`} position={[0, CORRIDOR_HEIGHT - 0.05, z]}>
        {/* Cord */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#5a3e28" />
        </mesh>
        {/* Lamp shade */}
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.35, 0.3, 12, 1, true]} />
          <meshStandardMaterial
            color="#f0c060"
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>
        {/* Bulb glow */}
        <mesh position={[0, -0.45, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color="#fffbe0"
            emissive="#ffe080"
            emissiveIntensity={2}
          />
        </mesh>
        {/* Point light */}
        <pointLight intensity={1.5} distance={8} color="#ffe8a0" castShadow />
      </group>,
    );
  }

  // Decorative picture frames on walls
  const pictures = [
    { x: -CORRIDOR_WIDTH / 2 + 0.05, z: -12, rotY: Math.PI / 2 },
    { x: -CORRIDOR_WIDTH / 2 + 0.05, z: -30, rotY: Math.PI / 2 },
    { x: CORRIDOR_WIDTH / 2 - 0.05, z: -20, rotY: -Math.PI / 2 },
    { x: CORRIDOR_WIDTH / 2 - 0.05, z: -40, rotY: -Math.PI / 2 },
  ];

  return (
    <group>
      {/* ── Left wall ────────────────────────────────────────────────────── */}
      <mesh position={[-CORRIDOR_WIDTH / 2, WALL_Y, -CORRIDOR_LENGTH / 2]}>
        <boxGeometry args={[0.1, CORRIDOR_HEIGHT, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color={WALL_BASE} roughness={0.9} />
      </mesh>

      {/* ── Right wall ───────────────────────────────────────────────────── */}
      <mesh position={[CORRIDOR_WIDTH / 2, WALL_Y, -CORRIDOR_LENGTH / 2]}>
        <boxGeometry args={[0.1, CORRIDOR_HEIGHT, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color={WALL_BASE} roughness={0.9} />
      </mesh>

      {/* ── Back wall (far end) ──────────────────────────────────────────── */}
      <mesh position={[0, WALL_Y, -CORRIDOR_LENGTH]}>
        <boxGeometry args={[CORRIDOR_WIDTH, CORRIDOR_HEIGHT, 0.1]} />
        <meshStandardMaterial color={WALL_BASE} roughness={0.9} />
      </mesh>

      {/* ── Ceiling ──────────────────────────────────────────────────────── */}
      <mesh position={[0, CORRIDOR_HEIGHT, -CORRIDOR_LENGTH / 2]}>
        <boxGeometry args={[CORRIDOR_WIDTH, 0.1, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color={CEILING_COL} roughness={0.95} />
      </mesh>

      {/* ── Crown molding top ─────────────────────────────────────────────── */}
      <mesh
        position={[
          -CORRIDOR_WIDTH / 2,
          CORRIDOR_HEIGHT - 0.05,
          -CORRIDOR_LENGTH / 2,
        ]}
      >
        <boxGeometry args={[0.15, 0.15, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color="#d4b483" roughness={0.8} />
      </mesh>
      <mesh
        position={[
          CORRIDOR_WIDTH / 2,
          CORRIDOR_HEIGHT - 0.05,
          -CORRIDOR_LENGTH / 2,
        ]}
      >
        <boxGeometry args={[0.15, 0.15, CORRIDOR_LENGTH]} />
        <meshStandardMaterial color="#d4b483" roughness={0.8} />
      </mesh>

      {stripes}

      {/* ── Picture frames ────────────────────────────────────────────────── */}
      {pictures.map((p) => (
        <group
          key={`pic_${p.z}`}
          position={[p.x, WALL_Y + 0.3, p.z]}
          rotation={[0, p.rotY, 0]}
        >
          {/* Frame border */}
          <mesh>
            <boxGeometry args={[0.06, 0.8, 0.6]} />
            <meshStandardMaterial color="#7b4f2e" roughness={0.6} />
          </mesh>
          {/* Canvas */}
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.01, 0.65, 0.45]} />
            <meshStandardMaterial
              color={p.z % 2 === 0 ? "#c8e6c9" : "#bbdefb"}
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* ── Scrolling ceiling lights ──────────────────────────────────────── */}
      <group ref={lightsRef}>{ceilLights}</group>
    </group>
  );
}
