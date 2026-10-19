/** Normalized Home Assistant `sensor` / `binary_sensor` / `number` reading. */
export interface HomeAssistantSensor {
  entityId: string;
  name: string;
  state: string;
  unit: string | null;
  deviceClass: string | null;
  icon: string | null;
  /** Finite numeric value parsed from `state`, or `null`. */
  numericValue: number | null;
  /** Binary-sensor convenience: `state === "on"`. */
  isOn: boolean;
}

export const SENSORS_EMPTY_COPY = "Pick a few sensors in settings.";
export const SENSORS_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

const OPEN_CLASSES = new Set(["door", "window", "garage_door", "opening"]);
const DETECTED_CLASSES = new Set([
  "motion",
  "occupancy",
  "presence",
  "smoke",
  "gas",
  "carbon_monoxide",
  "problem",
]);

/**
 * Human label for a binary sensor, tuned to the device class so a wall display
 * reads "Open" rather than "On" for a door.
 */
export function binarySensorLabel(deviceClass: string | null, isOn: boolean): string {
  if (OPEN_CLASSES.has(deviceClass ?? "")) return isOn ? "Open" : "Closed";
  if (deviceClass === "moisture") return isOn ? "Wet" : "Dry";
  if (deviceClass === "connectivity") return isOn ? "Connected" : "Disconnected";
  if (DETECTED_CLASSES.has(deviceClass ?? "")) return isOn ? "Detected" : "Clear";
  return isOn ? "On" : "Off";
}

/** Format a numeric sensor value with its unit, or fall back to the raw state. */
export function formatSensorValue(sensor: HomeAssistantSensor): string {
  if (sensor.numericValue !== null) {
    const rounded = Math.round(sensor.numericValue * 10) / 10;
    return sensor.unit ? `${rounded}${sensor.unit}` : String(rounded);
  }
  return sensor.unit ? `${sensor.state}${sensor.unit}` : sensor.state;
}
