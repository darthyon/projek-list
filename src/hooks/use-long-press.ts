"use client";

import { useRef, type PointerEvent } from "react";

/**
 * Long-press (500ms) → dispatches a synthetic `contextmenu` event on the
 * pressed element, so ContextMenuTrigger opens for touch users the same way
 * right-click does on desktop. Cancels on >10px movement so scrolling and
 * drags never trigger it. `fired` lets tap handlers suppress the tap that
 * follows a long-press.
 */
export function useLongPress() {
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
        const target = e.currentTarget;
        const { clientX, clientY } = e;
        timer.current = setTimeout(() => {
          fired.current = true;
          target.dispatchEvent(
            new MouseEvent("contextmenu", { bubbles: true, clientX, clientY }),
          );
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
