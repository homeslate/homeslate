/** Normalized Home Assistant `update` state. */
export interface HomeAssistantUpdate {
  entityId: string;
  name: string;
  /** `on` = update available, `off` = up to date, or `unavailable`. */
  state: string;
  installedVersion: string | null;
  latestVersion: string | null;
  inProgress: boolean;
  /** 0–100 while installing. */
  updatePercentage: number | null;
  available: boolean;
}

export const UPDATES_EMPTY_COPY = "Pick updates to watch in settings.";
export const UPDATES_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";
export const UPDATES_UP_TO_DATE_COPY = "Everything is up to date.";

export function updateIsAvailable(update: HomeAssistantUpdate): boolean {
  return update.available && update.state === "on";
}

export function updateStateLabel(update: HomeAssistantUpdate): string {
  if (!update.available) return "Unavailable";
  if (update.inProgress) {
    return update.updatePercentage === null
      ? "Installing"
      : `Installing · ${Math.round(update.updatePercentage)}%`;
  }
  if (update.state === "on") return "Update available";
  if (update.state === "off") return "Up to date";
  return update.state;
}

/** `installed → latest`, or whichever version the entity reports. */
export function updateVersionLabel(update: HomeAssistantUpdate): string | null {
  if (update.installedVersion && update.latestVersion) {
    return `${update.installedVersion} → ${update.latestVersion}`;
  }
  return update.installedVersion ?? update.latestVersion;
}

/** Progress percentage while installing, or `null` when idle. */
export function updateProgressPct(update: HomeAssistantUpdate): number | null {
  if (!update.inProgress || update.updatePercentage === null) return null;
  return Math.min(100, Math.max(0, update.updatePercentage));
}
