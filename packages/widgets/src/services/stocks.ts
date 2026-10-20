// Stock quotes are fetched by the Homeslate server. Set FINNHUB_API_KEY there.

export interface StockQuote {
  symbol: string;
  name?: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  timestamp: number;
}

export interface StockSymbol {
  symbol: string;
  name: string;
}

// Popular stock symbols for quick selection
export const popularStocks: StockSymbol[] = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "INTC", name: "Intel Corporation" },
];

// Index/ETF symbols
export const popularIndices: StockSymbol[] = [
  { symbol: "SPY", name: "S&P 500 ETF" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF" },
  { symbol: "DIA", name: "Dow Jones ETF" },
  { symbol: "IWM", name: "Russell 2000 ETF" },
  { symbol: "VTI", name: "Total Stock Market ETF" },
];

export const STOCKS_MISSING_KEY_COPY = "Set FINNHUB_API_KEY on the server.";

/**
 * Fetch a stock quote. The Finnhub token stays on the Homeslate server.
 */
export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const params = new URLSearchParams({ symbol: symbol.toUpperCase() });
  const response = await fetch(`/api/stocks/quote?${params}`);

  if (response.status === 501) throw new Error(STOCKS_MISSING_KEY_COPY);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment.");
    }
    throw new Error(`Failed to fetch quote: ${response.statusText}`);
  }

  const data = await response.json();

  // Finnhub returns 0 for all values if symbol not found
  if (data.c === 0 && data.h === 0 && data.l === 0) {
    throw new Error(`Symbol "${symbol}" not found`);
  }

  return {
    symbol: symbol.toUpperCase(),
    currentPrice: data.c,
    change: data.d,
    changePercent: data.dp,
    highPrice: data.h,
    lowPrice: data.l,
    openPrice: data.o,
    previousClose: data.pc,
    timestamp: data.t * 1000,
  };
}

/**
 * Fetch multiple stock quotes
 */
export async function fetchMultipleQuotes(
  symbols: string[],
): Promise<Map<string, StockQuote | Error>> {
  const results = new Map<string, StockQuote | Error>();

  for (const symbol of symbols) {
    try {
      const quote = await fetchStockQuote(symbol);
      const stockInfo = [...popularStocks, ...popularIndices].find(
        (s) => s.symbol === symbol.toUpperCase(),
      );
      if (stockInfo) {
        quote.name = stockInfo.name;
      }
      results.set(symbol.toUpperCase(), quote);
    } catch (err) {
      results.set(symbol.toUpperCase(), err instanceof Error ? err : new Error("Unknown error"));
    }
  }

  return results;
}

/**
 * Search for stock symbols
 */
export async function searchSymbols(query: string): Promise<StockSymbol[]> {
  if (!query || query.length < 1) {
    return [];
  }

  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/stocks/search?${params}`);

  if (!response.ok) {
    if (response.status === 501) throw new Error(STOCKS_MISSING_KEY_COPY);
    return [];
  }

  const data = await response.json();

  return (data.result || [])
    .filter((item: { type: string }) => item.type === "Common Stock")
    .slice(0, 10)
    .map((item: { symbol: string; description: string }) => ({
      symbol: item.symbol,
      name: item.description,
    }));
}

export async function fetchStockQuoteCached(symbol: string): Promise<StockQuote> {
  return fetchStockQuote(symbol);
}
