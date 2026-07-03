"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Trash2 } from "lucide-react";
import { useReorderTapSuppression } from "@/components/lists/reorderable-row";
import { cn } from "@/lib/utils";

interface SwipeRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  onClick?: () => void;
  /** Suppress click after a long-press (pair with useLongPress `fired`). */
  clickSuppressed?: () => boolean;
  innerClassName?: string;
  role?: string;
  ariaChecked?: boolean;
  ariaLabel?: string;
  onKeyDown?: (e: KeyboardEvent) => void;
  longPressHandlers?: {
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
  };
}

/**
 * Swipe-left-to-delete with explicit intent: red underlay (trash + "Delete")
 * revealed as the row slides. Outer layer owns FLIP; inner layer owns drag.
 */
export function SwipeRow({
  children,
  onDelete,
  onClick,
  clickSuppressed,
  innerClassName,
  role,
  ariaChecked,
  ariaLabel,
  onKeyDown,
  longPressHandlers,
}: SwipeRowProps) {
  const x = useMotionValue(0);
  const underlayOpacity = useTransform(x, [-72, -12], [1, 0]);
  const dragging = useRef(false);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const handledPointerTap = useRef(false);
  const reorderTapSuppressedRef = useReorderTapSuppression();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ layout: { type: "spring", stiffness: 500, damping: 40 } }}
      className="relative"
    >
      <motion.div
        style={{ opacity: underlayOpacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-end pr-1"
        aria-hidden
      >
        <span className="flex h-[calc(100%-0.5rem)] items-center gap-1.5 rounded-full bg-destructive px-4 text-white shadow-sm">
          <Trash2 className="size-4" />
          <span className="text-sm font-medium">Delete</span>
        </span>
      </motion.div>
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.4, right: 0.05 }}
        dragSnapToOrigin
        onPointerDown={(e) => {
          pointerOrigin.current = { x: e.clientX, y: e.clientY };
          longPressHandlers?.onPointerDown(e);
        }}
        onPointerMove={(e) => {
          longPressHandlers?.onPointerMove(e);
        }}
        onPointerUp={(e) => {
          const origin = pointerOrigin.current;
          pointerOrigin.current = null;
          longPressHandlers?.onPointerUp();
          if (!origin || dragging.current || clickSuppressed?.() || reorderTapSuppressedRef?.current) {
            return;
          }
          const dx = e.clientX - origin.x;
          const dy = e.clientY - origin.y;
          if (Math.hypot(dx, dy) < 8) {
            handledPointerTap.current = true;
            onClick?.();
          }
        }}
        onPointerCancel={() => {
          pointerOrigin.current = null;
          longPressHandlers?.onPointerCancel();
        }}
        onDragStart={() => {
          dragging.current = true;
        }}
        onDragEnd={(_, info) => {
          setTimeout(() => {
            dragging.current = false;
          }, 0);
          if (info.offset.x < -90) onDelete();
        }}
        onClick={() => {
          if (reorderTapSuppressedRef?.current) {
            reorderTapSuppressedRef.current = false;
            return;
          }
          if (handledPointerTap.current) {
            handledPointerTap.current = false;
            return;
          }
          if (!dragging.current && !clickSuppressed?.()) onClick?.();
        }}
        role={role}
        aria-checked={role === "checkbox" ? ariaChecked : undefined}
        aria-label={ariaLabel}
        tabIndex={onClick || onKeyDown ? 0 : undefined}
        onKeyDown={onKeyDown}
        className={cn("touch-pan-y select-none", innerClassName)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
