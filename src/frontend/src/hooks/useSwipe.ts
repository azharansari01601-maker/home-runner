import { useCallback, useEffect, useRef } from "react";
import type { GameAction } from "./useKeyboard";

interface SwipeOptions {
  onAction: (action: GameAction) => void;
  enabled?: boolean;
  /** Minimum swipe distance in pixels to trigger an action (default 40) */
  threshold?: number;
  /** Current jumping state so swipe-down dispatches correctly */
  isJumping?: boolean;
}

interface Touch {
  x: number;
  y: number;
  time: number;
}

export function useSwipe({
  onAction,
  enabled = true,
  threshold = 40,
  isJumping = false,
}: SwipeOptions) {
  const touchStart = useRef<Touch | null>(null);
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const isJumpingRef = useRef(isJumping);
  isJumpingRef.current = isJumping;

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [enabled],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;
      touchStart.current = null;

      if (dt > 600) return;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < threshold && absDy < threshold) return;

      if (absDx > absDy) {
        onActionRef.current(dx > 0 ? "right" : "left");
      } else {
        if (dy > 0) {
          // Swipe down — context-aware
          onActionRef.current(isJumpingRef.current ? "groundSlam" : "slide");
        } else {
          onActionRef.current("jump");
        }
      }
    },
    [enabled, threshold],
  );

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
}
