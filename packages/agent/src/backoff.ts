const MIN_DELAY_MS = 1_000;
const MAX_DELAY_MS = 60_000;
const JITTER_RATIO = 0.2;

/**
 * Delay before the next reconnect attempt: exponential from 1s, capped at 60s,
 * with ±20% jitter so a fleet of agents doesn't reconnect in lockstep.
 *
 * `rand` is injectable for deterministic tests and defaults to `Math.random()`.
 */
export function nextReconnectDelay(attempt: number, rand: number = Math.random()): number {
  const base = Math.min(MAX_DELAY_MS, MIN_DELAY_MS * 2 ** Math.max(0, attempt));
  const jitter = base * JITTER_RATIO * (rand * 2 - 1);
  return Math.min(MAX_DELAY_MS, Math.max(0, Math.round(base + jitter)));
}
