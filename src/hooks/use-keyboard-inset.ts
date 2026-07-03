"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const vv = window.visualViewport;
  if (!vv) return () => {};
  vv.addEventListener("resize", onChange);
  vv.addEventListener("scroll", onChange);
  return () => {
    vv.removeEventListener("resize", onChange);
    vv.removeEventListener("scroll", onChange);
  };
}

function getInset(): number {
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
}

/**
 * Height of the OS keyboard covering the layout viewport (iOS Safari doesn't
 * resize it). Android/Chrome is handled by `interactive-widget=resizes-content`;
 * there this returns 0. Apply as a bottom offset on fixed bottom sheets.
 */
export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribe, getInset, () => 0);
}
