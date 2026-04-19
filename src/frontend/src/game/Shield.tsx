import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { ShieldState } from "../types/game";

const LANE_X: Record<number, number> = { "-1": -2, "0": 0, "1": 2 };

interface ShieldProps {
  shield: ShieldState;
}

/**
 * Shield collectible — glowing cyan rotating shield shape.
 * Floats at mid-height, spins, and pulses with a point light.
 */
export default function Shield({ shield }: ShieldProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const timeRef = useRef(0);

  const x = LANE_X[shield.lane] ?? 0;

  useFrame((_s, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    groupRef.current.rotation.y += delta * 2.5;
    // Bob up and down
    groupRef.current.position.y = 1.2 + Math.sin(timeRef.current * 2.5) * 0.18;
  });

  if (shield.collected) return null;

  return (
    <group ref={groupRef} position={[x, 1.2, shield.z]}>
      {/* Shield body — cyan octahedron */}
      <mesh castShadow>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Outer ring glow */}
      <mesh>
        <torusGeometry args={[0.38, 0.04, 8, 32]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>

      {/* Inner cross/star */}
      <mesh position={[0, 0, 0.01]}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#7dd3fc"
          emissiveIntensity={1.5}
          roughness={0.05}
          metalness={0.9}
        />
      </mesh>

      {/* Cyan point light glow */}
      <pointLight intensity={1.8} distance={3.5} color="#22d3ee" />
    </group>
  );
}
