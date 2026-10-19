import type { HomeAssistantWaterHeater } from "../widgets/homeAssistantWaterHeater";

/** Entity-id shape for the `water_heater` domain. */
export const WATER_HEATER_ENTITY_ID = /^water_heater\.[a-z0-9_]+$/;

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

/** Map a raw `water_heater` state, or `null`. */
export function mapWaterHeaterEntity(raw: unknown): HomeAssistantWaterHeater | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!WATER_HEATER_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";
  const unit = attributes.temperature_unit === "C" ? "°C" : "°F";
  const step = finiteNumberOrNull(attributes.target_temp_step);

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    isOn: state !== "off" && state !== "unavailable" && state !== "unknown",
    currentTemperature: finiteNumberOrNull(attributes.current_temperature),
    targetTemperature: finiteNumberOrNull(attributes.temperature),
    minTemp: finiteNumberOrNull(attributes.min_temp) ?? (unit === "°C" ? 30 : 86),
    maxTemp: finiteNumberOrNull(attributes.max_temp) ?? (unit === "°C" ? 60 : 140),
    step: step && step > 0 ? step : 1,
    unit,
    operationMode: stringOrNull(attributes.operation_mode),
    operationModes: stringList(attributes.operation_list),
    available: state !== "unavailable" && state !== "unknown",
  };
}
