import type { HomeAssistantVacuum } from "../widgets/homeAssistantVacuum";

/** Entity-id shape for the `vacuum` domain. */
export const VACUUM_ENTITY_ID = /^vacuum\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/** Map a raw `vacuum` state, or `null`. */
export function mapVacuumEntity(raw: unknown): HomeAssistantVacuum | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!VACUUM_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    batteryLevel: finiteNumberOrNull(attributes.battery_level),
    fanSpeed: stringOrNull(attributes.fan_speed),
    fanSpeedList: stringList(attributes.fan_speed_list),
    supportedFeatures: finiteNumberOrNull(attributes.supported_features) ?? 0,
    available: state !== "unavailable" && state !== "unknown",
  };
}
