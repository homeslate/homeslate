import { CACHE_POLICIES, stocksKey } from "../services/cachePolicies";
import { fetchStockQuoteCached, type StockQuote } from "../services/stocks";
import { readWidgetCache, WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useCachedResource } from "./useCachedResource";

interface UseStocksOptions {
  symbols: string[];
  refreshInterval?: number;
}

interface UseStocksResult {
  quotes: Map<string, StockQuote>;
  isLoading: boolean;
  isStale: boolean;
  errors: Map<string, string>;
  lastUpdated: number | null;
  refresh: () => void;
}

interface CachedQuotes {
  quotes: Record<string, StockQuote>;
  errors: Record<string, string>;
}

export function useStocks({
  symbols,
  refreshInterval = CACHE_POLICIES.stocks.freshMs,
}: UseStocksOptions): UseStocksResult {
  const cacheKey = symbols.length === 0 ? null : stocksKey(symbols);
  const resource = useCachedResource<CachedQuotes>({
    key: cacheKey,
    freshMs: CACHE_POLICIES.stocks.freshMs,
    maxStaleMs: CACHE_POLICIES.stocks.maxStaleMs,
    pollMs: refreshInterval,
    maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
    fetcher: async () => {
      const existing = cacheKey
        ? readWidgetCache<CachedQuotes>(cacheKey, CACHE_POLICIES.stocks)
        : null;
      const quotes: Record<string, StockQuote> = {};
      const errors: Record<string, string> = {};
      for (const symbol of symbols) {
        const normalized = symbol.toUpperCase();
        try {
          quotes[normalized] = await fetchStockQuoteCached(symbol);
        } catch (error) {
          const previous = existing?.data.quotes[normalized];
          if (previous) quotes[normalized] = previous;
          errors[normalized] = error instanceof Error ? error.message : "Failed to fetch";
        }
      }
      if (Object.keys(quotes).length === 0) {
        throw new Error(Object.values(errors)[0] ?? "Failed to fetch");
      }
      return { quotes, errors };
    },
  });

  return {
    quotes: new Map(Object.entries(resource.data?.quotes ?? {})),
    isLoading: resource.isLoading,
    isStale: resource.isStale,
    errors: new Map(Object.entries(resource.data?.errors ?? {})),
    lastUpdated: resource.lastUpdated,
    refresh: resource.refresh,
  };
}
