const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;

const IMAGE_API_PATHS = new Set(["/api/homeassistant/image", "/api/photo-proxy"]);

/**
 * Same-origin image GETs that the service worker may store.
 * Service calls and other API responses are rejected.
 */
export function isImageCacheCandidate(url: URL, method = "GET", pageOrigin?: string): boolean {
  if (method !== "GET") return false;
  if (pageOrigin && url.origin !== pageOrigin) return false;
  if (url.pathname.startsWith("/api/homeassistant/services")) return false;
  if (IMAGE_API_PATHS.has(url.pathname)) return true;
  if (url.pathname.startsWith("/api/")) return false;
  return IMAGE_EXTENSION.test(url.pathname);
}
