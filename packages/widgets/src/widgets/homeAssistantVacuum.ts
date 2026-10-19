/** Normalized Home Assistant `vacuum` state. */
export interface HomeAssistantVacuum {
  entityId: string;
  name: string;
  /** `cleaning | docked | returning | idle | paused | error | …`. */
  state: string;
  batteryLevel: number | null;
  fanSpeed: string | null;
  fanSpeedList: string[];
  supportedFeatures: number;
  available: boolean;
}

export const VACUUM_EMPTY_COPY = "Pick a vacuum in settings.";
export const VACUUM_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** Home Assistant vacuum feature bits. */
export const VACUUM_FEATURE = {
  turnOn: 1,
  turnOff: 2,
  pause: 4,
  stop: 8,
  returnHome: 16,
  fanSpeed: 32,
  battery: 64,
  cleanSpot: 128,
  map: 256,
  locate: 512,
  start: 1024,
  state: 2048,
} as const;

export function vacuumSupports(vacuum: HomeAssistantVacuum, feature: number): boolean {
  return (vacuum.supportedFeatures & feature) !== 0;
}

export function vacuumStateLabel(vacuum: HomeAssistantVacuum): string {
  if (!vacuum.available) return "Unavailable";
  switch (vacuum.state) {
    case "cleaning":
      return "Cleaning";
    case "docked":
      return "Docked";
    case "returning":
      return "Returning";
    case "paused":
      return "Paused";
    case "idle":
      return "Idle";
    case "error":
      return "Error";
    default:
      return vacuum.state;
  }
}

export function vacuumBatteryLabel(vacuum: HomeAssistantVacuum): string | null {
  return vacuum.batteryLevel === null ? null : `${Math.round(vacuum.batteryLevel)}%`;
}

export type VacuumSizeTier = "compact" | "medium" | "full";

export function getVacuumSizeTier(width: number, height: number): VacuumSizeTier {
  if (width <= 2 || height <= 2) return "compact";
  if (width >= 4 && height >= 4) return "full";
  return "medium";
}
