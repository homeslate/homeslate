/** Normalized Home Assistant `cover` state. */
export interface HomeAssistantCover {
  entityId: string;
  name: string;
  /** `open | closed | opening | closing | …`. */
  state: string;
  /** 0–100, or `null` when the cover has no position. */
  position: number | null;
  /** `garage | door | shade | blind | window | …`. */
  deviceClass: string | null;
  supportedFeatures: number;
  isGarage: boolean;
  available: boolean;
}

export const COVERS_EMPTY_COPY = "Pick covers or garage doors in settings.";
export const COVERS_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";

/** Home Assistant cover feature bits. */
export const COVER_FEATURE_OPEN = 1;
export const COVER_FEATURE_CLOSE = 2;
export const COVER_FEATURE_SET_POSITION = 4;
export const COVER_FEATURE_STOP = 8;

export function coverSupports(cover: HomeAssistantCover, feature: number): boolean {
  return (cover.supportedFeatures & feature) !== 0;
}

/** Readable cover label: Open, Closed, Opening, Closing, or the raw state. */
export function coverStateLabel(cover: HomeAssistantCover): string {
  if (!cover.available) return "Unavailable";
  switch (cover.state) {
    case "open":
      return "Open";
    case "closed":
      return "Closed";
    case "opening":
      return "Opening";
    case "closing":
      return "Closing";
    default:
      return cover.state;
  }
}

/** Whether the cover should read as open (including mid-open). */
export function coverIsOpen(cover: HomeAssistantCover): boolean {
  return cover.state === "open" || cover.state === "opening";
}

/** Garage doors get a confirmation before opening. */
export function coverNeedsOpenConfirm(cover: HomeAssistantCover): boolean {
  return cover.isGarage;
}

export type CoversSizeTier = "compact" | "medium" | "full";

/** Compact = state + open/close; medium = + position; full = + slider. */
export function getCoversSizeTier(width: number, height: number): CoversSizeTier {
  if (width <= 2 || height <= 2) return "compact";
  if (width >= 4 && height >= 4) return "full";
  return "medium";
}
