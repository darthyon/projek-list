"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Trash2 } from "lucide-react";
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
        className="absolute inset-0 flex items-center justify-end gap-1.5 rounded-xl bg-destructive pr-4 text-white"
        aria-hidden
      >
        <Trash2 className="size-4" />
        <span className="text-sm font-medium">Delete</span>
      </motion.div>
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.4, right: 0.05 }}
        dragSnapToOrigin
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
          if (!dragging.current && !clickSuppressed?.()) onClick?.();
        }}
        {...longPressHandlers}
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
