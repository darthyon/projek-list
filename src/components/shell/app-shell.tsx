"use client";

import { createContext, useContext, useState } from "react";
import { MotionConfig } from "motion/react";
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

  function openCreate(type?: ListType) {
    if (type) setPresetType(type);
    setOpen(true);
  }

  return (
    <MotionConfig reducedMotion="user">
      <CreateSheetContext.Provider value={{ openCreate }}>
        <div className="flex min-h-dvh flex-col pb-20 md:pb-0 md:pl-20">{children}</div>
        <AppNav onNew={() => openCreate()} />
        <CreateSheet open={open} onOpenChange={setOpen} presetType={presetType} />
      </CreateSheetContext.Provider>
    </MotionConfig>
  );
}
