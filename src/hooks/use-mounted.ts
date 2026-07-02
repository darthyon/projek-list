"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/** False during SSR/prerender + hydration, true after. For client-only text like themes and time-based copy. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
