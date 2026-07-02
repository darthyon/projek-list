"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  icon: Icon,
  vertical,
}: {
  href: string;
  label: string;
  icon: typeof House;
  vertical?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs transition-colors",
        vertical && "px-2",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
      {label}
    </Link>
  );
}

function NewButton({ onNew }: { onNew: () => void }) {
  return (
    <button
      type="button"
      onClick={onNew}
      aria-label="New list"
      className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95"
    >
      <Plus className="size-6" aria-hidden />
    </button>
  );
}

export function AppNav({ onNew }: { onNew: () => void }) {
  return (
    <>
      {/* Mobile: bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <NavLink href="/" label="Home" icon={House} />
        <div className="-mt-4">
          <NewButton onNew={onNew} />
        </div>
        <NavLink href="/settings" label="Settings" icon={Settings} />
      </nav>

      {/* Desktop/tablet: left rail */}
      <nav
        aria-label="Main"
        className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center gap-2 border-r border-border bg-card/95 py-6 md:flex"
      >
        <NavLink href="/" label="Home" icon={House} vertical />
        <div className="my-2">
          <NewButton onNew={onNew} />
        </div>
        <NavLink href="/settings" label="Settings" icon={Settings} vertical />
      </nav>
    </>
  );
}
