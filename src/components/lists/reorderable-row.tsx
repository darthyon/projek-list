"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { motion } from "motion/react";

interface ReorderableRowProps {
  id: string;
  children: ReactNode;
  onLongPressStart?: (id: string) => void;
  onLongPressMove: (id: string, x: number, y: number) => void;
  onLongPressEnd?: (id: string) => void;
}

const ReorderGestureContext = createContext<RefObject<boolean> | null>(null);

export function useReorderTapSuppression() {
  return useContext(ReorderGestureContext);
}

export function ReorderableRow({
  id,
  children,
  onLongPressStart,
  onLongPressMove,
  onLongPressEnd,
}: ReorderableRowProps) {
  const [pressing, setPressing] = useState(false);
  const [armed, setArmed] = useState(false);
  const suppressTap = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const activePointerId = useRef<number | null>(null);
  const activeElement = useRef<Element | null>(null);
  const isReordering = useRef(false);

  const reorderStyle: CSSProperties = { touchAction: armed ? "none" : "pan-y" };

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function clearGestureSoon() {
    setPressing(false);
    setArmed(false);
    activePointerId.current = null;
    activeElement.current = null;
    isReordering.current = false;
    setTimeout(() => {
      suppressTap.current = false;
    }, 120);
  }

  function finishGesture() {
    const wasReordering = isReordering.current;
    clearTimer();
    origin.current = null;
    if (wasReordering) onLongPressEnd?.(id);
    clearGestureSoon();
  }

  function isInteractiveTarget(target: EventTarget) {
    return (
      target instanceof HTMLElement &&
      target.closest("button,input,textarea,select,a,[contenteditable='true']") !== null
    );
  }

  useEffect(() => {
    if (!armed) return;

    const preventScroll = (event: TouchEvent) => {
      event.preventDefault();
    };
    const finishFromWindow = () => {
      finishGesture();
    };

    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("pointerup", finishFromWindow);
    window.addEventListener("pointercancel", finishFromWindow);
    window.addEventListener("blur", finishFromWindow);

    return () => {
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("pointerup", finishFromWindow);
      window.removeEventListener("pointercancel", finishFromWindow);
      window.removeEventListener("blur", finishFromWindow);
    };
  });

  return (
    <ReorderGestureContext.Provider value={suppressTap}>
      <motion.div
        layout
        data-reorder-id={id}
        style={reorderStyle}
        onPointerDown={(event: PointerEvent) => {
          if (isInteractiveTarget(event.target)) return;
          activeElement.current = event.currentTarget;
          activePointerId.current = event.pointerId;
          origin.current = { x: event.clientX, y: event.clientY };
          isReordering.current = false;
          suppressTap.current = false;
          setPressing(true);
          setArmed(false);
          clearTimer();
          timer.current = setTimeout(() => {
            suppressTap.current = true;
            isReordering.current = true;
            setArmed(true);
            const element = activeElement.current;
            const pointerId = activePointerId.current;
            if (element && pointerId !== null) {
              try {
                element.setPointerCapture(pointerId);
              } catch {
                // The pointer may already be released/cancelled on mobile browsers.
              }
            }
            navigator.vibrate?.(8);
            onLongPressStart?.(id);
          }, 300);
        }}
        onPointerMove={(event: PointerEvent) => {
          if (isReordering.current) {
            event.preventDefault();
            onLongPressMove(id, event.clientX, event.clientY);
            return;
          }
          if (!origin.current) return;
          const dx = event.clientX - origin.current.x;
          const dy = event.clientY - origin.current.y;
          if (Math.hypot(dx, dy) > 8) {
            clearTimer();
            setPressing(false);
            setArmed(false);
          }
        }}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
        onLostPointerCapture={finishGesture}
        className={`relative list-none ${armed ? "z-20" : "z-0"}`}
      >
        <motion.div
          animate={{
            scale: armed ? 1.016 : pressing ? 0.994 : 1,
            y: armed ? -3 : 0,
          }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-xl will-change-transform"
        >
          {children}
          <motion.span
            aria-hidden
            animate={{ opacity: pressing && !armed ? 1 : 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-foreground/8"
          />
          <motion.span
            aria-hidden
            animate={{ opacity: armed ? 1 : 0 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute inset-px rounded-[11px] bg-gradient-to-b from-background/45 to-transparent"
          />
          <motion.span
            aria-hidden
            initial={false}
            animate={{ scaleX: pressing && !armed ? 1 : 0, opacity: pressing && !armed ? 1 : 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="pointer-events-none absolute right-3 bottom-1 left-3 h-0.5 origin-left rounded-full bg-foreground/20"
          />
          <motion.span
            aria-hidden
            animate={{ opacity: armed ? 1 : 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute inset-x-4 -bottom-2 h-5 rounded-full bg-foreground/15 blur-xl"
          />
        </motion.div>
      </motion.div>
    </ReorderGestureContext.Provider>
  );
}
