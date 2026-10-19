import type { HomeAssistantHumidifier } from "../widgets/homeAssistantHumidifier";

/** Entity-id shape for the `humidifier` domain. */
export const HUMIDIFIER_ENTITY_ID = /^humidifier\.[a-z0-9_]+$/;

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

/** Map a raw `humidifier` state, or `null`. */
export function mapHumidifierEntity(raw: unknown): HomeAssistantHumidifier | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!HUMIDIFIER_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    isOn: state === "on",
    currentHumidity: finiteNumberOrNull(attributes.current_humidity),
    targetHumidity: finiteNumberOrNull(attributes.humidity),
    minHumidity: finiteNumberOrNull(attributes.min_humidity) ?? 0,
    maxHumidity: finiteNumberOrNull(attributes.max_humidity) ?? 100,
    mode: stringOrNull(attributes.mode),
    availableModes: stringList(attributes.available_modes),
    available: state !== "unavailable" && state !== "unknown",
  };
}
