"use client";

import { Minus, Plus } from "lucide-react";

interface QtyStepperProps {
  qty: number;
  unit?: string;
  onChange: (qty: number) => void;
}

/** Clamped at 1 — removing an item is a delete, not a zero. */
export function QtyStepper({ qty, unit, onChange }: QtyStepperProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={qty <= 1}
        onClick={() => onChange(qty - 1)}
        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="min-w-6 text-center text-sm font-medium tabular-nums">
        {qty}
        {unit && <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(qty + 1)}
        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
