"use client";

import { useMounted } from "@/hooks/use-mounted";
import { FIRST_USE_GREETING, OPEN_TRIP_LINE, getGreeting } from "@/lib/greeting";

interface GreetingProps {
  hasLists: boolean;
  hasOpenTrip: boolean;
}

/** Time-based text renders only client-side — static export prerenders at build time. */
export function Greeting({ hasLists, hasOpenTrip }: GreetingProps) {
  const mounted = useMounted();
  const line = mounted ? (hasLists ? getGreeting() : FIRST_USE_GREETING) : " ";

  return (
    <header className="min-h-14">
      <h1 className="text-2xl font-bold">{line}</h1>
      {hasOpenTrip && <p className="mt-1 text-sm text-muted-foreground">{OPEN_TRIP_LINE}</p>}
    </header>
  );
}
