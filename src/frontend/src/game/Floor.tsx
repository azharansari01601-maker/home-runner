import { useFrame } from "@react-three/fiber";
import { type ReactElement, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../stores/useGameStore";

const TILE_SIZE = 4;
const NUM_TILES = 20; // enough to fill FOV at max speed
const CORRIDOR_WIDTH = 7;
const FLOOR_Y = 0;

// ─── Tile checker colors ─────────────────────────────────────────────────────
const TILE_A = new THREE.Color("#e8d5a3"); // warm cream
const TILE_B = new THREE.Color("#c8a97c"); // warm tan

/**
 * Floor — scrolling tiled floor tiles that tile seamlessly.
 * Uses instanced mesh for performance.
 */
export default function Floor() {
  const groupRef = useRef<THREE.Group>(null!);
  const scrollRef = useRef(0);
  const gamePhase = useGameStore((s) => s.gamePhase);
  const speed = useGameStore((s) => s.speed);

  useFrame((_s, delta) => {
    if (gamePhase !== "playing") return;
    scrollRef.current += speed * delta;
    if (scrollRef.current >= TILE_SIZE) {
      scrollRef.current -= TILE_SIZE;
    }
    if (groupRef.current) {
      groupRef.current.position.z = scrollRef.current;
    }
  });

  const tiles: ReactElement[] = [];
  for (let i = 0; i < NUM_TILES; i++) {
    // checker pattern
    const isA = i % 2 === 0;
    tiles.push(
      <mesh key={i} position={[0, FLOOR_Y, -i * TILE_SIZE]} receiveShadow>
        <boxGeometry args={[CORRIDOR_WIDTH, 0.1, TILE_SIZE]} />
        <meshStandardMaterial
          color={isA ? TILE_A : TILE_B}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>,
    );
  }

  // Floor skirting — darker strip at edge of corridor
  const skirtingColor = "#8b6940";

  return (
    <group ref={groupRef}>
      {tiles}
      {/* Left skirting */}
      <mesh
        position={[
          -CORRIDOR_WIDTH / 2 - 0.05,
          0.15,
          (-NUM_TILES * TILE_SIZE) / 2,
        ]}
      >
        <boxGeometry args={[0.1, 0.3, NUM_TILES * TILE_SIZE]} />
        <meshStandardMaterial color={skirtingColor} roughness={0.8} />
      </mesh>
      {/* Right skirting */}
      <mesh
        position={[
          CORRIDOR_WIDTH / 2 + 0.05,
          0.15,
          (-NUM_TILES * TILE_SIZE) / 2,
        ]}
      >
        <boxGeometry args={[0.1, 0.3, NUM_TILES * TILE_SIZE]} />
        <meshStandardMaterial color={skirtingColor} roughness={0.8} />
      </mesh>
    </group>
  );
}
