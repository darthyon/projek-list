"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { createContext, useContext, useState, type ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";

const client = new ConvexReactClient(convexUrl);

interface UserSession {
  id: string;
  name: string;
}

function loadSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("projek-cloud-user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const SessionContext = createContext<{
  session: UserSession | null;
  setSession: (s: UserSession | null) => void;
}>({
  session: null,
  setSession: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(loadSession);

  function handleSetSession(s: UserSession | null) {
    setSession(s);
    if (s) {
      localStorage.setItem("projek-cloud-user", JSON.stringify(s));
    } else {
      localStorage.removeItem("projek-cloud-user");
    }
  }

  return (
    <SessionContext.Provider value={{ session, setSession: handleSetSession }}>
      <ConvexProvider client={client}>{children}</ConvexProvider>
    </SessionContext.Provider>
  );
}
