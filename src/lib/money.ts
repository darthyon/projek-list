import type { Sen } from "@/lib/types/list";

/** 420 → "RM 4.20". Always two decimals, tabular-nums handles alignment. */
export function formatSen(sen: Sen): string {
  const sign = sen < 0 ? "-" : "";
  const abs = Math.abs(sen);
  const ringgit = Math.floor(abs / 100);
  const cents = String(abs % 100).padStart(2, "0");
  return `${sign}RM ${ringgit.toLocaleString("en-MY")}.${cents}`;
}

/**
 * Sen-first entry (banking style): digit string → sen, decimal auto-placed
 * from the right. "4" → 4, "42" → 42, "420" → 420 (RM 4.20).
 */
export function senFromDigits(digits: string): Sen {
  const cleaned = digits.replace(/\D/g, "");
  if (cleaned === "") return 0;
  return Number.parseInt(cleaned, 10);
}
