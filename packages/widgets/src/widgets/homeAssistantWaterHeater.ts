/** Normalized Home Assistant `water_heater` state. */
export interface HomeAssistantWaterHeater {
  entityId: string;
  name: string;
  /** `on | off | eco | performance | heat_pump | …`. */
  state: string;
  isOn: boolean;
  currentTemperature: number | null;
  targetTemperature: number | null;
  minTemp: number;
  maxTemp: number;
  step: number;
  unit: "°C" | "°F";
  operationMode: string | null;
  operationModes: string[];
  available: boolean;
}

export const WATER_HEATER_EMPTY_COPY = "Pick a water heater in settings.";
export const WATER_HEATER_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

export function waterHeaterStateLabel(waterHeater: HomeAssistantWaterHeater): string {
  if (!waterHeater.available) return "Unavailable";
  if (!waterHeater.isOn) return "Off";
  return waterHeater.operationMode ? waterHeaterModeLabel(waterHeater.operationMode) : "On";
}

export function waterHeaterModeLabel(mode: string): string {
  const spaced = mode.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function waterHeaterTemperatureLabel(waterHeater: HomeAssistantWaterHeater): string {
  if (waterHeater.targetTemperature === null) return "—";
  return `${Math.round(waterHeater.targetTemperature * 10) / 10}${waterHeater.unit}`;
}

export function clampWaterHeaterTemperature(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type WaterHeaterSizeTier = "compact" | "medium" | "full";

export function getWaterHeaterSizeTier(width: number, height: number): WaterHeaterSizeTier {
  if (width <= 2 || height <= 2) return "compact";
  if (width >= 4 && height >= 4) return "full";
  return "medium";
}
