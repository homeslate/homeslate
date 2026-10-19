export interface HomeAssistantHistoryPoint {
  /** ISO timestamp of the state change. */
  at: string;
  value: number;
}

export const HISTORY_HOURS_DEFAULT = 24;
export const HISTORY_HOURS_MAX = 168;
export const HISTORY_MAX_POINTS = 240;

export const HISTORY_EMPTY_COPY = "Pick a numeric sensor in settings.";
export const HISTORY_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";
export const HISTORY_UNAVAILABLE_COPY = "History needs a direct Home Assistant connection.";

/** Clamp a requested window to the range the recorder can reasonably answer. */
export function clampHistoryHours(hours: number): number {
  if (!Number.isFinite(hours)) return HISTORY_HOURS_DEFAULT;
  return Math.min(HISTORY_HOURS_MAX, Math.max(1, Math.round(hours)));
}

/** Keep a long history payload cheap to render; keeps the first and last point. */
export function downsampleHistory(
  points: HomeAssistantHistoryPoint[],
  maxPoints = HISTORY_MAX_POINTS,
): HomeAssistantHistoryPoint[] {
  if (maxPoints <= 1 || points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const sampled: HomeAssistantHistoryPoint[] = [];
  for (let index = 0; index < points.length; index += step) {
    const point = points[index];
    if (point) sampled.push(point);
  }
  const last = points[points.length - 1];
  if (last && sampled[sampled.length - 1] !== last) sampled.push(last);
  return sampled;
}

export function historyRange(
  points: HomeAssistantHistoryPoint[],
): { min: number; max: number } | null {
  if (points.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const point of points) {
    if (point.value < min) min = point.value;
    if (point.value > max) max = point.value;
  }
  return { min, max };
}

export function historyLatest(points: HomeAssistantHistoryPoint[]): number | null {
  return points.length === 0 ? null : (points[points.length - 1]?.value ?? null);
}

/** SVG path for a sparkline inside a `width × height` viewBox. Empty for <2 points. */
export function buildSparklinePath(
  points: HomeAssistantHistoryPoint[],
  width: number,
  height: number,
): string {
  if (points.length < 2) return "";
  const range = historyRange(points);
  if (!range) return "";
  const span = range.max - range.min || 1;
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.value - range.min) / span) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function historyApiUrl(entityId: string, hours: number): string {
  return `/api/homeassistant/history/${encodeURIComponent(entityId)}?hours=${clampHistoryHours(hours)}`;
}

export function formatHistoryValue(value: number | null, unit: string | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  return unit ? `${rounded}${unit}` : String(rounded);
}
