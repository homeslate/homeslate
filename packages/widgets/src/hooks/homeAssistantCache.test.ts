import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { createMemoryCacheStore } from "../services/widgetCache";
import { haEntityKey, haEntityListKey } from "../services/cachePolicies";
import { packEntityList, reduceHaRead, unpackEntityList } from "../services/haCache";
import { readWidgetCache, writeWidgetCache } from "../services/widgetCache";
import { CACHE_POLICIES } from "../services/cachePolicies";

describe("home assistant cache", () => {
  it("hydrates a warm entity and replaces it on a fresh fetch", () => {
    const store = createMemoryCacheStore();
    const key = haEntityKey("light.kitchen");
    writeWidgetCache(key, { entityId: "light.kitchen", state: "on" }, { store, now: 1_000 });
    const hydrated = readWidgetCache(key, CACHE_POLICIES.haEntity, { store, now: 1_100 });
    expect(hydrated?.data).toEqual({ entityId: "light.kitchen", state: "on" });

    const next = reduceHaRead(
      { data: hydrated?.data ?? null, lastUpdated: hydrated?.savedAt ?? null },
      { type: "success", data: { entityId: "light.kitchen", state: "off" }, now: 2_000 },
    );
    expect(next.persist).toBe(true);
    expect(next.data).toEqual({ entityId: "light.kitchen", state: "off" });
    expect(next.isStale).toBe(false);
  });

  it("keeps cached data and does not persist a failed read", () => {
    const current = { data: { state: "on" }, lastUpdated: 500 };
    const failed = reduceHaRead(current, { type: "failure" });
    expect(failed.data).toEqual(current.data);
    expect(failed.lastUpdated).toBe(500);
    expect(failed.isStale).toBe(true);
    expect(failed.persist).toBe(false);
  });

  it("keeps entity lists isolated by their sorted ids", () => {
    expect(haEntityListKey(["b", "a"])).toBe(haEntityListKey(["a", "b"]));
    expect(haEntityListKey(["a"])).not.toBe(haEntityListKey(["a", "b"]));
    const packed = packEntityList(["b", "a"], [{ id: "b" }, { id: "a" }]);
    expect(unpackEntityList(["b", "a"], packed)).toEqual([{ id: "b" }, { id: "a" }]);
    expect(unpackEntityList(["a", "b"], packed)).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("does not cache service calls", () => {
    const source = readFileSync(
      fileURLToPath(new URL("./useHomeAssistant.ts", import.meta.url)),
      "utf8",
    );
    const callStart = source.indexOf("const call = useCallback");
    const callEnd = source.indexOf("return {", callStart);
    const call = source.slice(callStart, callEnd);
    expect(call).not.toContain("writeWidgetCache");
    expect(call).not.toContain("commit(");
    expect(haEntityKey("lock.front")).not.toContain("services");
  });
});
