import { newsKey, CACHE_POLICIES } from "../services/cachePolicies";
import { fetchNewsCached, type NewsItem, type RSSFeed } from "../services/news";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useCachedResource } from "./useCachedResource";

interface UseNewsOptions {
  feeds: RSSFeed[];
  maxItems?: number;
  refreshInterval?: number;
}

interface UseNewsResult {
  items: NewsItem[];
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

export function useNews({
  feeds,
  maxItems = 10,
  refreshInterval = CACHE_POLICIES.news.freshMs,
}: UseNewsOptions): UseNewsResult {
  const feedUrls = feeds.map((feed) => feed.url);
  const cacheKey = feedUrls.length === 0 ? null : newsKey(feedUrls);
  const resource = useCachedResource<NewsItem[]>({
    key: cacheKey,
    freshMs: CACHE_POLICIES.news.freshMs,
    maxStaleMs: CACHE_POLICIES.news.maxStaleMs,
    pollMs: refreshInterval,
    maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
    fetcher: async () => (await fetchNewsCached(feeds)).slice(0, maxItems),
  });

  return {
    items: resource.data ?? [],
    isLoading: resource.isLoading,
    isStale: resource.isStale,
    error: resource.error,
    lastUpdated: resource.lastUpdated,
    refresh: resource.refresh,
  };
}
