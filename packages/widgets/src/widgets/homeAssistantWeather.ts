/** Normalized Home Assistant `weather` entity state. */
export interface HomeAssistantWeatherEntity {
  entityId: string;
  name: string;
  state: string;
  condition: string;
  temperature: number | null;
  unit: "imperial" | "metric";
  humidity: number | null;
  pressure: number | null;
  windSpeed: number | null;
  windBearing: number | null;
  apparentTemperature: number | null;
  isDay: boolean;
}

/** One entry from `weather.get_forecasts`. */
export interface HomeAssistantWeatherForecast {
  /** ISO datetime from Home Assistant. */
  datetime: string;
  condition: string;
  temperature: number | null;
  templow: number | null;
  precipitationProbability: number | null;
  isDay: boolean;
}

export const WEATHER_EMPTY_COPY = "Pick a Home Assistant weather entity in settings.";
export const WEATHER_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/**
 * Map a Home Assistant weather condition onto a WMO-ish code so the existing
 * Weather widget's description/icon helpers work unchanged.
 */
export function weatherConditionCode(condition: string): number {
  switch (condition) {
    case "clear":
    case "sunny":
      return 0;
    case "clear-night":
      return 0;
    case "partlycloudy":
      return 2;
    case "cloudy":
      return 3;
    case "fog":
      return 45;
    case "hail":
      return 96;
    case "lightning":
    case "lightning-rainy":
      return 95;
    case "rainy":
    case "pouring":
      return 63;
    case "snowy":
    case "snowy-rainy":
      return 73;
    case "windy":
    case "windy-variant":
      return 3;
    case "exceptional":
      return 99;
    default:
      return 3;
  }
}

/** `clear-night` (and any condition HA flags in the future) reads as night. */
export function weatherConditionIsDay(condition: string): boolean {
  return condition !== "clear-night";
}
