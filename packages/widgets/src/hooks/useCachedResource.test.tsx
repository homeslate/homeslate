import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import { createMemoryCacheStore, writeWidgetCache } from "../services/widgetCache";
import { hydrateCachedResource, revalidateCached, useCachedResource } from "./useCachedResource";

describe("useCachedResource", () => {
  it("hydrates before a fetch and skips a fresh network read", async () => {
    const store = createMemoryCacheStore();
    const now = Date.now();
    writeWidgetCache("news:a", ["headline"], { store, now: now - 100 });
    let calls = 0;
    const policy = { freshMs: 1_000, maxStaleMs: 10_000 };

    function Probe() {
      const resource = useCachedResource({
        key: "news:a",
        freshMs: policy.freshMs,
        maxStaleMs: policy.maxStaleMs,
        store,
        fetcher: async () => {
          calls += 1;
          return ["live"];
        },
      });
      return createElement("span", null, `${resource.data?.[0]}|${resource.isLoading}`);
    }

    expect(renderToStaticMarkup(createElement(Probe))).toBe("<span>headline|false</span>");
    expect(calls).toBe(0);

    const skipped = await revalidateCached({
      key: "news:a",
      policy,
      store,
      now,
      fetcher: async () => {
        calls += 1;
        return ["live"];
      },
    });
    expect(skipped.data).toEqual(["headline"]);
    expect(calls).toBe(0);
  });

  it("revalidates a stale entry in the background and keeps it when the fetch fails", async () => {
    const store = createMemoryCacheStore();
    const now = 20_000;
    writeWidgetCache("news:b", ["cached"], { store, now: now - 2_000 });
    const policy = { freshMs: 1_000, maxStaleMs: 10_000 };
    let calls = 0;

    const updated = await revalidateCached({
      key: "news:b",
      policy,
      store,
      now,
      fetcher: async () => {
        calls += 1;
        return ["fresh"];
      },
    });
    expect(calls).toBe(1);
    expect(updated).toMatchObject({ data: ["fresh"], isStale: false, error: null });

    const failed = await revalidateCached({
      key: "news:b",
      policy,
      store,
      now: now + 2_000,
      force: true,
      fetcher: async () => {
        throw new Error("offline");
      },
    });
    expect(failed.data).toEqual(["fresh"]);
    expect(failed.isStale).toBe(true);
    expect(failed.error).toBe("offline");
    expect(failed.lastUpdated).toBe(now);
  });

  it("ignores an expired entry", () => {
    const store = createMemoryCacheStore();
    writeWidgetCache("news:c", ["gone"], { store, now: 0 });
    const hydrated = hydrateCachedResource("news:c", { freshMs: 10, maxStaleMs: 20 }, store, 20);
    expect(hydrated.data).toBeNull();
    expect(hydrated.isLoading).toBe(true);
  });
});
