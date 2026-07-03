"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Delete } from "lucide-react";
import { formatSen, senFromDigits } from "@/lib/money";
import { cn } from "@/lib/utils";

interface PricePadProps {
  open: boolean;
  itemName: string;
  /** Existing price in sen, if editing. */
  initialSen?: number;
  /** Show "Skip" instead of "Cancel" — the into-trolley flow. */
  skippable?: boolean;
  onSave: (sen: number) => void;
  onClose: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"] as const;

/** Sen-first entry: digits only, decimal auto-placed from the right. 420 → RM 4.20. */
export function PricePad({ open, itemName, initialSen, skippable, onSave, onClose }: PricePadProps) {
  const [digits, setDigits] = useState("");

  // Prefill when opening — state-during-render.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDigits(initialSen !== undefined && initialSen > 0 ? String(initialSen) : "");
  }

  const sen = senFromDigits(digits);

  function press(key: string) {
    navigator.vibrate?.(5);
    if (key === "⌫") setDigits((d) => d.slice(0, -1));
    else if (digits.length < 7) setDigits((d) => (d === "" && key === "0" ? d : d + key));
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-label={`Price for ${itemName}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-2xl border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg"
          >
            <p className="truncate text-center text-sm text-muted-foreground">{itemName}</p>
            <p
              className={cn(
                "py-2 text-center font-mono text-3xl font-semibold tabular-nums",
                digits === "" && "text-muted-foreground",
              )}
              aria-live="polite"
            >
              {formatSen(sen)}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {KEYS.map((key, i) =>
                key === "" ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    aria-label={key === "⌫" ? "Delete digit" : key}
                    onClick={() => press(key)}
                    className="flex h-12 items-center justify-center rounded-xl bg-secondary text-lg font-medium transition-transform active:scale-95"
                  >
                    {key === "⌫" ? <Delete className="size-5" aria-hidden /> : key}
                  </button>
                ),
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 flex-1 rounded-full border border-border text-sm font-medium transition-colors hover:bg-secondary"
              >
                {skippable ? "Skip" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={digits === ""}
                onClick={() => {
                  onSave(sen);
                  onClose();
                }}
                className="h-11 flex-1 rounded-full bg-primary text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
