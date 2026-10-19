import { downsampleHistory, type HomeAssistantHistoryPoint } from "../widgets/homeAssistantHistory";

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function timestampOf(entry: Record<string, unknown>): string | null {
  if (typeof entry.last_changed === "string" && entry.last_changed) return entry.last_changed;
  if (typeof entry.last_updated === "string" && entry.last_updated) return entry.last_updated;
  return null;
}

/**
 * Map a Home Assistant `/api/history/period` response into numeric points.
 * Accepts the REST shape (an array of per-entity arrays) or a flat array.
 */
export function mapHistoryPoints(raw: unknown, entityId: string): HomeAssistantHistoryPoint[] {
  if (!Array.isArray(raw)) return [];
  const groups = Array.isArray(raw[0]) ? raw : [raw];
  const entries = groups.flatMap((group) => (Array.isArray(group) ? group : []));

  const points = entries.flatMap((entry): HomeAssistantHistoryPoint[] => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.entity_id === "string" && record.entity_id !== entityId) return [];
    const at = timestampOf(record);
    const value = finiteNumber(record.state);
    if (!at || value === null) return [];
    return [{ at, value }];
  });

  points.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  return downsampleHistory(points);
}
