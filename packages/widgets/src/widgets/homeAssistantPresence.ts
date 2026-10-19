/** Normalized Home Assistant `person` / `device_tracker` / `zone` state. */
export interface HomeAssistantPresence {
  entityId: string;
  name: string;
  /** `home`, `not_home`, or the zone's friendly name. */
  state: string;
  isHome: boolean;
  /** Zone name when the person is in a named zone, else `null`. */
  zoneName: string | null;
  entityPicture: string | null;
}

export const PRESENCE_EMPTY_COPY = "Pick who to show in settings.";
export const PRESENCE_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** Readable presence label: Home, Away, or the zone name. */
export function presenceLabel(presence: HomeAssistantPresence): string {
  if (presence.isHome) return "Home";
  if (presence.state === "not_home") return "Away";
  return presence.zoneName ?? presence.state;
}
