import { CACHE_POLICIES, weatherAlertsKey } from "../services/cachePolicies";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import type { WeatherAlert, WeatherAlertsResponse } from "../widgets/weatherAlerts";
import { useCachedResource } from "./useCachedResource";

const WEATHER_ALERTS_POLL_INTERVAL_MS = CACHE_POLICIES.weatherAlerts.freshMs;

export type UseWeatherAlertsOptions = {
  latitude: number | null;
  longitude: number | null;
};

export type UseWeatherAlertsResult = {
  alerts: WeatherAlert[];
  coverage: WeatherAlertsResponse["coverage"] | null;
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
};

function weatherAlertsUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });
  return `/api/weather/alerts?${params}`;
}

function parseWeatherAlertsResponse(value: unknown): WeatherAlertsResponse {
  if (value === null || typeof value !== "object") {
    throw new Error("Invalid weather alerts response");
  }
  const { alerts, coverage } = value as { alerts?: unknown; coverage?: unknown };
  if (!Array.isArray(alerts) || (coverage !== "us" && coverage !== "unavailable")) {
    throw new Error("Invalid weather alerts response");
  }
  return { alerts: alerts as WeatherAlert[], coverage };
}

export function useWeatherAlerts({
  latitude,
  longitude,
}: UseWeatherAlertsOptions): UseWeatherAlertsResult {
  const cacheKey =
    latitude === null || longitude === null ? null : weatherAlertsKey(latitude, longitude);
  const resource = useCachedResource<WeatherAlertsResponse>({
    key: cacheKey,
    freshMs: CACHE_POLICIES.weatherAlerts.freshMs,
    maxStaleMs: CACHE_POLICIES.weatherAlerts.maxStaleMs,
    pollMs: WEATHER_ALERTS_POLL_INTERVAL_MS,
    maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
    fetcher: async () => {
      const response = await fetch(weatherAlertsUrl(latitude as number, longitude as number));
      if (!response.ok) {
        let message = "Failed to fetch weather alerts";
        try {
          const body = (await response.json()) as { error?: unknown };
          if (typeof body.error === "string") message = body.error;
        } catch {
          // Keep the stable fallback when the server did not return JSON.
        }
        throw new Error(message);
      }
      return parseWeatherAlertsResponse(await response.json());
    },
  });

  return {
    alerts: resource.data?.alerts ?? [],
    coverage: resource.data?.coverage ?? null,
    isLoading: resource.isLoading,
    isStale: resource.isStale,
    error: resource.error,
    lastUpdated: resource.lastUpdated,
    refresh: resource.refresh,
  };
}
