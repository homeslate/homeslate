import { describe, expect, it } from "vite-plus/test";
import { bindScreenWakeLock, wakeLockEnabled } from "./useWakeLock";

describe("useWakeLock", () => {
  it("requests, reacquires, and releases a screen lock", async () => {
    const requests: string[] = [];
    const releases: string[] = [];
    let visible = true;
    let onChange = () => {};
    const stop = bindScreenWakeLock({
      enabled: true,
      getVisible: () => visible,
      wakeLock: {
        request: async (type) => {
          requests.push(type);
          return {
            release: async () => {
              releases.push(type);
            },
          };
        },
      },
      subscribeVisibility: (listener) => {
        onChange = listener;
        return () => {};
      },
    });

    await Promise.resolve();
    expect(requests).toEqual(["screen"]);
    visible = false;
    onChange();
    visible = true;
    onChange();
    await Promise.resolve();
    expect(requests).toEqual(["screen", "screen"]);
    stop();
    await Promise.resolve();
    expect(releases.length).toBeGreaterThan(0);
  });

  it("no-ops when the wake lock API is missing", () => {
    expect(() =>
      bindScreenWakeLock({
        enabled: true,
        getVisible: () => true,
        wakeLock: null,
        subscribeVisibility: () => () => {},
      })(),
    ).not.toThrow();
  });

  it("defaults the setting to enabled", () => {
    expect(wakeLockEnabled(undefined)).toBe(true);
    expect(wakeLockEnabled({})).toBe(true);
    expect(wakeLockEnabled({ wakeLockEnabled: false })).toBe(false);
  });
});
