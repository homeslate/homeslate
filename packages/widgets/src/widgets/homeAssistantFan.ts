import type { HomeAssistantDevice } from "./homeAssistantDevice";

/** Normalized Home Assistant `fan` state, extending the on/off device shape. */
export interface HomeAssistantFan extends HomeAssistantDevice {
  domain: "fan";
  /** `off | on | unavailable | unknown`. */
  presetMode: string | null;
  presetModes: string[];
  oscillating: boolean | null;
}

export const FAN_EMPTY_COPY = "Pick a fan or air purifier in settings.";
export const FAN_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** Home Assistant fan feature bits. */
export const FAN_FEATURE_SET_SPEED = 1;
export const FAN_FEATURE_OSCILLATE = 2;
export const FAN_FEATURE_DIRECTION = 4;
export const FAN_FEATURE_PRESET_MODE = 8;

export function fanSupports(fan: HomeAssistantFan, feature: number): boolean {
  return (fan.supportedFeatures & feature) !== 0;
}

export function fanStateLabel(fan: HomeAssistantFan): string {
  if (!fan.available) return "Unavailable";
  if (!fan.isOn) return "Off";
  if (fan.percentage !== null) return `On · ${Math.round(fan.percentage)}%`;
  return "On";
}

export type FanSizeTier = "compact" | "medium" | "full";

export function getFanSizeTier(width: number, height: number): FanSizeTier {
  if (width <= 2 || height <= 2) return "compact";
  if (width >= 4 && height >= 4) return "full";
  return "medium";
}
