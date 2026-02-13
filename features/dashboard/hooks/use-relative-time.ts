import { useState, useEffect } from "react";
import { getRelativeTime } from "../utils/relative-time";

/**
 * Returns a live-updating relative time string (e.g. "2m ago").
 * Re-evaluates every `intervalMs` (default 30s).
 */
export function useRelativeTime(
  timestamp: number | undefined,
  intervalMs = 30_000,
): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  if (!timestamp) return "just now";

  // `now` is in the dependency to force recalculation each tick
  void now;
  return getRelativeTime(new Date(timestamp).toISOString());
}
