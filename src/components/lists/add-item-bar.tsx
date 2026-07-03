"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";

interface AddItemBarProps {
  placeholder: string;
  onAdd: (name: string) => void | Promise<unknown>;
  autoFocus?: boolean;
  /** Override the default page-level sticky positioning (e.g. "static" inside Shop Mode). */
  positionClassName?: string;
}

/** Sticky above the nav — rapid entry: type, Enter, keep typing. */
export function AddItemBar({ placeholder, onAdd, autoFocus, positionClassName }: AddItemBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const name = value.trim();
    if (!name) return;
    void onAdd(name);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <div
      className={
        positionClassName ??
        "sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 md:bottom-4"
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-4 shadow-md"
      >
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Add item"
          enterKeyHint="done"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Add"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
        >
          <Plus className="size-5" aria-hidden />
        </button>
      </form>
    </div>
  );
}
