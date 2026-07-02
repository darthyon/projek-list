/**
 * Greeting pools — always list-agnostic (home must read general-purpose,
 * see DESIGN.md voice rules). Rotates daily, stable within a day.
 */
const POOLS = {
  morning: [
    "Morning. What's the plan?",
    "Morning. Kopi first, then lists.",
    "Morning. Small steps, short lists.",
  ],
  afternoon: [
    "Afternoon already. Lists don't write themselves.",
    "Afternoon. Still on track?",
    "Lunch settled? Lists next.",
  ],
  evening: [
    "Evening. Anything left undone?",
    "Evening. Wind down, tick off.",
    "Almost done for today?",
  ],
  night: [
    "Still up? The list can wait. Or not.",
    "Late night list energy.",
    "All quiet. Suspicious.",
  ],
};

export function getGreeting(now = new Date()): string {
  const hour = now.getHours();
  const pool =
    hour >= 5 && hour < 12
      ? POOLS.morning
      : hour >= 12 && hour < 18
        ? POOLS.afternoon
        : hour >= 18 && hour < 22
          ? POOLS.evening
          : POOLS.night;
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return pool[dayOfYear % pool.length];
}

export const FIRST_USE_GREETING = "New here? Make your first list la.";
/** Only shown when a resumable trip exists — context earns the mention. */
export const OPEN_TRIP_LINE = "Trolley still half full, by the way.";
