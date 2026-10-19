import {
  weatherConditionIsDay,
  type HomeAssistantWeatherEntity,
  type HomeAssistantWeatherForecast,
} from "../widgets/homeAssistantWeather";

/** Entity-id shape for the `weather` domain; also seeded into the registry. */
export const WEATHER_ENTITY_ID = /^weather\.[a-z0-9_]+$/;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Home Assistant reports `temperature_unit` as `°C` / `°F` (or `C` / `F`). */
function unitOf(value: unknown): "imperial" | "metric" {
  return value === "°F" || value === "F" ? "imperial" : "metric";
}

/** Map a raw `weather` entity state into the normalized current conditions. */
export function mapWeatherEntity(raw: unknown): HomeAssistantWeatherEntity | null {
  if (!raw || typeof raw !== "object") return null;
  const entity = raw as { entity_id?: unknown; state?: unknown; attributes?: unknown };
  const entityId = typeof entity.entity_id === "string" ? entity.entity_id : "";
  if (!WEATHER_ENTITY_ID.test(entityId)) return null;

  const attributes =
    entity.attributes && typeof entity.attributes === "object"
      ? (entity.attributes as Record<string, unknown>)
      : {};
  const state = typeof entity.state === "string" ? entity.state : "unknown";
  // Home Assistant stores the condition as the entity state; some integrations
  // also mirror it into an attribute.
  const condition = stringOrNull(attributes.condition) ?? state;

  return {
    entityId,
    name: stringOrNull(attributes.friendly_name) ?? entityId,
    state,
    condition,
    temperature: finiteNumberOrNull(attributes.temperature),
    unit: unitOf(attributes.temperature_unit),
    humidity: finiteNumberOrNull(attributes.humidity),
    pressure: finiteNumberOrNull(attributes.pressure),
    windSpeed: finiteNumberOrNull(attributes.wind_speed),
    windBearing: finiteNumberOrNull(attributes.wind_bearing),
    apparentTemperature: finiteNumberOrNull(attributes.apparent_temperature),
    isDay: weatherConditionIsDay(condition),
  };
}

/** Unwrap the service response, which HA nests under `service_response` on some paths. */
function serviceResponse(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const value = raw as Record<string, unknown>;
  const nested = value.service_response;
  if (nested && typeof nested === "object") return nested as Record<string, unknown>;
  return value;
}

/**
 * Map a raw `weather.get_forecasts` response into normalized entries. Accepts
 * the REST shape (`{ "weather.home": { forecast } }`), the websocket wrapper
 * (`{ service_response: {…} }`), or a bare `{ forecast }`.
 */
export function mapWeatherForecast(raw: unknown, entityId: string): HomeAssistantWeatherForecast[] {
  const response = serviceResponse(raw);
  const container = response[entityId];
  const forecast =
    container && typeof container === "object"
      ? (container as Record<string, unknown>).forecast
      : response.forecast;
  if (!Array.isArray(forecast)) return [];

  return forecast.flatMap((entry): HomeAssistantWeatherForecast[] => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const datetime = stringOrNull(record.datetime);
    if (!datetime) return [];
    const condition = stringOrNull(record.condition) ?? "unknown";
    return [
      {
        datetime,
        condition,
        temperature: finiteNumberOrNull(record.temperature),
        templow: finiteNumberOrNull(record.templow),
        precipitationProbability: finiteNumberOrNull(record.precipitation_probability),
        isDay: weatherConditionIsDay(condition),
      },
    ];
  });
}
