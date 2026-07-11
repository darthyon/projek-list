"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardList, House, Package, Plus, Soup, X } from "lucide-react";
import { useState } from "react";
import { ComingSoonDialog } from "@/components/shell/coming-soon-dialog";
import type { ListType } from "@/lib/types/list";
import { cn } from "@/lib/utils";

type NavDestination =
  | { kind: "link"; href: string }
  | { kind: "action"; onSelect: () => void };

interface NavItem {
  label: string;
  shortLabel: string;
  icon: typeof House;
  destination: NavDestination;
}

interface FabOption {
  label: string;
  emoji: string;
  type?: ListType;
  upcoming?: string;
}

const FAB_OPTIONS: FabOption[] = [
  { label: "Checklist", emoji: "✅", type: "checklist" },
  { label: "Shopping", emoji: "🛒", type: "shopping" },
  { label: "Tracker", emoji: "📦", type: "tracker" },
  { label: "Meal Plan", emoji: "🍳", type: "mealplan" },
];

function NavLink({
  item,
  label,
  icon: Icon,
  active,
  vertical,
}: {
  item: NavDestination;
  label: string;
  icon: typeof House;
  active?: boolean;
  vertical?: boolean;
}) {
  const classes = cn(
    "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] leading-none transition-all duration-200",
    vertical && "w-full px-2 py-3 text-xs",
    active
      ? "bg-background/90 text-foreground shadow-[0_10px_24px_-18px_rgba(74,63,53,0.9)]"
      : "text-muted-foreground hover:text-foreground",
  );

  const content = (
    <>
      <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
      <span className="truncate">{label}</span>
    </>
  );

  if (item.kind === "link") {
    return (
      <Link href={item.href} aria-current={active ? "page" : undefined} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onSelect} className={classes}>
      {content}
    </button>
  );
}

function FabButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? "Close create menu" : "Open create menu"}
      aria-expanded={open}
      className={cn(
        "flex size-14 items-center justify-center rounded-full bg-foreground text-background shadow-[0_18px_34px_-20px_rgba(28,25,23,0.9)] transition-transform duration-200 active:scale-95",
        open && "scale-105",
      )}
    >
      <motion.span
        animate={{ rotate: open ? 90 : 0, scale: open ? 1.04 : 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="flex items-center justify-center"
      >
        {open ? <X className="size-6" aria-hidden /> : <Plus className="size-6" aria-hidden />}
      </motion.span>
    </button>
  );
}

function FabMenu({
  open,
  onCreate,
  onComingSoon,
}: {
  open: boolean;
  onCreate: (type: ListType) => void;
  onComingSoon: (label: string) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute bottom-full left-1/2 mb-3 w-56 -translate-x-1/2 rounded-3xl bg-card/96 p-2 shadow-card ring-1 ring-border/70 backdrop-blur"
        >
          <div className="space-y-1">
            {FAB_OPTIONS.map((option, index) => (
              <motion.button
                key={option.label}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16, delay: index * 0.03, ease: "easeOut" }}
                onClick={() => {
                  if (option.type) onCreate(option.type);
                  else if (option.upcoming) onComingSoon(option.upcoming);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/70"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-lg"
                  aria-hidden
                >
                  {option.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {option.type ? "Make one now" : "Not built yet"}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AppNav({
  onNew,
  hideMobile,
}: {
  onNew: (type?: ListType) => void;
  hideMobile?: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const homeActive = pathname === "/";
  const listsActive = pathname === "/lists";
  const showAvatar = pathname === "/" || pathname === "/lists";

  const navItems: NavItem[] = [
    {
      label: "Home",
      shortLabel: "Home",
      icon: House,
      destination: { kind: "link", href: "/" },
    },
    {
      label: "Lists",
      shortLabel: "Lists",
      icon: ClipboardList,
      destination: { kind: "link", href: "/lists" },
    },
    {
      label: "Tracker",
      shortLabel: "Stock",
      icon: Package,
      destination: { kind: "action", onSelect: () => setComingSoon("Tracker") },
    },
    {
      label: "Meal Plan",
      shortLabel: "Meals",
      icon: Soup,
      destination: { kind: "action", onSelect: () => setComingSoon("Meal Plan") },
    },
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleCreate(type: ListType) {
    closeMenu();
    onNew(type);
  }

  function handleComingSoon(label: string) {
    closeMenu();
    setComingSoon(label);
  }

  return (
    <>
      {showAvatar && (
        <Link
          href="/settings"
          aria-label="Settings"
          className="fixed top-5 right-5 z-40 flex size-12 items-center justify-center overflow-hidden rounded-full bg-card/95 shadow-card ring-1 ring-border/70 backdrop-blur transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Image
            src="/avatar.png"
            alt="Profile"
            fill
            sizes="48px"
            className="object-cover"
          />
        </Link>
      )}

      <nav
        aria-label="Main"
        className={cn(
          "fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(calc(100%-1.5rem),26rem)] items-center justify-between rounded-[2rem] bg-card/92 px-2 py-2 shadow-[0_22px_50px_-28px_rgba(74,63,53,0.55)] ring-1 ring-border/70 backdrop-blur supports-backdrop-filter:bg-card/88 md:hidden",
          hideMobile && "hidden",
        )}
      >
        {navItems.slice(0, 2).map((item) => (
          <NavLink
            key={item.label}
            item={item.destination}
            label={item.shortLabel}
            icon={item.icon}
            active={item.label === "Home" ? homeActive : listsActive}
          />
        ))}
        <div className="relative flex justify-center px-1">
          <FabMenu open={menuOpen} onCreate={handleCreate} onComingSoon={handleComingSoon} />
          <FabButton open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />
        </div>
        {navItems.slice(2).map((item) => (
          <NavLink key={item.label} item={item.destination} label={item.shortLabel} icon={item.icon} />
        ))}
      </nav>

      <nav
        aria-label="Main"
        className="fixed top-1/2 left-4 z-40 hidden w-24 -translate-y-1/2 rounded-[2rem] bg-card/95 p-2 shadow-card ring-1 ring-border/70 backdrop-blur md:flex"
      >
        <div className="flex w-full flex-col gap-1">
          {navItems.slice(0, 2).map((item) => (
            <NavLink
              key={item.label}
              item={item.destination}
              label={item.label}
              icon={item.icon}
              active={item.label === "Home" ? homeActive : listsActive}
              vertical
            />
          ))}
          <div className="relative my-1 flex justify-center py-1">
            <FabMenu open={menuOpen} onCreate={handleCreate} onComingSoon={handleComingSoon} />
            <FabButton open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />
          </div>
          {navItems.slice(2).map((item) => (
            <NavLink
              key={item.label}
              item={item.destination}
              label={item.label}
              icon={item.icon}
              vertical
            />
          ))}
        </div>
      </nav>

      <ComingSoonDialog label={comingSoon} onClose={() => setComingSoon(null)} />
    </>
  );
}
