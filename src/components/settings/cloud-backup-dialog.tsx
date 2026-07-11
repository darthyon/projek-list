"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSession } from "@/components/providers/convex-client-provider";
import { api } from "../../../convex/_generated/api";
import { hashPin } from "@/lib/convex";
import { exportBackup, importBackup } from "@/lib/db/backup";
import type { Id } from "../../../convex/_generated/dataModel";

interface CloudBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AuthForm() {
  const { setSession } = useSession();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  const register = useMutation(api.auth.register);
  const login = useMutation(api.auth.login);

  async function handleRegister() {
    const trimmed = name.trim();
    const trimmedPin = pin.trim();
    if (!trimmed || trimmedPin.length < 4) {
      toast.error("Name required. PIN must be at least 4 digits.");
      return;
    }
    setBusy(true);
    try {
      const pinHash = await hashPin(trimmedPin);
      const userId = await register({ name: trimmed, pinHash });
      setSession({ id: userId, name: trimmed });
      toast.success("Account created.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to register.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin() {
    const trimmed = name.trim();
    const trimmedPin = pin.trim();
    if (!trimmed || !trimmedPin) return;

    setBusy(true);
    try {
      const pinHash = await hashPin(trimmedPin);
      const result = await login({ name: trimmed, pinHash });
      if (!result) {
        toast.error("Wrong name or PIN.");
        return;
      }
      setSession({ id: result.id, name: result.name });
      setName("");
      setPin("");
      toast.success(`Welcome back, ${result.name}.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DialogContent className="max-w-xs">
      <DialogHeader>
        <DialogTitle>Cloud backup</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Create an account with your name and a 4-digit PIN.
      </p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        aria-label="Name"
      />
      <Input
        type="password"
        inputMode="numeric"
        maxLength={16}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") void handleLogin();
        }}
        placeholder="PIN (min 4 digits)"
        aria-label="PIN"
      />
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => void handleRegister()} disabled={busy || !name.trim() || pin.length < 4}>
          Register
        </Button>
        <Button className="flex-1" onClick={() => void handleLogin()} disabled={busy || !name.trim() || !pin.trim()}>
          Sign in
        </Button>
      </div>
    </DialogContent>
  );
}

function CloudPanel({ userId }: { userId: Id<"users"> }) {
  const { session, setSession } = useSession();
  const [busy, setBusy] = useState(false);

  const pushBackup = useMutation(api.backups.push);
  const latestBackup = useQuery(api.backups.latest, { userId });

  async function handleBackup() {
    setBusy(true);
    try {
      const blob = await exportBackup();
      const raw = await blob.text();
      const parsed = JSON.parse(raw);
      await pushBackup({
        userId,
        data: raw,
        listCount: parsed.lists.length,
        itemCount: parsed.items.length,
      });
      toast.success(`Backed up ${parsed.lists.length} lists.`);
    } catch {
      toast.error("Backup failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    if (!latestBackup) return;
    setBusy(true);
    try {
      await importBackup(latestBackup.data);
      toast.success("Restored. Reloading…");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error("Restore failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DialogContent className="max-w-xs">
      <DialogHeader>
        <DialogTitle>Cloud backup</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{session?.name}</span>
        {latestBackup && (
          <> · last backup {new Date(latestBackup.createdAt).toLocaleDateString("en-MY")}</>
        )}
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={() => void handleBackup()} disabled={busy} className="w-full">
          Back up now
        </Button>
        <Button
          variant="outline"
          onClick={() => void handleRestore()}
          disabled={busy || !latestBackup}
          className="w-full"
        >
          Restore latest backup
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setSession(null);
          }}
          className="w-full"
        >
          Sign out
        </Button>
      </div>
    </DialogContent>
  );
}

export function CloudBackupDialog({ open, onOpenChange }: CloudBackupDialogProps) {
  const { session } = useSession();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {session ? (
        <CloudPanel userId={session.id as Id<"users">} />
      ) : (
        <AuthForm />
      )}
    </Dialog>
  );
}
