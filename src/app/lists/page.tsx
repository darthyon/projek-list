"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { ListCard } from "@/components/shell/list-card";
import { getActiveLists } from "@/lib/db";

export default function ListsPage() {
  const lists = useLiveQuery(getActiveLists);

  if (lists === undefined) {
    return <main className="flex-1 p-5" />;
  }

  const open = lists.filter((l) => !(l.type === "shopping" && l.completedAt !== null));
  const done = lists.filter((l) => l.type === "shopping" && l.completedAt !== null);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-5 pt-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Everything in one place.</p>
        <h1 className="text-3xl font-bold tracking-tight">All lists</h1>
      </header>

      {lists.length === 0 ? (
        <section className="rounded-3xl bg-card px-5 py-6 shadow-card">
          <p className="font-medium">No lists yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hit the plus button when you&apos;re ready to start one.
          </p>
        </section>
      ) : (
        <section aria-label="All lists" className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {open.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
            {done.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
