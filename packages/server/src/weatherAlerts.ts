import {
  NWS_USER_AGENT,
  mapNwsAlerts,
  sortWeatherAlerts,
  type WeatherAlertsResponse,
} from "@homeslate/widgets/server";
import type { TtlCache } from "./ttlCache";

const NWS_ACTIVE_ALERTS_URL = "https://api.weather.gov/alerts/active";
const WEATHER_ALERTS_CACHE_TTL_MS = 120_000;
const UNAVAILABLE: WeatherAlertsResponse = { alerts: [], coverage: "unavailable" };

export function parseWeatherAlertPoint(
  latRaw: string | undefined,
  lonRaw: string | undefined,
): { lat: number; lon: number } | null {
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export async function fetchWeatherAlerts({
  lat,
  lon,
  fetchImpl = globalThis.fetch,
  cache,
  now,
}: {
  lat: number;
  lon: number;
  fetchImpl?: typeof fetch;
  cache: TtlCache<WeatherAlertsResponse>;
  now: number;
}): Promise<WeatherAlertsResponse> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = cache.get(cacheKey, now);
  if (cached) return cached;

  const url = new URL(NWS_ACTIVE_ALERTS_URL);
  url.searchParams.set("point", `${lat},${lon}`);
  const response = await fetchImpl(url, {
    headers: {
      "User-Agent": NWS_USER_AGENT,
      Accept: "application/geo+json",
    },
  });

  if (response.status === 400) {
    cache.set(cacheKey, UNAVAILABLE, WEATHER_ALERTS_CACHE_TTL_MS, now);
    return UNAVAILABLE;
  }
  if (!response.ok) throw new Error("NWS alerts request failed");

  const body: unknown = await response.json();
  if (emptyFeatures(body)) {
    cache.set(cacheKey, UNAVAILABLE, WEATHER_ALERTS_CACHE_TTL_MS, now);
    return UNAVAILABLE;
  }

  const result: WeatherAlertsResponse = {
    alerts: sortWeatherAlerts(mapNwsAlerts(body)),
    coverage: "us",
  };
  cache.set(cacheKey, result, WEATHER_ALERTS_CACHE_TTL_MS, now);
  return result;
}

function emptyFeatures(value: unknown): boolean {
  if (value === null || typeof value !== "object") return true;
  const features = (value as { features?: unknown }).features;
  return !Array.isArray(features) || features.length === 0;
}
