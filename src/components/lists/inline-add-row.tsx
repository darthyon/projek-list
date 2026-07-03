"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

interface InlineAddRowProps {
  label: string;
  onAdd: (name: string) => void | Promise<unknown>;
}

/**
 * Apple Reminders-style entry: the add row lives inside the list, so each
 * committed item appears in place right above it. Enter commits and keeps
 * the row open for rapid entry; blur commits and closes.
 */
export function InlineAddRow({ label, onAdd }: InlineAddRowProps) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function commit(keepOpen: boolean) {
    const name = value.trim();
    if (name) void onAdd(name);
    setValue("");
    if (keepOpen) inputRef.current?.focus();
    else setActive(false);
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="size-5" aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-3">
      <span
        className="size-6 shrink-0 rounded-full border-2 border-border"
        aria-hidden
      />
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(true);
          if (e.key === "Escape") setActive(false);
        }}
        onBlur={() => commit(false)}
        placeholder={label}
        aria-label={label}
        enterKeyHint="next"
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
