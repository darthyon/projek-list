export function isOverdue(dueAt: number, now = Date.now()): boolean {
  return dueAt < now;
}

const TIME = new Intl.DateTimeFormat("en-MY", { hour: "numeric", minute: "2-digit" });
const DAY = new Intl.DateTimeFormat("en-MY", { weekday: "short", day: "numeric", month: "short" });

/** Today → "5:00 pm", otherwise "Thu 4 Jul, 5:00 pm". */
export function formatDue(dueAt: number, now = new Date()): string {
  const due = new Date(dueAt);
  const sameDay = due.toDateString() === now.toDateString();
  return sameDay ? TIME.format(due) : `${DAY.format(due)}, ${TIME.format(due)}`;
}

/** Epoch ms → value for <input type="datetime-local"> (local time, minute precision). */
export function toDatetimeLocal(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocal(value: string): number | undefined {
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? undefined : ts;
}
