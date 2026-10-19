/** Normalized Home Assistant `camera` state. */
export interface HomeAssistantCamera {
  entityId: string;
  name: string;
  /** `idle | recording | streaming | unavailable | unknown | …`. */
  state: string;
  /** Host-relative HA image path, when the entity exposes one. */
  entityPicture: string | null;
  available: boolean;
}

export const CAMERA_EMPTY_COPY = "Pick a camera in settings.";
export const CAMERA_MISSING_CONFIG_COPY =
  "Set HOMEASSISTANT_BASE_URL and HOMEASSISTANT_TOKEN on the server.";
export const CAMERA_PRIVATE_COPY = "Camera hidden for privacy.";

/** Minimum and maximum snapshot refresh cadence, in seconds. */
export const CAMERA_MIN_REFRESH_SECONDS = 5;
export const CAMERA_MAX_REFRESH_SECONDS = 3600;

export function cameraStateLabel(camera: HomeAssistantCamera): string {
  if (!camera.available) return "Unavailable";
  switch (camera.state) {
    case "idle":
      return "Idle";
    case "recording":
      return "Recording";
    case "streaming":
      return "Streaming";
    default:
      return camera.state;
  }
}

/**
 * Same-origin proxy URL for a camera snapshot. The cache-busting parameter
 * only changes the browser URL; the host route ignores it and still caches the
 * actual snapshot.
 */
export function cameraSnapshotUrl(entityId: string, cacheBust?: number): string {
  const path = `/api/camera_proxy/${entityId}`;
  const base = `/api/homeassistant/image?path=${encodeURIComponent(path)}`;
  return typeof cacheBust === "number" ? `${base}&t=${Math.round(cacheBust)}` : base;
}

/** Refresh interval in ms, or `null` when refreshing is disabled. */
export function nextCameraRefreshMs(seconds: number): number | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const clamped = Math.min(
    CAMERA_MAX_REFRESH_SECONDS,
    Math.max(CAMERA_MIN_REFRESH_SECONDS, seconds),
  );
  return Math.round(clamped) * 1000;
}

/** Privacy mode suppresses snapshots entirely. */
export function shouldLoadCameraSnapshot(privacy: boolean): boolean {
  return !privacy;
}
