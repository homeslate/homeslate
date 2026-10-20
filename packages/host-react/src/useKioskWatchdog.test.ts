import { describe, expect, it } from "vite-plus/test";
import {
  KIOSK_WATCHDOG_RATE_LIMIT_MS,
  KIOSK_WATCHDOG_STALE_MS,
  kioskWatchdogDecision,
  markWatchdogReload,
  readWatchdogReloadAt,
} from "./useKioskWatchdog";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe("useKioskWatchdog", () => {
  it("reloads after failed heartbeats or a stale document, and never while offline", () => {
    expect(
      kioskWatchdogDecision({
        online: false,
        failedHeartbeats: 3,
        lastLoadedAt: 0,
        now: KIOSK_WATCHDOG_STALE_MS,
        lastReloadAt: null,
      }).reload,
    ).toBe(false);

    expect(
      kioskWatchdogDecision({
        online: true,
        failedHeartbeats: 3,
        lastLoadedAt: 10_000,
        now: 10_000,
        lastReloadAt: null,
      }).reload,
    ).toBe(true);

    expect(
      kioskWatchdogDecision({
        online: true,
        failedHeartbeats: 0,
        lastLoadedAt: 0,
        now: KIOSK_WATCHDOG_STALE_MS,
        lastReloadAt: null,
      }).reload,
    ).toBe(true);

    expect(
      kioskWatchdogDecision({
        online: true,
        failedHeartbeats: 0,
        lastLoadedAt: null,
        now: KIOSK_WATCHDOG_STALE_MS,
        lastReloadAt: null,
      }).reload,
    ).toBe(false);
  });

  it("does not loop inside the rate limit", () => {
    const storage = memoryStorage();
    const now = 50_000;
    markWatchdogReload(storage, now);
    const lastReloadAt = readWatchdogReloadAt(storage);
    expect(
      kioskWatchdogDecision({
        online: true,
        failedHeartbeats: 3,
        lastLoadedAt: 0,
        now: now + 1_000,
        lastReloadAt,
      }).reload,
    ).toBe(false);
    expect(
      kioskWatchdogDecision({
        online: true,
        failedHeartbeats: 3,
        lastLoadedAt: 0,
        now: now + KIOSK_WATCHDOG_RATE_LIMIT_MS,
        lastReloadAt,
      }).reload,
    ).toBe(true);
  });
});
