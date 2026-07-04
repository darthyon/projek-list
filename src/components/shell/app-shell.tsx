"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { cn } from "@/lib/utils";
import { AppNav } from "./app-nav";
import { CreateSheet } from "./create-sheet";
import type { ListType } from "@/lib/types/list";

interface CreateSheetContextValue {
  openCreate: (presetType?: ListType) => void;
}

const CreateSheetContext = createContext<CreateSheetContextValue | null>(null);

export function useCreateSheet(): CreateSheetContextValue {
  const ctx = useContext(CreateSheetContext);
  if (!ctx) throw new Error("useCreateSheet must be used inside AppShell");
  return ctx;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [presetType, setPresetType] = useState<ListType>("checklist");
  // Focus mode: inside a list, mobile bottom nav disappears — keyboard + entries only.
  const focusMode = usePathname() === "/list";

  function openCreate(type?: ListType) {
    if (type) setPresetType(type);
    setOpen(true);
  }

  return (
    <MotionConfig reducedMotion="user">
      <CreateSheetContext.Provider value={{ openCreate }}>
        <div className={cn("flex min-h-dvh flex-col md:pb-0 md:pl-20", !focusMode && "pb-20")}>
          {children}
        </div>
        <AppNav onNew={openCreate} hideMobile={focusMode} />
        <CreateSheet open={open} onOpenChange={setOpen} presetType={presetType} />
      </CreateSheetContext.Provider>
    </MotionConfig>
  );
}
