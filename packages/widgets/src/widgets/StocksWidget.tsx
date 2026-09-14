import { useState } from "react";
import {
  Text,
  Stack,
  Spinner,
  Button,
  Surface,
  TextField,
  PasswordInput,
  Link,
  HStack,
} from "@var-ui/react";
import { IconChartLine, IconRefresh } from "@tabler/icons-react";
import type { WidgetProps, WidgetConfig } from "../types";
import { useStocks } from "../hooks/useStocks";
import { WidgetDataStatus } from "../chrome/WidgetDataStatus";
import { popularStocks, popularIndices, type StockQuote } from "../services/stocks";
import * as classes from "./StocksWidget.styles";

export interface StocksConfig extends WidgetConfig {
  symbols: string[];
  apiKey: string;
  showChange: boolean;
  showDayRange: boolean;
  transparentBackground: boolean;
}

function StockRow({
  quote,
  showChange,
  showDayRange,
}: {
  quote: StockQuote;
  showChange: boolean;
  showDayRange: boolean;
}) {
  const change = quote.change ?? 0;
  const changePercent = quote.changePercent ?? 0;
  const isPositive = change > 0;

  return (
    <HStack justify="between" className={classes.stockRow}>
      <HStack gap="xs">
        <Text weight="semibold" size="sm">
          {quote.symbol}
        </Text>
        <Text size="sm" tone="secondary">
          {quote.name}
        </Text>
      </HStack>
      <HStack gap="xs">
        <Text size="sm" weight="medium">
          ${quote.currentPrice?.toFixed(2) ?? "—"}
        </Text>
        {showChange && (
          <>
            <Text size="sm">
              {isPositive ? "+" : ""}
              {change?.toFixed(2) ?? "—"}
            </Text>
            <Text size="sm">
              ({isPositive ? "+" : ""}
              {changePercent?.toFixed(2) ?? "—"}%)
            </Text>
          </>
        )}
        {showDayRange && (
          <Text size="sm" tone="secondary">
            {quote.lowPrice?.toFixed(2) ?? "—"} - {quote.highPrice?.toFixed(2) ?? "—"}
          </Text>
        )}
      </HStack>
    </HStack>
  );
}

