import type { HomeAssistantSensor } from "../widgets/homeAssistantSensor";

/** Per-domain entity-id shapes for the read-only sensor family. */
export const SENSOR_DOMAIN_ENTITY_IDS = {
  sensor: /^sensor\.[a-z0-9_]+$/,
  binary_sensor: /^binary_sensor\.[a-z0-9_]+$/,
  number: /^number\.[a-z0-9_]+$/,
  input_number: /^input_number\.[a-z0-9_]+$/,
} as const;

const SENSOR_ENTITY_ID = /^(sensor|binary_sensor|number|input_number)\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Map a raw `sensor` / `binary_sensor` / `number` / `input_number` state into the
 * normalized reading the Sensors widget renders. Returns `null` for anything
 * outside that family.
 */
export function mapSensorEntity(raw: unknown): HomeAssistantSensor | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!SENSOR_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";
  const parsed = state.trim().length > 0 ? Number(state) : Number.NaN;

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    unit: stringOrNull(attributes.unit_of_measurement),
    deviceClass: stringOrNull(attributes.device_class),
    icon: stringOrNull(attributes.icon),
    numericValue: Number.isFinite(parsed) ? parsed : finiteNumberOrNull(attributes.value),
    isOn: state === "on",
  };
}
