"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";
import { exportBackup, importBackup } from "@/lib/db/backup";
import { resetAndSeed } from "@/lib/mocks/seed";
import { cn } from "@/lib/utils";

const CloudBackupDialog = dynamic(
  () => import("@/components/settings/cloud-backup-dialog").then((m) => ({ default: m.CloudBackupDialog })),
  { ssr: false },
);

const THEMES = ["system", "light", "dark"] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <span className="font-medium">{label}</span>
      {children}
    </div>
  );
}

const DATE_STAMP = () => new Date().toISOString().slice(0, 10);

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const fileRef = useRef<HTMLInputElement>(null);
  const [cloudOpen, setCloudOpen] = useState(false);

  async function onExport() {
    const blob = await exportBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projek-list-backup-${DATE_STAMP()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded. Keep it somewhere safe.");
  }

  async function onImport(file: File) {
    try {
      const { lists, items } = await importBackup(await file.text());
      toast(`Restored ${lists} lists, ${items} items.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-3 p-5 pt-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Row label="Theme">
        {mounted && (
          <div role="radiogroup" aria-label="Theme" className="flex gap-1 rounded-full bg-secondary p-1">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={theme === t}
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm capitalize transition-colors",
                  theme === t ? "bg-card shadow-xs" : "text-muted-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </Row>

      <Row label="Currency">
        <span className="text-sm text-muted-foreground">RM · Malaysia</span>
      </Row>

      <Row label="Export backup">
        <button
          type="button"
          onClick={() => void onExport()}
          className="rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-secondary"
        >
          Download JSON
        </button>
      </Row>

      <Row label="Import backup">
        <>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            aria-label="Choose backup file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onImport(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-secondary"
          >
            Choose file
          </button>
        </>
      </Row>

      <Row label="Cloud backup">
        <button
          type="button"
          onClick={() => setCloudOpen(true)}
          className="rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-secondary"
        >
          Open
        </button>
      </Row>

      <Link
        href="/settings/archived"
        className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
      >
        <span className="font-medium">Archived lists</span>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
      </Link>

      {process.env.NODE_ENV === "development" && (
        <Row label="Sample data (dev)">
          <button
            type="button"
            onClick={() => {
              void resetAndSeed().then(() => toast("Seeded. Go look at Home."));
            }}
            className="rounded-full border border-border px-3 py-1 text-sm hover:bg-secondary"
          >
            Load
          </button>
        </Row>
      )}
      <CloudBackupDialog open={cloudOpen} onOpenChange={setCloudOpen} />
    </main>
  );
}
