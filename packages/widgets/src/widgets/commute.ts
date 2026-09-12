export type CommuteUnits = "imperial" | "metric";

export type CommuteEstimate = {
  durationSeconds: number;
  distanceMeters: number;
  summary?: string;
};

export const COMMUTE_EMPTY_COPY = "Add a route in settings.";
export const COMMUTE_MISSING_KEY_COPY = "Set OPENROUTESERVICE_API_KEY on the server.";

export function formatCommuteDuration(durationSeconds: number): string {
  const totalMinutes = Math.floor(durationSeconds / 60);
  if (totalMinutes < 1) return "<1 min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

export function formatCommuteDistance(distanceMeters: number, units: CommuteUnits): string {
  const value = units === "imperial" ? distanceMeters / 1609.344 : distanceMeters / 1000;
  const label = units === "imperial" ? "mi" : "km";
  return `${value.toFixed(1)} ${label}`;
}

export function commuteApiUrl(origin: string, destination: string, units: CommuteUnits): string {
  const params = new URLSearchParams({ origin, destination, units });
  return `/api/commute?${params}`;
}

export class CommuteHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
