"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Greeting } from "@/components/shell/greeting";
import { ListCard } from "@/components/shell/list-card";
import { useCreateSheet } from "@/components/shell/app-shell";
import { getActiveLists } from "@/lib/db";
import { cn } from "@/lib/utils";
import { TYPE_META, type ListType } from "@/lib/types/list";

const PITCHES: Record<ListType, string> = {
  checklist: "for things to do",
  shopping: "for things to buy",
};

function TypeChips({ big }: { big?: boolean }) {
  const { openCreate } = useCreateSheet();
  return (
    <div className={cn("flex gap-2", big && "flex-col")}>
      {(Object.keys(TYPE_META) as ListType[]).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => openCreate(type)}
          className={cn(
            "flex items-center gap-2 rounded-full border border-border bg-card transition-colors hover:bg-secondary/50 active:scale-[0.98]",
            big ? "rounded-2xl p-5 text-left" : "px-4 py-2.5 text-sm font-medium",
          )}
        >
          <span className={cn(big && "text-2xl")} aria-hidden>
            {TYPE_META[type].emoji}
          </span>
          <span className={cn(big && "flex flex-col")}>
            <span className={cn(big && "font-bold")}>{TYPE_META[type].label}</span>
            {big && <span className="text-sm text-muted-foreground">{PITCHES[type]}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const lists = useLiveQuery(getActiveLists);

  if (lists === undefined) {
    return <main className="flex-1 p-5" />;
  }

  const open = lists.filter((l) => !(l.type === "shopping" && l.completedAt !== null));
  const done = lists.filter((l) => l.type === "shopping" && l.completedAt !== null);
  const hasOpenTrip = lists.some(
    (l) => l.type === "shopping" && l.completedAt === null && l.estTotalAtStart !== null,
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-5 pt-8">
      <Greeting hasLists={lists.length > 0} hasOpenTrip={hasOpenTrip} />

      {lists.length === 0 ? (
        <TypeChips big />
      ) : (
        <>
          <TypeChips />
          <section aria-label="Your lists" className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {open.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
              {done.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
