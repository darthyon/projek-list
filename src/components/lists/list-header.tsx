"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveList, duplicateList, renameList, restoreList, togglePinned } from "@/lib/db";
import type { List } from "@/lib/types/list";

export function ListHeader({ list }: { list: List }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(list.name);

  async function saveName() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== list.name) await renameList(list.id, draft);
  }

  async function onArchive() {
    await archiveList(list.id);
    router.push("/");
    toast("Archived", {
      action: { label: "Undo", onClick: () => void restoreList(list.id) },
    });
  }

  return (
    <header className="flex items-center gap-3">
      <Link
        href="/"
        aria-label="Back to home"
        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft className="size-5" aria-hidden />
      </Link>
      <span className="text-2xl" aria-hidden>
        {list.emoji}
      </span>
      {editing ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void saveName()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void saveName();
            if (e.key === "Escape") setEditing(false);
          }}
          aria-label="List name"
          className="h-9 text-lg font-bold"
        />
      ) : (
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold">{list.name}</h1>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="List options"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setDraft(list.name);
              setEditing(true);
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void togglePinned(list.id)}>
            {list.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              void duplicateList(list.id).then((clone) => {
                if (clone) {
                  toast("Duplicated", {
                    action: { label: "Open", onClick: () => router.push(`/list?id=${clone.id}`) },
                  });
                }
              });
            }}
          >
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void onArchive()}>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
