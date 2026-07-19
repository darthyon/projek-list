"use client";

import { useEffect } from "react";

export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // eslint-disable-next-line no-console
          console.log("[SW] registered:", reg.scope);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error("[SW] registration failed:", err);
        });
    }
  }, []);

  return <>{children}</>;
}
