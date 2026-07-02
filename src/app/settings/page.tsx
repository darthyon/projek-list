"use client";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMounted } from "@/hooks/use-mounted";
import { resetAndSeed } from "@/lib/mocks/seed";
import { cn } from "@/lib/utils";

const THEMES = ["system", "light", "dark"] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <span className="font-medium">{label}</span>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

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

      <Row label="Export / Import">
        <span className="text-sm text-muted-foreground">Coming in Phase 5</span>
      </Row>

      <Row label="Archived lists">
        <span className="text-sm text-muted-foreground">Coming in Phase 3</span>
      </Row>

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
    </main>
  );
}
