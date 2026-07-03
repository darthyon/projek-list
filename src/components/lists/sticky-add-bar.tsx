"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface StickyAddBarProps {
  label: string;
  onAdd: (name: string) => void | Promise<unknown>;
  onFocus?: () => void;
  sticky?: boolean;
  sections?: string[];
  selectedSection?: string;
  onSectionChange?: (section: string) => void;
}

export function StickyAddBar({
  label,
  onAdd,
  onFocus,
  sticky = true,
  sections = [],
  selectedSection = "",
  onSectionChange,
}: StickyAddBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionLabel = selectedSection || "Inbox";

  function commit(keepFocus: boolean) {
    const name = value.trim();
    if (name) void onAdd(name);
    setValue("");
    if (keepFocus) inputRef.current?.focus();
  }

  return (
    <div
      className={cn(
        sticky
          ? "sticky bottom-0 z-20 -mx-5 border-t border-border/80 bg-background/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:rounded-t-2xl md:border md:shadow-sm"
          : "mt-0",
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-sm">
        <Plus className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(true);
            if (e.key === "Escape") {
              setValue("");
              inputRef.current?.blur();
            }
          }}
          onBlur={() => commit(false)}
          placeholder={label}
          aria-label={label}
          enterKeyHint="next"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        {sections.length > 0 && onSectionChange && (
          <DropdownMenu>
            <DropdownMenuTrigger className="max-w-28 shrink-0 truncate rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              {sectionLabel}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup value={selectedSection} onValueChange={onSectionChange}>
                <DropdownMenuRadioItem value="">Inbox</DropdownMenuRadioItem>
                {sections.map((section) => (
                  <DropdownMenuRadioItem key={section} value={section}>
                    {section}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
