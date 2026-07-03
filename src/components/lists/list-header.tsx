"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArchiveDialog } from "@/components/lists/archive-dialog";
import {
  archiveList,
  db,
  deleteList,
  duplicateList,
  renameList,
  restoreItem,
  restoreList,
  togglePinned,
} from "@/lib/db";
import type { Item, List } from "@/lib/types/list";

export function ListHeader({ list, children }: { list: List; children?: ReactNode }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(list.name);
  const [archiveOpen, setArchiveOpen] = useState(false);

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

  async function onDelete() {
    const items = (await db.items.where("listId").equals(list.id).toArray()) as Item[];
    await deleteList(list.id);
    router.push("/");
    toast("Deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          void db.lists.add(list).then(() => Promise.all(items.map(restoreItem)));
        },
      },
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
          {children}
          {children && <DropdownMenuSeparator />}
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
          <DropdownMenuItem
            onClick={() => {
              // Defer past the dropdown's focus-return so the dialog stays open.
              window.setTimeout(() => setArchiveOpen(true), 0);
            }}
          >
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => void onDelete()}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onConfirm={() => void onArchive()}
      />
    </header>
  );
}
