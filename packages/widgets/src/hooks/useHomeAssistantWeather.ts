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

const WEATHER_POLL_INTERVAL_MS = 10 * 60 * 1000;
const HOURLY_FORECAST_COUNT = 24;

export type UseHomeAssistantWeatherResult = {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  /** HTTP status of the last fetch; `501` means Home Assistant is unconfigured. */
  status: number | null;
  lastUpdated: number | null;
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
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const fetchData = useCallback(async () => {
    if (!entityId) {
      setData(null);
      setError(null);
      setStatus(null);
      setLastUpdated(null);
      setConsecutiveFailures(0);
      return;
    }

    setIsLoading(true);
    try {
      const [entity, daily, hourly] = await Promise.all([
        fetchEntity<HomeAssistantWeatherEntity>(entityId, fetchFailureCopy),
        fetchHomeAssistantWeatherForecast(entityId, "daily", fetchFailureCopy).catch(() => []),
        fetchHomeAssistantWeatherForecast(entityId, "hourly", fetchFailureCopy).catch(() => []),
      ]);
      setData(toWeatherData(entity, daily, hourly, new Date()));
      setError(null);
      setStatus(200);
      setLastUpdated(Date.now());
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : fetchFailureCopy);
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
      setConsecutiveFailures((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, fetchFailureCopy]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entityId) return;
    const timeout = setTimeout(
      fetchData,
      getNextPollDelay(WEATHER_POLL_INTERVAL_MS, consecutiveFailures),
    );
    return () => clearTimeout(timeout);
  }, [consecutiveFailures, entityId, fetchData]);

  return { data, isLoading, error, status, lastUpdated, refresh: fetchData };
}
