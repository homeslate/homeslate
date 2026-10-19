import type { ThermostatState, ThermostatUnit } from "../widgets/homeAssistant";

/**
 * Home Assistant `climate` services the host proxy is willing to forward.
 * Everything else is rejected before any upstream call.
 */
export const CLIMATE_SERVICES = [
  "set_temperature",
  "set_hvac_mode",
  "set_fan_mode",
  "set_preset_mode",
  "set_swing_mode",
  "turn_on",
  "turn_off",
] as const;

/** Entity-id shape for the `climate` domain; also seeded into the registry. */
export const CLIMATE_ENTITY_ID = /^climate\.[a-z0-9_]+$/;

export function isValidClimateEntityId(id: string): boolean {
  return CLIMATE_ENTITY_ID.test(id);
}

export function isAllowedClimateService(service: string): boolean {
  return (CLIMATE_SERVICES as readonly string[]).includes(service);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function attributeObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/**
 * Allowed data keys per climate service. The domain registry uses this both to
 * decide which services are allowed and to build the outgoing payload.
 */
export const CLIMATE_SERVICE_KEYS: Record<string, readonly string[]> = {
  set_temperature: ["temperature", "target_temp_high", "target_temp_low"],
  set_hvac_mode: ["hvac_mode"],
  set_fan_mode: ["fan_mode"],
  set_preset_mode: ["preset_mode"],
  set_swing_mode: ["swing_mode"],
  turn_on: [],
  turn_off: [],
};

const NUMBER_SERVICE_KEYS = new Set(["temperature", "target_temp_high", "target_temp_low"]);

/**
 * Build the exact payload Home Assistant expects for a climate service call,
 * dropping unknown keys and rejecting missing/invalid required fields.
 */
export function buildClimateServicePayload(
  service: string,
  entityId: string,
  data: Record<string, unknown>,
): Record<string, unknown> | null {
  const keys = CLIMATE_SERVICE_KEYS[service];
  if (!keys || !isValidClimateEntityId(entityId)) return null;

  const payload: Record<string, unknown> = { entity_id: entityId };
  for (const key of keys) {
    const value = data[key];
    if (value === undefined) continue;
    if (NUMBER_SERVICE_KEYS.has(key)) {
      if (typeof value === "number" && Number.isFinite(value)) payload[key] = value;
    } else if (typeof value === "string" && value.length > 0) {
      payload[key] = value;
    }
  }

  if (
    service === "set_temperature" &&
    payload.temperature === undefined &&
    payload.target_temp_high === undefined &&
    payload.target_temp_low === undefined
  ) {
    return null;
  }

  return payload;
}

/** Map a raw Home Assistant state object into `ThermostatState`, or `null`. */
export function mapClimateEntity(raw: unknown): ThermostatState | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!isValidClimateEntityId(entityId)) return null;
  const attributes = attributeObject(entity.attributes);

  const unit: ThermostatUnit = attributes.temperature_unit === "C" ? "°C" : "°F";
  const step = finiteNumber(attributes.target_temp_step);
  const friendlyName = stringOrNull(attributes.friendly_name);

  return {
    entityId,
    name: friendlyName ?? entityId,
    hvacMode: typeof entity.state === "string" ? entity.state : "unknown",
    action: stringOrNull(attributes.hvac_action),
    currentTemperature: finiteNumber(attributes.current_temperature),
    currentHumidity: finiteNumber(attributes.current_humidity),
    targetTemperature: finiteNumber(attributes.temperature),
    targetTemperatureLow: finiteNumber(attributes.target_temp_low),
    targetTemperatureHigh: finiteNumber(attributes.target_temp_high),
    unit,
    hvacModes: stringList(attributes.hvac_modes),
    fanModes: stringList(attributes.fan_modes),
    fanMode: stringOrNull(attributes.fan_mode),
    presetModes: stringList(attributes.preset_modes),
    presetMode: stringOrNull(attributes.preset_mode),
    swingModes: stringList(attributes.swing_modes),
    swingMode: stringOrNull(attributes.swing_mode),
    minTemp: finiteNumber(attributes.min_temp) ?? (unit === "°C" ? 7 : 45),
    maxTemp: finiteNumber(attributes.max_temp) ?? (unit === "°C" ? 35 : 95),
    step: step && step > 0 ? step : 0.5,
  };
}
