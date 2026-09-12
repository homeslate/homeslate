export type WeatherAlertSeverity = "extreme" | "severe" | "moderate" | "minor" | "unknown";

export type WeatherAlert = {
  id: string;
  event: string;
  headline: string;
  severity: WeatherAlertSeverity;
  endsAt?: string;
};

export type WeatherAlertsResponse = {
  alerts: WeatherAlert[];
  coverage: "us" | "unavailable";
};

export const NWS_USER_AGENT = "Homeslate/0.1 (https://github.com/homeslate/homeslate)";

export const WEATHER_ALERTS_COVERAGE_COPY = "Alerts are available for US locations.";
export const WEATHER_ALERTS_EMPTY_COPY = "No active alerts";
export const WEATHER_ALERTS_NEED_LOCATION_COPY = "Search for a location";

const SEVERITY_RANK: Record<WeatherAlertSeverity, number> = {
  extreme: 0,
  severe: 1,
  moderate: 2,
  minor: 3,
  unknown: 4,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isSeverity(value: string): value is WeatherAlertSeverity {
  return value in SEVERITY_RANK;
}

export function mapNwsAlerts(geojson: unknown): WeatherAlert[] {
  if (!isRecord(geojson) || !Array.isArray(geojson.features)) return [];

  const alerts: WeatherAlert[] = [];
  for (const feature of geojson.features) {
    if (!isRecord(feature) || !isRecord(feature.properties)) continue;
    const { id, event, headline, severity, ends, expires } = feature.properties;
    if (typeof id !== "string" || id.length === 0) continue;
    if (typeof event !== "string" || event.length === 0) continue;

    const normalized = typeof severity === "string" ? severity.toLowerCase() : "unknown";
    const alert: WeatherAlert = {
      id,
      event,
      headline: typeof headline === "string" && headline.length > 0 ? headline : event,
      severity: isSeverity(normalized) ? normalized : "unknown",
    };
    const endsAt =
      typeof ends === "string" ? ends : typeof expires === "string" ? expires : undefined;
    if (endsAt !== undefined) alert.endsAt = endsAt;
    alerts.push(alert);
  }
  return alerts;
}

export function sortWeatherAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
  return [...alerts].sort((a, b) => {
    const rankDiff = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (rankDiff !== 0) return rankDiff;
    if (a.endsAt && b.endsAt) return a.endsAt.localeCompare(b.endsAt);
    if (a.endsAt) return -1;
    if (b.endsAt) return 1;
    return 0;
  });
}

export function formatAlertUntil(endsAt: string): string | undefined {
  const date = new Date(endsAt);
  if (Number.isNaN(date.getTime())) return undefined;
  return `until ${date.toLocaleTimeString([], { hour: "numeric", minute: "numeric" })}`;
}
