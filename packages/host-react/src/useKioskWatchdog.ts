import { useEffect } from "react";

export const KIOSK_WATCHDOG_FAILURES = 3;
export const KIOSK_WATCHDOG_STALE_MS = 5 * 60 * 1000;
export const KIOSK_WATCHDOG_RATE_LIMIT_MS = 5 * 60 * 1000;
export const KIOSK_WATCHDOG_SESSION_KEY = "homeslate:kiosk-watchdog:v1";

export interface WatchdogStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readWatchdogReloadAt(storage: WatchdogStorage): number | null {
  try {
    const raw = storage.getItem(KIOSK_WATCHDOG_SESSION_KEY);
    const value = raw == null ? Number.NaN : Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function markWatchdogReload(storage: WatchdogStorage, now: number): void {
  try {
    storage.setItem(KIOSK_WATCHDOG_SESSION_KEY, String(now));
  } catch {
    // A failed write still allows this reload; the next one is not guaranteed to be blocked.
  }
}

export function kioskWatchdogDecision(input: {
  online: boolean;
  failedHeartbeats: number;
  lastLoadedAt: number | null;
  now: number;
  lastReloadAt: number | null;
}): { reload: boolean } {
  if (!input.online) return { reload: false };
  if (input.lastReloadAt != null && input.now - input.lastReloadAt < KIOSK_WATCHDOG_RATE_LIMIT_MS) {
    return { reload: false };
  }
  const heartbeatFailed = input.failedHeartbeats >= KIOSK_WATCHDOG_FAILURES;
  const documentExpired =
    input.lastLoadedAt != null && input.now - input.lastLoadedAt >= KIOSK_WATCHDOG_STALE_MS;
  return { reload: heartbeatFailed || documentExpired };
}

export function useKioskWatchdog(input: {
  online: boolean;
  failedHeartbeats: number;
  lastLoadedAt: number | null;
}): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastReloadAt = readWatchdogReloadAt(window.sessionStorage);
    const decision = kioskWatchdogDecision({
      online: input.online,
      failedHeartbeats: input.failedHeartbeats,
      lastLoadedAt: input.lastLoadedAt,
      now: Date.now(),
      lastReloadAt,
    });
    if (!decision.reload) return;
    markWatchdogReload(window.sessionStorage, Date.now());
    window.location.reload();
  }, [input.failedHeartbeats, input.lastLoadedAt, input.online]);
}
