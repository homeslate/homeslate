import { describe, expect, it } from "vite-plus/test";
import { CACHE_POLICIES, newsKey } from "../services/cachePolicies";
import type { NewsItem } from "../services/news";
import { createMemoryCacheStore, readWidgetCache, writeWidgetCache } from "../services/widgetCache";
import { reviveNewsItems } from "./useNews";

describe("reviveNewsItems", () => {
  it("restores publication dates after a cache round trip", () => {
    const store = createMemoryCacheStore();
    const key = newsKey(["https://example.com/rss"]);
    const items: NewsItem[] = [
      {
        title: "Headline",
        link: "https://example.com/a",
        description: "",
        pubDate: new Date("2026-10-20T15:00:00Z"),
        source: "Example",
      },
    ];
    writeWidgetCache(key, items, { store, now: 1_000 });

    const hit = readWidgetCache<NewsItem[]>(key, CACHE_POLICIES.news, { store, now: 1_500 });
    expect(hit?.data[0]?.pubDate).not.toBeInstanceOf(Date);

    const [item] = reviveNewsItems(hit?.data ?? []);
    expect(item?.pubDate).toBeInstanceOf(Date);
    expect(item?.pubDate.toISOString()).toBe("2026-10-20T15:00:00.000Z");
  });
});
