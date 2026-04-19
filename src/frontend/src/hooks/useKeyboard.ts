import { useCallback, useEffect, useRef } from "react";

export type GameAction = "left" | "right" | "jump" | "slide" | "groundSlam";

interface KeyboardOptions {
  onAction: (action: GameAction) => void;
  enabled?: boolean;
  /** Current jumping state so down key dispatches correctly */
  isJumping?: boolean;
}

export function useKeyboard({
  onAction,
  enabled = true,
  isJumping = false,
}: KeyboardOptions) {
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const isJumpingRef = useRef(isJumping);
  isJumpingRef.current = isJumping;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.code) {
        case "ArrowLeft":
        case "KeyA":
          e.preventDefault();
          onActionRef.current("left");
          break;
        case "ArrowRight":
        case "KeyD":
          e.preventDefault();
          onActionRef.current("right");
          break;
        case "ArrowUp":
        case "KeyW":
        case "Space":
          e.preventDefault();
          onActionRef.current("jump");
          break;
        case "ArrowDown":
        case "KeyS":
          e.preventDefault();
          // Context-aware: ground slam when airborne, slide when grounded
          onActionRef.current(isJumpingRef.current ? "groundSlam" : "slide");
          break;
        default:
          break;
      }
    },
    [enabled],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
