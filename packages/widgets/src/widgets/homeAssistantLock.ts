/** Normalized Home Assistant `lock` state. */
export interface HomeAssistantLock {
  kind: "lock";
  entityId: string;
  name: string;
  /** `locked | unlocked | locking | unlocking | jammed | open | opening | …`. */
  state: string;
  isLocked: boolean;
  supportsOpen: boolean;
  available: boolean;
}

export const SECURITY_EMPTY_COPY = "Pick locks or an alarm panel in settings.";
export const SECURITY_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** Home Assistant lock feature bit: unlatch / open. */
export const LOCK_FEATURE_OPEN = 1;

export function lockSupportsOpen(lock: HomeAssistantLock): boolean {
  return lock.supportsOpen;
}

export function lockStateLabel(lock: HomeAssistantLock): string {
  if (!lock.available) return "Unavailable";
  switch (lock.state) {
    case "locked":
      return "Locked";
    case "unlocked":
      return "Unlocked";
    case "locking":
      return "Locking";
    case "unlocking":
      return "Unlocking";
    case "jammed":
      return "Jammed";
    case "open":
      return "Open";
    case "opening":
      return "Opening";
    default:
      return lock.state;
  }
}

export type SecurityTone = "success" | "danger" | "warning" | "neutral";

export function lockTone(lock: HomeAssistantLock): SecurityTone {
  if (!lock.available) return "neutral";
  if (lock.state === "locked") return "success";
  if (lock.state === "locking" || lock.state === "unlocking") return "warning";
  return "danger";
}

/** Unlatching and unlocking both warrant a confirmation step. */
export function lockNeedsConfirm(
  lock: HomeAssistantLock,
  action: "lock" | "unlock" | "open",
): boolean {
  return action !== "lock" && lock.available;
}
