import { describe, expect, it } from "vite-plus/test";
import {
  WIDGET_CACHE_MAX_BYTES,
  WIDGET_CACHE_MAX_ENTRIES,
  clearWidgetCache,
  createMemoryCacheStore,
  readWidgetCache,
  writeWidgetCache,
} from "./widgetCache";

const policy = { freshMs: 1_000, maxStaleMs: 5_000 };

describe("widgetCache", () => {
  it("returns a hit and distinguishes fresh from stale", () => {
    const store = createMemoryCacheStore();
    const now = 10_000;
    writeWidgetCache("weather:1", { temp: 70 }, { store, now: now - 100 });
    const fresh = readWidgetCache<{ temp: number }>("weather:1", policy, { store, now });
    expect(fresh).toMatchObject({ data: { temp: 70 }, isFresh: true, isStale: false });

    writeWidgetCache("weather:1", { temp: 71 }, { store, now: now - 1_000 });
    const stale = readWidgetCache<{ temp: number }>("weather:1", policy, { store, now });
    expect(stale?.isFresh).toBe(false);
    expect(stale?.isStale).toBe(true);
    expect(stale?.data).toEqual({ temp: 71 });
  });

  it("misses when nothing is stored", () => {
    const store = createMemoryCacheStore();
    expect(readWidgetCache("missing", policy, { store, now: 1 })).toBeNull();
  });

  it("removes entries past max stale", () => {
    const store = createMemoryCacheStore();
    writeWidgetCache("old", { ok: true }, { store, now: 0 });
    expect(readWidgetCache("old", policy, { store, now: 5_000 })).toBeNull();
    expect(readWidgetCache("old", policy, { store, now: 5_000 })).toBeNull();
  });

  it("rejects oversized entries and prunes the oldest", () => {
    const store = createMemoryCacheStore();
    const huge = "x".repeat(WIDGET_CACHE_MAX_BYTES);
    expect(writeWidgetCache("huge", huge, { store, now: 1 })).toBe(false);
    expect(readWidgetCache("huge", policy, { store, now: 1 })).toBeNull();

    for (let index = 0; index < WIDGET_CACHE_MAX_ENTRIES + 1; index += 1) {
      writeWidgetCache(`item-${index}`, index, { store, now: index + 1 });
    }
    expect(
      readWidgetCache("item-0", policy, { store, now: WIDGET_CACHE_MAX_ENTRIES + 1 }),
    ).toBeNull();
    expect(
      readWidgetCache(`item-${WIDGET_CACHE_MAX_ENTRIES}`, policy, {
        store,
        now: WIDGET_CACHE_MAX_ENTRIES + 1,
      })?.data,
    ).toBe(WIDGET_CACHE_MAX_ENTRIES);
  });

  it("no-ops when storage throws", () => {
    const store = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(writeWidgetCache("x", 1, { store, now: 1 })).toBe(false);
    expect(readWidgetCache("x", policy, { store, now: 1 })).toBeNull();
    expect(() => clearWidgetCache("x", store)).not.toThrow();
  });

  it("drops malformed entries", () => {
    const store = createMemoryCacheStore();
    store.setItem("homeslate:widgetCache:v1:bad", "{");
    expect(readWidgetCache("bad", policy, { store, now: 1 })).toBeNull();
    expect(store.getItem("homeslate:widgetCache:v1:bad")).toBeNull();
  });
});
