"use client";

import { useRef, type PointerEvent } from "react";

/**
 * Long-press (500ms) for touch + pointer. Cancels on >10px movement so
 * scrolling never triggers it. Pair with onContextMenu for desktop right-click.
 */
export function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  function clear() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    origin.current = null;
  }

  return {
    fired,
    handlers: {
      onPointerDown(e: PointerEvent) {
        fired.current = false;
        origin.current = { x: e.clientX, y: e.clientY };
        timer.current = setTimeout(() => {
          fired.current = true;
          onLongPress();
        }, 500);
      },
      onPointerMove(e: PointerEvent) {
        if (!origin.current) return;
        const dx = e.clientX - origin.current.x;
        const dy = e.clientY - origin.current.y;
        if (Math.hypot(dx, dy) > 10) clear();
      },
      onPointerUp: clear,
      onPointerCancel: clear,
    },
  };
}
