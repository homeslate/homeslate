/** Domains the Devices widget can control. */
export type DeviceDomain = "light" | "switch" | "input_boolean" | "fan";

export const DEVICE_DOMAINS: readonly DeviceDomain[] = ["light", "switch", "input_boolean", "fan"];

/** Normalized Home Assistant device state for the Devices widget. */
export interface HomeAssistantDevice {
  entityId: string;
  name: string;
  domain: DeviceDomain;
  isOn: boolean;
  /** Light brightness as a percentage (0–100), or `null`. */
  brightnessPct: number | null;
  /** Fan speed as a percentage (0–100), or `null`. */
  percentage: number | null;
  supportedFeatures: number;
  /** `brightness` for lights; `toggle` for everything else. */
  control: "toggle" | "brightness";
  available: boolean;
}

export const DEVICES_EMPTY_COPY = "Pick lights, switches, or fans in settings.";
export const DEVICES_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** The allowlisted on/off service for a device. */
export function deviceService(domain: DeviceDomain, on: boolean): string {
  return on ? "turn_on" : "turn_off";
}

/** Optimistic fields the widget can merge before the next fetch lands. */
export type DeviceOverride = Partial<
  Pick<HomeAssistantDevice, "isOn" | "brightnessPct" | "percentage">
>;

/** Merge an optimistic override onto the last fetched device state. */
export function applyDeviceOverride(
  device: HomeAssistantDevice,
  override: DeviceOverride | undefined,
): HomeAssistantDevice {
  return override ? { ...device, ...override } : device;
}

/** Readable on/off label. */
export function deviceStatusLabel(device: HomeAssistantDevice): string {
  if (!device.available) return "Unavailable";
  return device.isOn ? "On" : "Off";
}

export type DevicesSizeTier = "compact" | "medium" | "full";

/** Compact = toggle chips; medium = chips + on count; full = + brightness. */
export function getDevicesSizeTier(width: number, height: number): DevicesSizeTier {
  if (width <= 2 || height <= 2) return "compact";
  if (width >= 4 && height >= 4) return "full";
  return "medium";
}
