"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ChecklistView } from "@/components/lists/checklist/checklist-view";
import { CompletedView } from "@/components/lists/shopping/completed-view";
import { ShoppingView } from "@/components/lists/shopping/shopping-view";
import { TrackerView } from "@/components/lists/tracker/tracker-view";
import { MealPlanView } from "@/components/lists/mealplan/mealplan-view";
import { ShopMode } from "@/components/shop-mode/shop-mode";
import { getList } from "@/lib/db";

function ListView() {
  const params = useSearchParams();
  const id = params.get("id");
  const shopMode = params.get("mode") === "shop";
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
  if (list.type === "tracker") return <TrackerView list={list} />;
  if (list.type === "mealplan") return <MealPlanView list={list} />;

  if (list.completedAt !== null) return <CompletedView list={list} />;
  if (shopMode) return <ShopMode list={list} />;
  return <ShoppingView list={list} />;
}

export default function ListPage() {
  return (
    <Suspense fallback={<main className="flex-1 p-5" />}>
      <ListView />
    </Suspense>
  );
}
