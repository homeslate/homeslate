import type { TtlCache } from "./ttlCache";

/** How long a proxied Home Assistant image stays in the host cache. */
export const HOME_ASSISTANT_IMAGE_CACHE_TTL_MS = 60_000;
/** Refuse unusually large images rather than buffering them into the display. */
export const HOME_ASSISTANT_IMAGE_MAX_BYTES = 5_000_000;

export type HomeAssistantImage = {
  contentType: string;
  body: ArrayBuffer;
};

/** A route-level image proxy failure with an HTTP status. */
export class HomeAssistantImageError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HomeAssistantImageError";
  }
}

const IMAGE_ORIGIN = "http://homeassistant.invalid";
const IMAGE_PATH_PREFIXES = ["/api/media_player_proxy/", "/api/camera_proxy/"] as const;

/**
 * Normalize a host-relative Home Assistant image path, or return `null` when it
 * is not one of the two proxy paths homeslate re-serves. Accepts the signed
 * query string Home Assistant appends to `entity_picture`.
 */
export function normalizeHomeAssistantImagePath(raw: string): string | null {
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  // Reject backslashes before `URL` normalizes them into path separators.
  if (raw.includes("\\")) return null;

  let url: URL;
  try {
    url = new URL(raw, IMAGE_ORIGIN);
  } catch {
    return null;
  }
  if (url.origin !== IMAGE_ORIGIN) return null;
  // `URL` removes literal `..` segments, but percent-encoded dots survive and
  // could be decoded upstream. Refuse encoded separators outright.
  if (/%2e|%2f|%5c/i.test(url.pathname)) return null;
  if (!IMAGE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return null;
  return `${url.pathname}${url.search}`;
}

/** Only image content types are re-served; anything else becomes a binary blob. */
export function homeAssistantImageContentType(value: string | null): string {
  return value && value.startsWith("image/") ? value : "application/octet-stream";
}

/**
 * Fetch an image through a short-lived cache. The path is validated here again
 * so a caller cannot bypass the allowlist by skipping the route check.
 */
export async function loadHomeAssistantImage(options: {
  path: string;
  cache: TtlCache<HomeAssistantImage>;
  now: number;
  fetchImage: (path: string) => Promise<HomeAssistantImage>;
  ttlMs?: number;
  maxBytes?: number;
}): Promise<HomeAssistantImage> {
  const path = normalizeHomeAssistantImagePath(options.path);
  if (!path) throw new HomeAssistantImageError(400, "Invalid image path");

  const cached = options.cache.get(path, options.now);
  if (cached) return cached;

  const image = await options.fetchImage(path);
  if (image.body.byteLength > (options.maxBytes ?? HOME_ASSISTANT_IMAGE_MAX_BYTES)) {
    throw new HomeAssistantImageError(502, "Home Assistant image is too large");
  }
  const normalized = {
    contentType: homeAssistantImageContentType(image.contentType),
    body: image.body,
  };
  options.cache.set(
    path,
    normalized,
    options.ttlMs ?? HOME_ASSISTANT_IMAGE_CACHE_TTL_MS,
    options.now,
  );
  return normalized;
}
