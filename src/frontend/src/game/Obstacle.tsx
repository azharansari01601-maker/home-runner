import * as THREE from "three";
import type { ObstacleState, ObstacleType } from "../types/game";

const LANE_X: Record<number, number> = { "-1": -2, "0": 0, "1": 2 };

// ─── Color palette per obstacle type ─────────────────────────────────────────
const COLORS: Record<ObstacleType, string[]> = {
  sofa: ["#e07b54", "#c95e35"],
  lamp: ["#f5c842", "#e8a020"],
  table: ["#8b5e3c", "#6b4226"],
  chair: ["#9c6b3c", "#7a4f2b"],
  bookshelf: ["#5c3d1e", "#7b5230"],
  trash_can: ["#607d8b", "#455a64"],
};

// ─── Static leg positions (avoids array-index key lint errors) ────────────────
const SOFA_LEGS = [
  [-0.6, -0.35],
  [-0.6, 0.35],
  [0.6, -0.35],
  [0.6, 0.35],
] as [number, number][];
const TABLE_LEGS = [
  [-0.6, -0.3],
  [-0.6, 0.3],
  [0.6, -0.3],
  [0.6, 0.3],
] as [number, number][];
const CHAIR_LEGS = [
  [-0.28, -0.22],
  [-0.28, 0.22],
  [0.28, -0.22],
  [0.28, 0.22],
] as [number, number][];
const SHELF_Y = [0.3, 0.8, 1.3, 1.8] as number[];
const SHELF_BX = [-0.4, -0.2, 0.0, 0.2, 0.4] as number[];
const BOOK_COLORS = ["#e53935", "#1e88e5", "#43a047", "#fb8c00", "#8e24aa"];

// ─── Sofa ─────────────────────────────────────────────────────────────────────
function SofaMesh({ color }: { color: string[] }) {
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[1.5, 0.28, 0.9]} />
        <meshStandardMaterial color={color[0]} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.58, -0.36]} castShadow>
        <boxGeometry args={[1.5, 0.6, 0.2]} />
        <meshStandardMaterial color={color[1]} roughness={0.9} />
      </mesh>
      <mesh position={[-0.65, 0.42, 0]}>
        <boxGeometry args={[0.2, 0.52, 0.9]} />
        <meshStandardMaterial color={color[1]} roughness={0.9} />
      </mesh>
      <mesh position={[0.65, 0.42, 0]}>
        <boxGeometry args={[0.2, 0.52, 0.9]} />
        <meshStandardMaterial color={color[1]} roughness={0.9} />
      </mesh>
      {SOFA_LEGS.map(([lx, lz]) => (
        <mesh key={`${lx}_${lz}`} position={[lx, 0.05, lz]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 6]} />
          <meshStandardMaterial color="#5a3018" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Lamp ─────────────────────────────────────────────────────────────────────
function LampMesh({ color }: { color: string[] }) {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.2, 10]} />
        <meshStandardMaterial color="#8b6914" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial color="#c8a020" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <coneGeometry args={[0.32, 0.4, 12, 1, true]} />
        <meshStandardMaterial
          color={color[0]}
          side={THREE.DoubleSide}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#fffbe0"
          emissive="#ffe080"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function TableMesh({ color }: { color: string[] }) {
  return (
    <group>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.1, 0.8]} />
        <meshStandardMaterial color={color[0]} roughness={0.7} />
      </mesh>
      {TABLE_LEGS.map(([lx, lz]) => (
        <mesh key={`${lx}_${lz}`} position={[lx, 0.48, lz]}>
          <cylinderGeometry args={[0.05, 0.05, 0.96, 8]} />
          <meshStandardMaterial color={color[1]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Chair ────────────────────────────────────────────────────────────────────
function ChairMesh({ color }: { color: string[] }) {
  return (
    <group>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.7, 0.1, 0.6]} />
        <meshStandardMaterial color={color[0]} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, -0.25]}>
        <boxGeometry args={[0.7, 0.76, 0.08]} />
        <meshStandardMaterial color={color[1]} roughness={0.8} />
      </mesh>
      {CHAIR_LEGS.map(([lx, lz]) => (
        <mesh key={`${lx}_${lz}`} position={[lx, 0.24, lz]}>
          <cylinderGeometry args={[0.03, 0.03, 0.48, 6]} />
          <meshStandardMaterial color={color[1]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Bookshelf ────────────────────────────────────────────────────────────────
function BookshelfMesh({ color }: { color: string[] }) {
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.3, 2.2, 0.4]} />
        <meshStandardMaterial color={color[0]} roughness={0.8} />
      </mesh>
      {SHELF_Y.map((y) => (
        <mesh key={`shelf_${y}`} position={[0, y, 0.01]}>
          <boxGeometry args={[1.2, 0.06, 0.38]} />
          <meshStandardMaterial color={color[1]} roughness={0.7} />
        </mesh>
      ))}
      {SHELF_Y.flatMap((y) =>
        SHELF_BX.map((bx) => (
          <mesh key={`book_${y}_${bx}`} position={[bx, y + 0.16, 0.03]}>
            <boxGeometry args={[0.12, 0.26, 0.3]} />
            <meshStandardMaterial
              color={
                BOOK_COLORS[
                  Math.round(y * 10 + bx * 10 + 30) % BOOK_COLORS.length
                ]
              }
              roughness={0.9}
            />
          </mesh>
        )),
      )}
    </group>
  );
}

// ─── Trash Can ────────────────────────────────────────────────────────────────
function TrashCanMesh({ color }: { color: string[] }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.7, 10]} />
        <meshStandardMaterial
          color={color[0]}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 10]} />
        <meshStandardMaterial
          color={color[1]}
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <torusGeometry args={[0.07, 0.02, 6, 10, Math.PI]} />
        <meshStandardMaterial color="#37474f" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Main Obstacle component ──────────────────────────────────────────────────
interface ObstacleProps {
  obstacle: ObstacleState;
}

export default function Obstacle({ obstacle }: ObstacleProps) {
  const x = LANE_X[obstacle.lane] ?? 0;
  const colors = COLORS[obstacle.type];

  return (
    <group position={[x, 0, obstacle.z]}>
      {obstacle.type === "sofa" && <SofaMesh color={colors} />}
      {obstacle.type === "lamp" && <LampMesh color={colors} />}
      {obstacle.type === "table" && <TableMesh color={colors} />}
      {obstacle.type === "chair" && <ChairMesh color={colors} />}
      {obstacle.type === "bookshelf" && <BookshelfMesh color={colors} />}
      {obstacle.type === "trash_can" && <TrashCanMesh color={colors} />}
    </group>
  );
}
