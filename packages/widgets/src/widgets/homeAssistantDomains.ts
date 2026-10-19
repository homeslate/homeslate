/**
 * Client-safe list of domains the Home Assistant registry knows about.
 *
 * Kept in sync with the server registry by `server/domains.test.ts`. The Entity
 * Tile settings picker uses it to list entities across the long tail.
 */
export const HOME_ASSISTANT_DOMAINS = [
  "climate",
  "todo",
  "sensor",
  "binary_sensor",
  "number",
  "input_number",
  "scene",
  "script",
  "button",
  "input_button",
  "person",
  "device_tracker",
  "zone",
  "weather",
  "calendar",
  "light",
  "switch",
  "input_boolean",
  "fan",
  "cover",
  "lock",
  "alarm_control_panel",
  "media_player",
  "vacuum",
  "humidifier",
  "water_heater",
  "camera",
  "update",
  "lawn_mower",
  "notify",
  "tts",
] as const;

export type HomeAssistantDomain = (typeof HOME_ASSISTANT_DOMAINS)[number];
