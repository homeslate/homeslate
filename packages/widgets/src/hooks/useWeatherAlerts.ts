import { useCallback, useEffect, useState } from "react";
import type { WeatherAlert, WeatherAlertsResponse } from "../widgets/weatherAlerts";
import { getNextPollDelay } from "./polling";

const WEATHER_ALERTS_POLL_INTERVAL_MS = 5 * 60 * 1000;

export type UseWeatherAlertsOptions = {
  latitude: number | null;
  longitude: number | null;
};

export type UseWeatherAlertsResult = {
  alerts: WeatherAlert[];
  coverage: WeatherAlertsResponse["coverage"] | null;
  isLoading: boolean;
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
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [coverage, setCoverage] = useState<WeatherAlertsResponse["coverage"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const fetchData = useCallback(async () => {
    if (latitude === null || longitude === null) {
      setAlerts([]);
      setCoverage(null);
      setError(null);
      setLastUpdated(null);
      setConsecutiveFailures(0);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(weatherAlertsUrl(latitude, longitude));
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
      const data = parseWeatherAlertsResponse(await response.json());
      setAlerts(data.alerts);
      setCoverage(data.coverage);
      setError(null);
      setLastUpdated(Date.now());
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather alerts");
      setConsecutiveFailures((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    const timeout = setTimeout(
      fetchData,
      getNextPollDelay(WEATHER_ALERTS_POLL_INTERVAL_MS, consecutiveFailures),
    );
    return () => clearTimeout(timeout);
  }, [consecutiveFailures, fetchData, latitude, longitude]);

  return { alerts, coverage, isLoading, error, lastUpdated, refresh: fetchData };
}
