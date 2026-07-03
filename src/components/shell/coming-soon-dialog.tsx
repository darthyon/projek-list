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

interface ComingSoonDialogProps {
  /** Label of the upcoming list type, or null when closed. */
  label: string | null;
  onClose: () => void;
}

export function ComingSoonDialog({ label, onClose }: ComingSoonDialogProps) {
  return (
    <Dialog open={label !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-xs rounded-2xl">
        <DialogHeader className="items-center text-center">
          <DialogTitle>Coming soon.</DialogTitle>
          <DialogDescription>{label} isn&apos;t built yet. It&apos;s on the list.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button className="w-full rounded-full">Okay</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
