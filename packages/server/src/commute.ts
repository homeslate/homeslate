import { parseLatLon, type CommuteEstimate, type CommuteUnits } from "@homeslate/widgets/server";
import type { TtlCache } from "./ttlCache";

const OPENROUTESERVICE_BASE_URL = "https://api.openrouteservice.org";
const COMMUTE_CACHE_TTL_MS = 60_000;

type Coordinates = { lat: number; lon: number };

export async function estimateCommute({
  apiKey,
  origin,
  destination,
  units,
  fetchImpl = globalThis.fetch,
  cache,
  now,
}: {
  apiKey: string;
  origin: string;
  destination: string;
  units: CommuteUnits;
  fetchImpl?: typeof fetch;
  cache: TtlCache<CommuteEstimate>;
  now: number;
}): Promise<CommuteEstimate> {
  const cacheKey = `${origin}|${destination}|${units}`;
  const cached = cache.get(cacheKey, now);
  if (cached) return cached;

  const headers = { Authorization: apiKey };
  const start = parseLatLon(origin) ?? (await geocode(origin, headers, fetchImpl));
  const end = parseLatLon(destination) ?? (await geocode(destination, headers, fetchImpl));
  const url = new URL(`${OPENROUTESERVICE_BASE_URL}/v2/directions/driving-car`);
  url.searchParams.set("start", `${start.lon},${start.lat}`);
  url.searchParams.set("end", `${end.lon},${end.lat}`);

  const response = await fetchImpl(url, { headers });
  if (!response.ok) throw new Error("OpenRouteService directions failed");
  const body: unknown = await response.json();
  const summary = directionsSummary(body);
  if (!summary) throw new Error("OpenRouteService directions response was invalid");

  const estimate = {
    durationSeconds: summary.duration,
    distanceMeters: summary.distance,
  };
  cache.set(cacheKey, estimate, COMMUTE_CACHE_TTL_MS, now);
  return estimate;
}

async function geocode(
  place: string,
  headers: { Authorization: string },
  fetchImpl: typeof fetch,
): Promise<Coordinates> {
  const url = new URL(`${OPENROUTESERVICE_BASE_URL}/geocode/search`);
  url.searchParams.set("text", place);
  url.searchParams.set("size", "1");
  const response = await fetchImpl(url, { headers });
  if (!response.ok) throw new Error("OpenRouteService geocoding failed");
  const body: unknown = await response.json();
  const coordinates = geocodeCoordinates(body);
  if (!coordinates) throw new Error("OpenRouteService geocoding response was invalid");
  return coordinates;
}

function geocodeCoordinates(value: unknown): Coordinates | null {
  if (!isRecord(value) || !Array.isArray(value.features)) return null;
  const feature = value.features[0];
  if (!isRecord(feature) || !isRecord(feature.geometry)) return null;
  const coordinates = feature.geometry.coordinates;
  if (!Array.isArray(coordinates)) return null;
  const [lon, lat] = coordinates;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

function directionsSummary(value: unknown): { duration: number; distance: number } | null {
  if (!isRecord(value) || !Array.isArray(value.features)) return null;
  const feature = value.features[0];
  if (!isRecord(feature) || !isRecord(feature.properties)) return null;
  const summary = feature.properties.summary;
  if (!isRecord(summary)) return null;
  const { duration, distance } = summary;
  if (typeof duration !== "number" || typeof distance !== "number") return null;
  if (!Number.isFinite(duration) || !Number.isFinite(distance)) return null;
  return { duration, distance };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}
