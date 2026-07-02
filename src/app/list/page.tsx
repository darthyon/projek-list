"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ChecklistView } from "@/components/lists/checklist/checklist-view";
import { getList } from "@/lib/db";

function ListView() {
  const id = useSearchParams().get("id");
  const list = useLiveQuery(() => (id ? getList(id) : undefined), [id]);

  if (!list) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-5 pt-6">
        <p className="text-muted-foreground">
          {id ? "List not found. It happens." : "No list selected."}
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to Home
        </Link>
      </main>
    );
  }

  if (list.type === "checklist") return <ChecklistView list={list} />;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-5 pt-6">
      <header className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {list.emoji}
        </span>
        <h1 className="text-2xl font-bold">{list.name}</h1>
      </header>
      <p className="text-sm text-muted-foreground">Shopping view arrives in Phase 4.</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        Back to Home
      </Link>
    </main>
  );
}

export default function ListPage() {
  return (
    <Suspense fallback={<main className="flex-1 p-5" />}>
      <ListView />
    </Suspense>
  );
}
