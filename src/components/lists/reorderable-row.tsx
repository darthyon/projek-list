"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Reorder, motion, useDragControls } from "motion/react";

interface ReorderableRowProps<T> {
  value: T;
  children: ReactNode;
}

const ReorderGestureContext = createContext<RefObject<boolean> | null>(null);

export function useReorderTapSuppression() {
  return useContext(ReorderGestureContext);
}

export function ReorderableRow<T>({ value, children }: ReorderableRowProps<T>) {
  const dragControls = useDragControls();
  const [pressing, setPressing] = useState(false);
  const [armed, setArmed] = useState(false);
  const suppressTap = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function clearGestureSoon() {
    setPressing(false);
    setArmed(false);
    setTimeout(() => {
      suppressTap.current = false;
    }, 0);
  }

  function isInteractiveTarget(target: EventTarget) {
    return (
      target instanceof HTMLElement &&
      target.closest("button,input,textarea,select,a,[contenteditable='true']") !== null
    );
  }

  return (
    <ReorderGestureContext.Provider value={suppressTap}>
      <Reorder.Item
        value={value}
        dragListener={false}
        dragControls={dragControls}
        onPointerDown={(event: PointerEvent) => {
          if (isInteractiveTarget(event.target)) return;
          origin.current = { x: event.clientX, y: event.clientY };
          setPressing(true);
          setArmed(false);
          clearTimer();
          timer.current = setTimeout(() => {
            suppressTap.current = true;
            setArmed(true);
            navigator.vibrate?.(8);
            dragControls.start(event);
          }, 300);
        }}
        onPointerMove={(event: PointerEvent) => {
          if (!origin.current || suppressTap.current) return;
          const dx = event.clientX - origin.current.x;
          const dy = event.clientY - origin.current.y;
          if (Math.hypot(dx, dy) > 8) {
            clearTimer();
            setPressing(false);
            setArmed(false);
          }
        }}
        onPointerUp={() => {
          clearTimer();
          origin.current = null;
          clearGestureSoon();
        }}
        onPointerCancel={() => {
          clearTimer();
          origin.current = null;
          clearGestureSoon();
        }}
        className="relative list-none"
      >
        <motion.div
          animate={{
            scale: armed ? 1.012 : pressing ? 0.992 : 1,
            y: armed ? -2 : 0,
          }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative rounded-xl"
        >
          {children}
          <motion.span
            aria-hidden
            animate={{ opacity: pressing || armed ? 1 : 0 }}
            className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-foreground/10"
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
            className="pointer-events-none absolute inset-x-3 -bottom-1 h-3 rounded-full bg-foreground/10 blur-md"
          />
        </motion.div>
      </Reorder.Item>
    </ReorderGestureContext.Provider>
  );
}
