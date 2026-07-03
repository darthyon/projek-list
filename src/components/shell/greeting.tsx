"use client";

import { OPEN_TRIP_LINE } from "@/lib/greeting";

interface GreetingProps {
  hasOpenTrip: boolean;
}

// No profiles in MVP — the app is Yon's.
const USERNAME = "Yon";

export function Greeting({ hasOpenTrip }: GreetingProps) {
  return (
    <header className="min-h-14">
      <h1 className="text-2xl font-bold">Hello, {USERNAME}.</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasOpenTrip ? OPEN_TRIP_LINE : "What are we making?"}
      </p>
    </header>
  );
}
