import { useState, useEffect, useMemo } from "react";
import { fetchWeatherCached, type WeatherData } from "../services/weather";
import { sliceHourlyFromNow } from "../services/hourlyForecast";
import { CACHE_POLICIES, weatherKey } from "../services/cachePolicies";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useCachedResource } from "./useCachedResource";

interface UseWeatherOptions {
  latitude: number | null;
  longitude: number | null;
  units: "imperial" | "metric";
  locationInfo?: { name: string; country: string; admin1?: string };
  refreshInterval?: number; // in milliseconds
}

interface UseWeatherResult {
  data: WeatherData | null;
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

const HOURLY_FORECAST_COUNT = 24;

function withHourlySlice(data: WeatherData, now: Date): WeatherData {
  const hourly = sliceHourlyFromNow({
    times: data.hourly.map((h) => h.time),
    values: data.hourly,
    now,
    utcOffsetSeconds: data.utcOffsetSeconds,
    count: HOURLY_FORECAST_COUNT,
  });
  return { ...data, hourly };
}

function msUntilNextLocationHour(now: Date, utcOffsetSeconds: number): number {
  const shiftedMs = now.getTime() + utcOffsetSeconds * 1000;
  const shifted = new Date(shiftedMs);
  shifted.setUTCMinutes(0, 0, 0);
  shifted.setUTCHours(shifted.getUTCHours() + 1);
  const nextHourMs = shifted.getTime() - utcOffsetSeconds * 1000;
  return Math.max(0, nextHourMs - now.getTime()) + 1;
}

export function useWeather({
  latitude,
  longitude,
  units,
  locationInfo,
  refreshInterval = CACHE_POLICIES.weather.freshMs,
}: UseWeatherOptions): UseWeatherResult {
  const cacheKey =
    latitude === null || longitude === null ? null : weatherKey(latitude, longitude, units);
  const resource = useCachedResource<WeatherData>({
    key: cacheKey,
    freshMs: CACHE_POLICIES.weather.freshMs,
    maxStaleMs: CACHE_POLICIES.weather.maxStaleMs,
    pollMs: refreshInterval,
    maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
    fetcher: () => fetchWeatherCached(latitude as number, longitude as number, units, locationInfo),
  });
  const [now, setNow] = useState(() => new Date());

  // Re-slice hourly forecast at each new hour in the widget location's timezone
  useEffect(() => {
    if (resource.data === null) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const utcOffsetSeconds = resource.data.utcOffsetSeconds;

    const scheduleNextHour = () => {
      const current = new Date();
      setNow(current);
      timeoutId = setTimeout(scheduleNextHour, msUntilNextLocationHour(current, utcOffsetSeconds));
    };

    scheduleNextHour();
    return () => clearTimeout(timeoutId);
  }, [resource.data]);

  const data = useMemo(
    () => (resource.data ? withHourlySlice(resource.data, now) : null),
    [resource.data, now],
  );

  return {
    data,
    isLoading: resource.isLoading,
    isStale: resource.isStale,
    error: resource.error,
    lastUpdated: resource.lastUpdated,
    refresh: resource.refresh,
  };
}
