"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/ui/mascot";

interface ArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** The one confirmation dialog in the app — approved exception to undo-never-confirm.
    See DESIGN.md "Mascot". */
export function ArchiveDialog({ open, onOpenChange, onConfirm }: ArchiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-xs rounded-2xl">
        <div className="flex justify-center pt-2">
          <Mascot pose="arms-crossed" className="size-16" />
        </div>
        <DialogHeader className="items-center text-center">
          <DialogTitle>Archive this list?</DialogTitle>
          <DialogDescription>You can reopen it later. Probably.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1 rounded-full">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1 rounded-full"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
