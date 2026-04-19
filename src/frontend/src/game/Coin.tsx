import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { CoinState } from "../types/game";

const LANE_X: Record<number, number> = { "-1": -2, "0": 0, "1": 2 };

interface CoinProps {
  coin: CoinState;
}

/**
 * Coin — spinning golden torus ring.
 * Position is driven from game store (coin.z updated by game loop).
 */
export default function Coin({ coin }: CoinProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const x = LANE_X[coin.lane] ?? 0;

  useFrame((_s, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 3;
    }
  });

  if (coin.collected) return null;

  return (
    <group position={[x, coin.height + 0.5, coin.z]}>
      {/* Outer torus ring */}
      <mesh ref={meshRef} castShadow>
        <torusGeometry args={[0.28, 0.07, 10, 24]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#f5a800"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      {/* Inner star marker */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color="#fff176"
          emissive="#ffe000"
          emissiveIntensity={1}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Glow point light */}
      <pointLight intensity={0.6} distance={2} color="#ffd700" />
    </group>
  );
}
