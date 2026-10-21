import { useCallback, useEffect, useState } from "react";
import {
  HomeAssistantHttpError,
  fetchEntity,
  fetchHomeAssistantWeatherForecast,
} from "../services/homeAssistant";
import type { WeatherData } from "../services/weather";
import {
  weatherConditionCode,
  type HomeAssistantWeatherEntity,
  type HomeAssistantWeatherForecast,
} from "../widgets/homeAssistantWeather";
import { getNextPollDelay } from "./polling";
import { useRefreshingPoll } from "./useRefreshingPoll";
import { CACHE_POLICIES, haWeatherKey } from "../services/cachePolicies";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useHaResource } from "./useHaResource";

const WEATHER_POLL_INTERVAL_MS = 10 * 60 * 1000;
const HOURLY_FORECAST_COUNT = 24;

export type UseHomeAssistantWeatherResult = {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  /** HTTP status of the last fetch; `501` means Home Assistant is unconfigured. */
  status: number | null;
  lastUpdated: number | null;
  isStale: boolean;
  refresh: () => void;
};

function toWeatherData(
  entity: HomeAssistantWeatherEntity,
  daily: HomeAssistantWeatherForecast[],
  hourly: HomeAssistantWeatherForecast[],
  now: Date,
): WeatherData {
  const cutoff = now.getTime() - 60 * 60 * 1000;
  const upcoming = hourly
    .filter((entry) => {
      const time = Date.parse(entry.datetime);
      return Number.isFinite(time) ? time >= cutoff : true;
    })
    .slice(0, HOURLY_FORECAST_COUNT);

  return {
    current: {
      temperature: entity.temperature ?? 0,
      apparentTemperature: entity.apparentTemperature ?? entity.temperature ?? 0,
      humidity: entity.humidity ?? 0,
      windSpeed: entity.windSpeed ?? 0,
      weatherCode: weatherConditionCode(entity.condition),
      isDay: entity.isDay,
    },
    daily: daily.map((entry) => ({
      date: entry.datetime.slice(0, 10),
      weatherCode: weatherConditionCode(entry.condition),
      tempMax: entry.temperature ?? 0,
      tempMin: entry.templow ?? entry.temperature ?? 0,
      precipitationProbability: entry.precipitationProbability ?? 0,
    })),
    hourly: upcoming.map((entry) => ({
      time: entry.datetime,
      temperature: entry.temperature ?? 0,
      weatherCode: weatherConditionCode(entry.condition),
      isDay: entry.isDay,
    })),
    utcOffsetSeconds: 0,
    location: { name: entity.name, country: "" },
    units: entity.unit,
  };
}

/**
 * Read a Home Assistant `weather` entity plus its daily/hourly forecasts and
 * normalize them into the same `WeatherData` shape the Weather widget already
 * renders for Open-Meteo.
 */
export function useHomeAssistantWeather(
  entityId: string,
  fetchFailureCopy: string,
): UseHomeAssistantWeatherResult {
  const cacheKey = entityId ? haWeatherKey(entityId) : null;
  const { data, isLoading, isStale, error, setError, lastUpdated, beginLoad, commit } =
    useHaResource<WeatherData>(cacheKey, CACHE_POLICIES.haWeather, WIDGET_CACHE_LARGE_MAX_BYTES);
  const [status, setStatus] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const fetchData = useCallback(async () => {
    if (!entityId || !cacheKey) {
      commit({ type: "clear" });
      setStatus(null);
      setConsecutiveFailures(0);
      return;
    }

    beginLoad();
    try {
      const [entity, daily, hourly] = await Promise.all([
        fetchEntity<HomeAssistantWeatherEntity>(entityId, fetchFailureCopy),
        fetchHomeAssistantWeatherForecast(entityId, "daily", fetchFailureCopy).catch(() => []),
        fetchHomeAssistantWeatherForecast(entityId, "hourly", fetchFailureCopy).catch(() => []),
      ]);
      commit({
        type: "success",
        data: toWeatherData(entity, daily, hourly, new Date()),
        now: Date.now(),
      });
      setError(null);
      setStatus(200);
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : fetchFailureCopy);
      commit({ type: "failure" });
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
      setConsecutiveFailures((value) => value + 1);
    }
  }, [beginLoad, cacheKey, commit, entityId, fetchFailureCopy, setError]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useRefreshingPoll(
    Boolean(entityId),
    getNextPollDelay(WEATHER_POLL_INTERVAL_MS, consecutiveFailures),
    () => fetchData(),
  );

  return { data, isLoading, error, isStale, status, lastUpdated, refresh: fetchData };
}
