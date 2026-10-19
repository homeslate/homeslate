import type { HomeAssistantAlarm } from "../widgets/homeAssistantAlarm";

/** Entity-id shape for the `alarm_control_panel` domain. */
export const ALARM_ENTITY_ID = /^alarm_control_panel\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Map a raw `alarm_control_panel` state, or `null`. */
export function mapAlarmEntity(raw: unknown): HomeAssistantAlarm | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!ALARM_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";

  return {
    kind: "alarm",
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    supportedFeatures: finiteNumberOrNull(attributes.supported_features) ?? 0,
    available: state !== "unavailable" && state !== "unknown",
  };
}
