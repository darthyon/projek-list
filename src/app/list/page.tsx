"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft } from "lucide-react";
import { getList } from "@/lib/db";

function ListView() {
  const id = useSearchParams().get("id");
  const list = useLiveQuery(() => (id ? getList(id) : undefined), [id]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-5 pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Home
      </Link>
      {list ? (
        <header className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {list.emoji}
          </span>
          <h1 className="text-2xl font-bold">{list.name}</h1>
        </header>
      ) : (
        <p className="text-muted-foreground">List not found. It happens.</p>
      )}
      <p className="text-sm text-muted-foreground">List view arrives in Phase 3.</p>
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
