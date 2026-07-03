"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { db, deleteList, getArchivedLists, restoreList } from "@/lib/db";
import { restoreItem } from "@/lib/db";
import type { List } from "@/lib/types/list";

const DATE_FMT = new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", year: "numeric" });

export default function ArchivedPage() {
  const lists = useLiveQuery(getArchivedLists);

  async function onDelete(list: List) {
    // Keep a copy for undo — permanent delete is still undo-able for one toast.
    const items = await db.items.where("listId").equals(list.id).toArray();
    await deleteList(list.id);
    toast("Deleted for good", {
      action: {
        label: "Undo",
        onClick: () => {
          void db.lists.add(list).then(() => Promise.all(items.map(restoreItem)));
        },
      },
    });
  }

  if (lists === undefined) return null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-5 pt-6">
      <header className="flex items-center gap-3">
        <Link
          href="/settings"
          aria-label="Back to settings"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="text-xl font-bold">Archived lists</h1>
      </header>

      {lists.length === 0 ? (
        <p className="text-muted-foreground">Nothing archived. Everything still in play.</p>
      ) : (
        <div className="space-y-2">
          {lists.map((list) => (
            <div
              key={list.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="text-xl" aria-hidden>
                {list.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{list.name}</p>
                <p className="text-xs text-muted-foreground">
                  Archived {list.archivedAt !== null ? DATE_FMT.format(list.archivedAt) : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void restoreList(list.id)}
                className="shrink-0 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-secondary"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={() => void onDelete(list)}
                className="shrink-0 rounded-full px-3 py-1 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
