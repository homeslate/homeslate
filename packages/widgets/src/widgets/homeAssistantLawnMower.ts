/** Normalized Home Assistant `lawn_mower` state. */
export interface HomeAssistantLawnMower {
  entityId: string;
  name: string;
  /** `mowing | paused | docked | returning | error | unavailable | …`. */
  state: string;
  available: boolean;
}

export const LAWN_MOWER_EMPTY_COPY = "Pick a lawn mower in settings.";
export const LAWN_MOWER_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

export function lawnMowerStateLabel(mower: HomeAssistantLawnMower): string {
  if (!mower.available) return "Unavailable";
  switch (mower.state) {
    case "mowing":
      return "Mowing";
    case "paused":
      return "Paused";
    case "docked":
      return "Docked";
    case "returning":
      return "Returning";
    case "error":
      return "Error";
    default:
      return mower.state;
  }
}

export function lawnMowerIsActive(mower: HomeAssistantLawnMower): boolean {
  return mower.state === "mowing" || mower.state === "returning";
}
