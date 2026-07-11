"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Greeting } from "@/components/shell/greeting";
import { ListCard } from "@/components/shell/list-card";
import { ComingSoonDialog } from "@/components/shell/coming-soon-dialog";
import { createList, getActiveLists } from "@/lib/db";
import { TYPE_META, type ListType } from "@/lib/types/list";

const PITCHES: Record<ListType, string> = {
  checklist: "for things to do",
  shopping: "for things to buy",
  tracker: "track what you own",
  mealplan: "plan your meals",
};

// Future list types — visible, not tappable. Not part of ListType until they ship.
const UPCOMING: readonly { label: string; emoji: string; pitch: string }[] = [];

function QuickCreateGrid() {
  const router = useRouter();
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  // Quick create skips the sheet entirely — auto-named list, straight in.
  async function quickCreate(type: ListType) {
    const list = await createList({ type });
    router.push(`/list?id=${list.id}`);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {(Object.keys(TYPE_META) as ListType[]).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => void quickCreate(type)}
          className="flex flex-col gap-1.5 rounded-2xl bg-card p-4 text-left shadow-card transition-colors hover:bg-secondary/50 active:scale-[0.98]"
        >
          <span className="text-2xl" aria-hidden>
            {TYPE_META[type].emoji}
          </span>
          <span className="font-heading font-bold">{TYPE_META[type].label}</span>
          <span className="text-sm text-muted-foreground">{PITCHES[type]}</span>
        </button>
      ))}
      {UPCOMING.map((coming) => (
        <button
          key={coming.label}
          type="button"
          onClick={() => setComingSoon(coming.label)}
          className="flex flex-col gap-1.5 rounded-2xl bg-card p-4 text-left shadow-card transition-colors hover:bg-secondary/50 active:scale-[0.98]"
        >
          <span className="text-2xl" aria-hidden>
            {coming.emoji}
          </span>
          <span className="font-heading font-bold">{coming.label}</span>
          <span className="text-sm text-muted-foreground">{coming.pitch}</span>
        </button>
      ))}
      <ComingSoonDialog label={comingSoon} onClose={() => setComingSoon(null)} />
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
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-5 pt-8 pb-8">
      <Greeting hasOpenTrip={hasOpenTrip} />

      <div className="flex justify-center pb-2">
        <Image
          src="/img-list.svg"
          alt=""
          aria-hidden="true"
          width={771}
          height={807}
          className="h-auto w-48 max-h-[30vh]"
          priority
        />
      </div>

      <div className="-mt-16 pt-0">
        <QuickCreateGrid />
      </div>

      {lists.length > 0 && (
        <section aria-label="Your lists" className="pt-2 space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Your lists</h2>
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
