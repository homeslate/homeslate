export type CommuteUnits = "imperial" | "metric";

const LAT_LON = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;

export function parseLatLon(value: string): { lat: number; lon: number } | null {
  const match = LAT_LON.exec(value);
  if (!match) return null;
  const lat = Number(match[1]);
  const lon = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export function parseCommuteQuery(query: {
  origin?: string;
  destination?: string;
  units?: string;
}): { ok: true; origin: string; destination: string; units: CommuteUnits } | { ok: false } {
  const origin = query.origin?.trim() ?? "";
  const destination = query.destination?.trim() ?? "";
  if (!origin || !destination) return { ok: false };
  const units = query.units ?? "imperial";
  if (units !== "imperial" && units !== "metric") return { ok: false };
  return { ok: true, origin, destination, units };
}