export function StocksWidget({ widget }: WidgetProps<StocksConfig>) {
  const { symbols, apiKey, showChange, showDayRange, transparentBackground } = widget.config;

  const { quotes, isLoading, errors, refresh, lastUpdated } = useStocks({
    symbols,
    apiKey,
  });
  const hasAnyError = errors.size > 0;

  // No API key configured
  if (!apiKey) {
    return (
      <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
        <div className={classes.empty}>
          <IconChartLine size={48} className={classes.emptyIcon} />
          <Text size="lg" weight="medium">
            API Key Required
          </Text>
          <Text size="sm" tone="secondary" style={{ textAlign: "center" }}>
            Get a free API key from{" "}
            <Link href="https://finnhub.io" target="_blank" rel="noopener">
              finnhub.io
            </Link>
          </Text>
        </div>
      </div>
    );
  }

  // No symbols configured
  if (symbols.length === 0) {
    return (
      <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
        <div className={classes.empty}>
          <IconChartLine size={48} className={classes.emptyIcon} />
          <Text size="lg" weight="medium">
            No Stocks Selected
          </Text>
          <Text size="sm" tone="secondary">
            Add stock symbols in widget settings
          </Text>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && quotes.size === 0) {
    return (
      <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
        <div className={classes.loading}>
          <Spinner size="lg" tone="success" />
          <Text size="sm" tone="secondary">
            Loading stocks...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={`${classes.container} ${transparentBackground ? classes.transparent : ""}`}>
      <div className={classes.header}>
        <Text className={classes.title}>
          <IconChartLine size={18} />
          Stocks
        </Text>
        <HStack gap="xs">
          {isLoading && <Spinner size="sm" tone="success" />}
          <Button appearance="ghost" size="sm" onPress={refresh} className={classes.refreshBtn}>
            <IconRefresh size={14} />
          </Button>
        </HStack>
      </div>
      <WidgetDataStatus
        widgetId={widget.id}
        lastUpdated={lastUpdated}
        error={hasAnyError ? "stale" : null}
        isLoading={isLoading}
      />

      <div className={classes.stocksList}>
        <Stack gap="xs">
          {symbols.map((symbol) => {
            const quote = quotes.get(symbol.toUpperCase());
            const error = errors.get(symbol.toUpperCase());

            if (error) {
              return (
                <Surface key={symbol} className={classes.stockRow} padding="sm">
                  <Text size="sm" weight="semibold">
                    {symbol}
                  </Text>
                  <Text size="sm" style={{ color: "var(--var-ui-color-danger)" }}>
                    {error}
                  </Text>
                </Surface>
              );
            }

            if (!quote) {
              return (
                <Surface key={symbol} className={classes.stockRow} padding="sm">
                  <Text size="sm" weight="semibold">
                    {symbol}
                  </Text>
                  <Spinner size="sm" />
                </Surface>
              );
            }

            return (
              <StockRow
                key={symbol}
                quote={quote}
                showChange={showChange}
                showDayRange={showDayRange}
              />
            );
          })}
        </Stack>
      </div>

      <Text
        size="sm"
        tone="secondary"
        style={{ textAlign: "center" }}
        className={classes.attribution}
      >
        Data from Finnhub
      </Text>
    </div>
  );
}

export function StocksWidgetSettings({ widget, onConfigChange }: WidgetProps<StocksConfig>) {
  const { symbols, apiKey, showChange, showDayRange } = widget.config;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Combined list: popular + search results
  const allSymbols = [...popularIndices, ...popularStocks];

  // Search for stocks when query changes
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }

    // First filter popular stocks locally
    const localMatches = allSymbols.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase()),
    );

    // If we have an API key, also search Finnhub
    if (apiKey && query.length >= 2) {
      setIsSearching(true);
      try {
        const { searchSymbols } = await import("../services/stocks");
        const results = await searchSymbols(query, apiKey);
        // Combine local and API results, deduping
        const combined = [...localMatches];
        results.forEach((r) => {
          if (!combined.some((c) => c.symbol === r.symbol)) {
            combined.push(r);
          }
        });
        setSearchResults(combined.slice(0, 15));
      } catch {
        setSearchResults(localMatches);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults(localMatches);
    }
  };

  const addSymbol = (symbol: string) => {
    if (symbols.length >= 10) return;
    if (!symbols.includes(symbol.toUpperCase())) {
      onConfigChange({ symbols: [...symbols, symbol.toUpperCase()] });
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeSymbol = (symbol: string) => {
    onConfigChange({ symbols: symbols.filter((s) => s !== symbol) });
  };

  return (
    <Stack gap="md">
      <PasswordInput
        label="Finnhub API Key"
        placeholder="Enter your API key"
        description="Get a free key at finnhub.io"
        value={apiKey}
        onChange={(value) => onConfigChange({ apiKey: value })}
      />
      <Text size="xs" tone="secondary">
        Get a free key at{" "}
        <Link href="https://finnhub.io" target="_blank">
          finnhub.io
        </Link>
      </Text>

      <div>
        <Text size="sm" weight="medium">
          Search Stocks
        </Text>
        <TextField
          placeholder="Search by symbol or company name..."
          value={searchQuery}
          onChange={(value) => handleSearch(value)}
        />
        {isSearching && <Spinner size="sm" />}
        {!apiKey && (
          <Text size="sm" tone="secondary">
            Add API key to search all stocks
          </Text>
        )}

        {searchResults.length > 0 && (
          <Surface className={classes.searchResults} padding="sm">
            <Stack gap="xs">
              {searchResults.map((result) => (
                <Button
                  key={result.symbol}
                  appearance="ghost"
                  size="sm"

                  onPress={() => addSymbol(result.symbol)}
                  isDisabled={symbols.includes(result.symbol) || symbols.length >= 10}
                  className={classes.searchResult}
                >
                  <Text weight="semibold" size="sm">
                    {result.symbol}
                  </Text>
                  <Text size="sm" tone="secondary" style={{ flex: 1 }} lineClamp={1}>
                    {result.name}
                  </Text>
                  {symbols.includes(result.symbol) && (
                    <Text size="sm" style={{ color: "var(--var-ui-color-success)" }}>
                      Added
                    </Text>
                  )}
                </Button>
              ))}
            </Stack>
          </Surface>
        )}
      </div>

      {symbols.length > 0 && (
        <div>
          <Text size="sm" weight="medium">
            Selected Stocks ({symbols.length}/10)
          </Text>
          <HStack gap="xs">
            {symbols.map((symbol) => {
              const info = allSymbols.find((s) => s.symbol === symbol);
              return (
                <Button
                  key={symbol}
                  appearance="subtle"
                  size="sm"
                  onPress={() => removeSymbol(symbol)}
                >
                  {info?.name ?? symbol} ×
                </Button>
              );
            })}
          </HStack>
        </div>
      )}

      <div>
        <label className={classes.checkboxLabel}>
          <input
            type="checkbox"
            checked={showChange}
            onChange={(e) => onConfigChange({ showChange: e.target.checked })}
          />
          <Text size="sm">Show price change</Text>
        </label>
      </div>

      <div>
        <label className={classes.checkboxLabel}>
          <input
            type="checkbox"
            checked={showDayRange}
            onChange={(e) => onConfigChange({ showDayRange: e.target.checked })}
          />
          <Text size="sm">Show day high/low</Text>
        </label>
      </div>
    </Stack>
  );
}
