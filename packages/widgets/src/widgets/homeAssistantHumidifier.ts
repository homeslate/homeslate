/** Normalized Home Assistant `humidifier` state. */
export interface HomeAssistantHumidifier {
  entityId: string;
  name: string;
  /** `on | off | unavailable | unknown`. */
  state: string;
  isOn: boolean;
  currentHumidity: number | null;
  targetHumidity: number | null;
  minHumidity: number;
  maxHumidity: number;
  mode: string | null;
  availableModes: string[];
  available: boolean;
}

export const HUMIDIFIER_EMPTY_COPY = "Pick a humidifier in settings.";
export const HUMIDIFIER_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

export function humidifierStateLabel(humidifier: HomeAssistantHumidifier): string {
  if (!humidifier.available) return "Unavailable";
  if (humidifier.isOn) {
    return humidifier.targetHumidity === null
      ? "On"
      : `On · ${Math.round(humidifier.targetHumidity)}%`;
  }
  return "Off";
}

export function clampHumidity(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function humidifierModeLabel(mode: string): string {
  const spaced = mode.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export type HumidifierSizeTier = "compact" | "medium" | "full";

export function getHumidifierSizeTier(width: number, height: number): HumidifierSizeTier {
  if (width <= 2 || height <= 2) return "compact";
  if (width >= 4 && height >= 4) return "full";
  return "medium";
}
